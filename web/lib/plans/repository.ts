import "server-only";
import { createHash } from "node:crypto";
import { Types } from "mongoose";
import { connectMongo } from "../db/connection";
import { AssetModel, GenerationJobModel, LessonRequestModel, VideoPlanModel } from "../db/models";
import type { PlanReview } from "../ai";
import type { NormalizedPlanDraft, ProviderUsage, StoryProject, StoryboardVersion } from "../domain";

export const hashValue = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export async function approvedAssetKeys(): Promise<string[]> {
  await connectMongo();
  const rows = await AssetModel.find({ approvalState: "APPROVED" }).select({ logicalKey: 1 }).lean() as unknown as {logicalKey:string}[];
  return rows.map((row) => row.logicalKey);
}

export async function findLatestOwnedPlan(ownerId: string, projectId: string): Promise<StoryboardVersion | null> {
  if (!Types.ObjectId.isValid(ownerId) || !Types.ObjectId.isValid(projectId)) return null;
  await connectMongo();
  const row = await VideoPlanModel.findOne({ ownerId: new Types.ObjectId(ownerId), lessonRequestId: new Types.ObjectId(projectId) }).sort({ version: -1 }).lean();
  return row ? planDomain(row as never) : null;
}

const MAX_PLANNING_ATTEMPTS = 3;
/** Longer than two bounded provider calls (creator + reviewer) plus persistence. */
export const STALE_PLANNING_JOB_MS = 4 * 60 * 1000;
export const isStaleRunningJob = (job: { state?: string; updatedAt?: Date }, now = Date.now()) =>
  job.state === "RUNNING" && !!job.updatedAt && now - new Date(job.updatedAt).getTime() > STALE_PLANNING_JOB_MS;

export async function createPlanningJob(ownerId: string, project: StoryProject, inputHash: string) {
  await connectMongo();
  const idempotencyKey = `plan:${project.id}:${inputHash}`;
  let existing = await GenerationJobModel.findOne({ idempotencyKey }).lean();
  if (existing && isStaleRunningJob(existing as { state?: string; updatedAt?: Date })) {
    // The request that owned this job died (server restart, closed tab, crash) without
    // recording an outcome. Mark it failed so a bounded retry can take over.
    await failPlanning(project.id, inputHash, "STALE_JOB", true);
    existing = await GenerationJobModel.findOne({ idempotencyKey }).lean();
  }
  if (existing) {
    const prior=existing as {state?:string;attempts?:unknown[]};
    if(prior.state==="FAILED"&&(prior.attempts?.length??0)<MAX_PLANNING_ATTEMPTS){
      const now=new Date(),attempt=(prior.attempts?.length??0)+1;
      const retried=await GenerationJobModel.findOneAndUpdate({idempotencyKey,state:"FAILED"},{$set:{state:"RUNNING",stage:"PLANNING",error:null,startedAt:now,finishedAt:null,updatedAt:now},$push:{attempts:{number:attempt,stage:"PLANNING",startedAt:now,outcome:"RUNNING"}}},{new:true}).lean();
      if(retried){await LessonRequestModel.collection.updateOne({_id:new Types.ObjectId(project.id),ownerId:new Types.ObjectId(ownerId)},{$set:{status:"PLANNING",updatedAt:now}});return {created:true,job:retried}}
    }
    return { created: false, job: existing };
  }
  const now = new Date();
  try {
    const job = await GenerationJobModel.create({ ownerId: new Types.ObjectId(ownerId), lessonRequestId: new Types.ObjectId(project.id), type: "PLAN_GENERATION", state: "RUNNING", stage: "PLANNING", idempotencyKey, inputHash, attempts: [{ number: 1, stage: "PLANNING", startedAt: now, outcome: "RUNNING" }], usage: [], createdAt: now, updatedAt: now, startedAt: now });
    await LessonRequestModel.collection.updateOne({ _id: new Types.ObjectId(project.id), ownerId:new Types.ObjectId(ownerId), status: { $in: ["DRAFT", "REVIEW_READY", "APPROVED"] } }, { $set: { status: "PLANNING", updatedAt: now } });
    return { created: true, job: job.toObject() };
  } catch (error) {
    if ((error as {code?:number}).code === 11000) return { created: false, job: await GenerationJobModel.findOne({ idempotencyKey }).lean() };
    throw error;
  }
}

