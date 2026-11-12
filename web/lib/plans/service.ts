import "server-only";
import { AiProviderError, GroqPlanReviewer, type LessonPlanningInput } from "../ai";
import { CloudflarePlanCreator } from "../ai/cloudflare";
import { readPlanningAiConfig } from "../ai/config";
import { CINEMATIC_ACTION_TYPES, validateEducationalFact, type IsoTimestamp, type ProviderUsage, type StoryboardVersion } from "../domain";
import { findOwnedProject } from "../lessons";
import { deterministicFactsFromInstruction, planMatchesExpectedFacts } from "./facts";
import { approvedAssetKeys, completePlanning, createPlanningJob, failPlanning, findLatestOwnedPlan, hashValue } from "./repository";

export class PlanningError extends Error { constructor(public readonly code:string, public readonly safeMessage:string, public readonly status=500){super(code)} }

export async function generateOwnedPlan(ownerId:string, projectId:string, revisionRequest?:string):Promise<StoryboardVersion> {
  const project=await findOwnedProject(ownerId,projectId);
  if(!project) throw new PlanningError("NOT_FOUND","Learning idea not found.",404);
  const revision=revisionRequest?.trim();
  if(revision && (revision.length<5 || revision.length>500)) throw new PlanningError("INVALID_REVISION","Describe the change in 5–500 characters.",400);
  const inputHash=hashValue({projectId,inputRevision:project.inputRevision,revision:revision??""});
  try{
    const job=await createPlanningJob(ownerId,project,inputHash);
    if(!job.created){ const existing=await findLatestOwnedPlan(ownerId,projectId); if(existing && (job.job as {state?:string})?.state==="SUCCEEDED") return existing; throw new PlanningError("PLANNING_IN_PROGRESS","We’re still writing this one. Please check back in a minute.",409); }
    const config=readPlanningAiConfig(); const facts=deterministicFactsFromInstruction(project.instruction);
    const instruction=revision ? `${project.instruction}\n\nAdult revision request: ${revision}` : project.instruction;
    const input:LessonPlanningInput={learnerLevel:project.learnerLevel,locale:project.locale,subjectKey:project.subjectKey,topicKey:project.topicKey,instruction,deterministicFacts:facts.promptFacts,allowedAssetKeys:await approvedAssetKeys(),allowedActionTypes:CINEMATIC_ACTION_TYPES};
    const creator=new CloudflarePlanCreator(config.cloudflare),reviewer=new GroqPlanReviewer(config.groq);
    const startPlan=Date.now(); const draft=await creator.createPlan(input); const planMs=Date.now()-startPlan;
    const generatedFacts=draft.scenes.flatMap(scene=>scene.facts);
    const deterministicValid=planMatchesExpectedFacts(facts.expectedFacts,generatedFacts)&&generatedFacts.every((fact,index)=>validateEducationalFact(fact,`facts[${index}]`).length===0);
    const startReview=Date.now(); const review=await reviewer.reviewPlan(input,draft); const reviewMs=Date.now()-startReview;
    const contentHash=hashValue(draft); const now=new Date().toISOString() as IsoTimestamp;
    const usage:ProviderUsage[]=[{provider:"cloudflare",operation:"PLAN",model:config.cloudflare.model,attempt:1,requestCount:1,latencyMs:planMs,cacheHit:false,estimatedCostMinor:0,currency:"USD",pricingSnapshot:"UNPRICED_RUNTIME_USAGE",recordedAt:now},{provider:"groq",operation:"REVIEW",model:config.groq.model,attempt:1,requestCount:1,latencyMs:reviewMs,cacheHit:false,estimatedCostMinor:0,currency:"USD",pricingSnapshot:"UNPRICED_RUNTIME_USAGE",recordedAt:now}];
    return await completePlanning(ownerId,project,draft,review,deterministicValid,contentHash,usage,inputHash);
  }catch(error){
    const provider=error instanceof AiProviderError?error.failure:undefined;
    if(error instanceof PlanningError)throw error;
    const code=error instanceof Error&&error.message.startsWith("AI_CONFIG_MISSING")?"AI_NOT_CONFIGURED":provider?.safeCode??"PLANNING_FAILED";
    try{await failPlanning(projectId,inputHash,code,provider?.retryable??false)}catch{console.error(`[planning] failed to finalize job (${code})`)}
    console.error(`[planning] request failed safely (${code})`);
    throw new PlanningError(code,code==="AI_NOT_CONFIGURED"?"AI planning is not configured yet.":"We couldn’t write this one right now. Your idea is saved, so please try again.",503);
  }
}
