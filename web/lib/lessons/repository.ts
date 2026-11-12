import "server-only";
import { Types } from "mongoose";
import { connectMongo } from "../db/connection";
import { LessonRequestModel } from "../db/models";
import {
  assertValid,
  validateStoryProject,
  type AdultUserId,
  type IsoTimestamp,
  type StoryProject,
  type StoryProjectId,
} from "../domain";
import type { LessonDraftInput } from "./validation";

type LessonRow = {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  learnerLevel: StoryProject["learnerLevel"];
  subjectKey: string;
  topicKey: string;
  language: StoryProject["locale"];
  instruction: string;
  taxonomySource?: StoryProject["taxonomySource"];
  creativePreferences?: string[];
  status: StoryProject["status"];
  inputRevision: number;
  currentPlanVersion: number;
  createdAt: Date;
  updatedAt: Date;
};

const domain = (row: LessonRow): StoryProject => ({
  id: row._id.toHexString() as StoryProjectId,
  ownerId: row.ownerId.toHexString() as AdultUserId,
  learnerLevel: row.learnerLevel,
  subjectKey: row.subjectKey,
  topicKey: row.topicKey,
  locale: row.language,
  instruction: row.instruction,
  ...(row.taxonomySource ? { taxonomySource: row.taxonomySource } : {}),
  ...(row.creativePreferences?.length ? { creativePreferences: [...row.creativePreferences] } : {}),
  status: row.status,
  inputRevision: row.inputRevision,
  currentStoryboardVersion: row.currentPlanVersion,
  createdAt: row.createdAt.toISOString() as IsoTimestamp,
  updatedAt: row.updatedAt.toISOString() as IsoTimestamp,
});

export async function createLessonDraft(
  ownerId: string,
  input: LessonDraftInput,
): Promise<StoryProject> {
  await connectMongo();
  const id = new Types.ObjectId();
  const now = new Date();
  const project: StoryProject = {
    id: id.toHexString() as StoryProjectId,
    ownerId: ownerId as AdultUserId,
    learnerLevel: input.learnerLevel,
    subjectKey: input.subjectKey,
    topicKey: input.topicKey,
    locale: input.locale,
    instruction: input.instruction,
    taxonomySource: input.taxonomySource,
    ...(input.creativePreferences.length
      ? { creativePreferences: input.creativePreferences }
      : {}),
    status: "DRAFT",
    inputRevision: 1,
    currentStoryboardVersion: 0,
    createdAt: now.toISOString() as IsoTimestamp,
    updatedAt: now.toISOString() as IsoTimestamp,
  };
  assertValid(validateStoryProject(project));
  const row = (await LessonRequestModel.create({
    _id: id,
    ownerId: new Types.ObjectId(ownerId),
    learnerLevel: input.learnerLevel,
    subjectKey: input.subjectKey,
    topicKey: input.topicKey,
    language: input.locale,
    instruction: input.instruction,
    taxonomySource: input.taxonomySource,
    ...(input.creativePreferences.length
      ? { creativePreferences: input.creativePreferences }
      : {}),
    status: "DRAFT",
    inputRevision: 1,
    currentPlanVersion: 0,
    createdAt: now,
    updatedAt: now,
  })) as unknown as LessonRow;
  return domain(row);
}

export async function findRecentOwnedProjects(
  ownerId: string,
  limit = 8,
): Promise<StoryProject[]> {
  if (!Types.ObjectId.isValid(ownerId)) return [];
  await connectMongo();
  const rows = (await LessonRequestModel.find({ ownerId: new Types.ObjectId(ownerId) })
    .sort({ updatedAt: -1, _id: -1 })
    .limit(Math.min(Math.max(limit, 1), 20))
    .lean()) as unknown as LessonRow[];
  return rows.map(domain);
}

export async function findOwnedProject(
  ownerId: string,
  projectId: string,
): Promise<StoryProject | null> {
  if (!Types.ObjectId.isValid(ownerId) || !Types.ObjectId.isValid(projectId)) return null;
  await connectMongo();
  const row = (await LessonRequestModel.findOne({
    _id: new Types.ObjectId(projectId),
    ownerId: new Types.ObjectId(ownerId),
  }).lean()) as LessonRow | null;
  return row ? domain(row) : null;
}