export async function completePlanning(ownerId: string, project: StoryProject, draft: NormalizedPlanDraft, review: PlanReview, deterministicValid: boolean, contentHash: string, usage: ProviderUsage[], inputHash: string): Promise<StoryboardVersion> {
  await connectMongo();
  const latest = await VideoPlanModel.findOne({ lessonRequestId: project.id }).sort({ version: -1 }).select({ version: 1 }).lean() as {version?:number}|null;
  const version = (latest?.version ?? 0) + 1;
  const now = new Date();
  const status = deterministicValid && review.disposition !== "BLOCK" ? "REVIEW_READY" : "INVALID";
  const requestedKeys=[...new Set(draft.scenes.flatMap(scene=>scene.assets.map(asset=>asset.logicalKey)))];
  const assetRows=requestedKeys.length?await AssetModel.find({logicalKey:{$in:requestedKeys},approvalState:"APPROVED"}).select({_id:1,logicalKey:1,version:1}).lean() as unknown as {_id:Types.ObjectId;logicalKey:string;version:number}[]:[];
  const assetIds=new Map(assetRows.map(asset=>[`${asset.logicalKey}@${asset.version}`,asset._id]));
  const scenes = draft.scenes.map((scene, order) => ({ id: `scene-${version}-${order + 1}`, order, ...scene, assets:scene.assets.map(asset=>({...asset,assetId:assetIds.get(`${asset.logicalKey}@${asset.version}`)})).filter(asset=>asset.assetId), captionCues: [{ text: scene.narration, startMs: 0, endMs: scene.estimatedDurationMs }] }));
  const validation = { schemaValid: true, deterministicValid, semanticDisposition: review.disposition, summary: review.summary, findings: review.findings };
  const row = await VideoPlanModel.create({ ownerId: new Types.ObjectId(ownerId), lessonRequestId: new Types.ObjectId(project.id), schemaVersion: "1.0", version, language: draft.locale, title: draft.title, learningObjective: draft.learningObjective, presentationMode: draft.presentationMode, explanationApproach: draft.explanationApproach, ...(draft.storyPremise ? { storyPremise: draft.storyPremise } : {}), scenes, status, contentHash, validation, createdAt: now });
  await LessonRequestModel.collection.updateOne({ _id: new Types.ObjectId(project.id), ownerId:new Types.ObjectId(ownerId) }, { $set: { status: status === "REVIEW_READY" ? "REVIEW_READY" : "DRAFT", currentPlanVersion: version, updatedAt: now } });
  await GenerationJobModel.collection.updateOne({ idempotencyKey: `plan:${project.id}:${inputHash}`, "attempts.outcome":"RUNNING" }, { $set: { state: "SUCCEEDED", stage: "SEMANTIC_REVIEW", usage, finishedAt: now, updatedAt: now, "attempts.$.finishedAt": now, "attempts.$.outcome": "SUCCEEDED" } });
  return planDomain(row.toObject() as never);
}

export async function failPlanning(projectId: string, inputHash: string, code: string, retryable: boolean) {
  const now = new Date();
  await connectMongo();
  await GenerationJobModel.collection.updateOne({ idempotencyKey: `plan:${projectId}:${inputHash}`, "attempts.outcome":"RUNNING" }, { $set: { state: "FAILED", error: { code, stage: "PLANNING", retryable, safeMessage: "AI planning is temporarily unavailable." }, finishedAt: now, updatedAt: now, "attempts.$.finishedAt": now, "attempts.$.outcome": "FAILED" } });
  const latest=await VideoPlanModel.findOne({lessonRequestId:new Types.ObjectId(projectId)}).sort({version:-1}).select({status:1,version:1}).lean() as unknown as {status?:string;version?:number}|null;
  const restoredStatus=latest?.status==="APPROVED"?"APPROVED":latest?.status==="REVIEW_READY"?"REVIEW_READY":"DRAFT";
  await LessonRequestModel.collection.updateOne({ _id: new Types.ObjectId(projectId), status: "PLANNING" }, { $set: { status: restoredStatus, ...(latest?.version?{currentPlanVersion:latest.version}:{}), updatedAt: now } });
}

export async function approveOwnedPlan(ownerId: string, projectId: string, planId: string) {
  if (![ownerId, projectId, planId].every(Types.ObjectId.isValid)) return null;
  await connectMongo();
  const now = new Date();
  const project=await LessonRequestModel.findOne({_id:projectId,ownerId}).select({currentPlanVersion:1}).lean() as unknown as {currentPlanVersion?:number}|null;
  if(!project?.currentPlanVersion)return null;
  const owner = new Types.ObjectId(ownerId), project_ = new Types.ObjectId(projectId), plan_ = new Types.ObjectId(planId);
  const scope = { _id: plan_, ownerId: owner, lessonRequestId: project_, version: project.currentPlanVersion };
  // Idempotent: a repeat click on the already-approved current version succeeds and repairs
  // any follow-up write that did not complete the first time.
  const plan =
    (await VideoPlanModel.findOneAndUpdate({ ...scope, status: "REVIEW_READY" }, { $set: { status: "APPROVED", approvedBy: owner, approvedAt: now } }, { returnDocument: "after" }).lean()) ??
    (await VideoPlanModel.findOne({ ...scope, status: "APPROVED" }).lean());
  if (!plan) return null;
  await VideoPlanModel.collection.updateMany({ ownerId: owner, lessonRequestId: project_, _id: { $ne: plan_ }, status: "REVIEW_READY" }, { $set: { status: "SUPERSEDED" } });
  await LessonRequestModel.collection.updateOne({ _id: project_, ownerId: owner }, { $set: { status: "APPROVED", updatedAt: now } });
  return planDomain(plan as never);
}

function planDomain(row: Record<string, any>): StoryboardVersion {
  return { id: String(row._id) as StoryboardVersion["id"], projectId: String(row.lessonRequestId) as StoryboardVersion["projectId"], ownerId: String(row.ownerId) as StoryboardVersion["ownerId"], schemaVersion: "1.0", version: row.version, locale: row.language, title: row.title, learningObjective: row.learningObjective, presentationMode: row.presentationMode, explanationApproach: row.explanationApproach, ...(row.storyPremise ? {storyPremise:row.storyPremise}:{}), scenes: row.scenes.map((scene:Record<string,any>)=>({ ...scene, id: scene.id as never })), status: row.status, contentHash: row.contentHash, validation: row.validation, approvedBy: row.approvedBy ? String(row.approvedBy) as never : undefined, approvedAt: row.approvedAt?.toISOString() as never, createdAt: row.createdAt.toISOString() as never };
}

export type DeleteProjectResult = "DELETED" | "NOT_FOUND" | "BUSY";

/** Owner-scoped hard delete of an idea and its plans/jobs. No media exists for drafts yet. */
export async function deleteOwnedProject(ownerId: string, projectId: string): Promise<DeleteProjectResult> {
  if (!Types.ObjectId.isValid(ownerId) || !Types.ObjectId.isValid(projectId)) return "NOT_FOUND";
  await connectMongo();
  const owner = new Types.ObjectId(ownerId), id = new Types.ObjectId(projectId);
  if (!(await LessonRequestModel.exists({ _id: id, ownerId: owner }))) return "NOT_FOUND";
  // Refuse while a live planning call could still write a plan for this idea.
  const running = await GenerationJobModel.find({ ownerId: owner, lessonRequestId: id, state: "RUNNING" }).select({ state: 1, updatedAt: 1 }).lean() as { state?: string; updatedAt?: Date }[];
  if (running.some((job) => !isStaleRunningJob(job))) return "BUSY";
  await VideoPlanModel.deleteMany({ ownerId: owner, lessonRequestId: id });
  await GenerationJobModel.deleteMany({ ownerId: owner, lessonRequestId: id });
  await LessonRequestModel.deleteOne({ _id: id, ownerId: owner });
  return "DELETED";
}
