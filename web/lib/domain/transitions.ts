import type { GenerationJob, GenerationJobState, StoryProject, StoryboardVersion } from "./types";
export class InvalidTransitionError extends Error {
  constructor(
    public readonly entity: string,
    public readonly from: string,
    public readonly to: string,
  ) {
    super(`Invalid ${entity} transition: ${from} -> ${to}`);
  }
}
const JOB: Readonly<Record<GenerationJobState, readonly GenerationJobState[]>> = {
  QUEUED: ["CLAIMED", "CANCELLED"],
  CLAIMED: ["RUNNING", "QUEUED", "CANCEL_REQUESTED"],
  RUNNING: ["WAITING_RETRY", "SUCCEEDED", "FAILED", "CANCEL_REQUESTED"],
  WAITING_RETRY: ["QUEUED", "FAILED", "CANCEL_REQUESTED"],
  CANCEL_REQUESTED: ["CANCELLED", "FAILED"],
  SUCCEEDED: [],
  FAILED: [],
  CANCELLED: [],
};
const PROJECT: Readonly<Record<StoryProject["status"], readonly StoryProject["status"][]>> = {
  DRAFT: ["PLANNING", "ARCHIVED"],
  PLANNING: ["DRAFT", "REVIEW_READY", "ARCHIVED"],
  REVIEW_READY: ["PLANNING", "APPROVED", "ARCHIVED"],
  APPROVED: ["PLANNING", "ARCHIVED"],
  ARCHIVED: [],
};
const PLAN: Readonly<Record<StoryboardVersion["status"], readonly StoryboardVersion["status"][]>> =
  {
    GENERATING: ["INVALID", "REVIEW_READY"],
    INVALID: [],
    REVIEW_READY: ["APPROVED", "SUPERSEDED"],
    APPROVED: ["SUPERSEDED"],
    SUPERSEDED: [],
  };
function ensure<T extends string>(
  entity: string,
  from: T,
  to: T,
  map: Readonly<Record<T, readonly T[]>>,
) {
  if (from !== to && !map[from].includes(to)) throw new InvalidTransitionError(entity, from, to);
}
export function transitionJob(
  job: GenerationJob,
  next: GenerationJobState,
  updatedAt: GenerationJob["updatedAt"],
): GenerationJob {
  ensure("job", job.state, next, JOB);
  const terminal = next === "SUCCEEDED" || next === "FAILED" || next === "CANCELLED";
  return {
    ...job,
    state: next,
    updatedAt,
    startedAt: next === "RUNNING" ? (job.startedAt ?? updatedAt) : job.startedAt,
    finishedAt: terminal ? updatedAt : undefined,
    cancelRequestedAt:
      next === "CANCEL_REQUESTED" ? (job.cancelRequestedAt ?? updatedAt) : job.cancelRequestedAt,
  };
}
export function transitionProject(
  project: StoryProject,
  next: StoryProject["status"],
  updatedAt: StoryProject["updatedAt"],
): StoryProject {
  ensure("project", project.status, next, PROJECT);
  return { ...project, status: next, updatedAt };
}
export function transitionStoryboard(
  plan: StoryboardVersion,
  next: StoryboardVersion["status"],
  approval?: {
    adultId: StoryboardVersion["ownerId"];
    at: NonNullable<StoryboardVersion["approvedAt"]>;
  },
): StoryboardVersion {
  ensure("storyboard", plan.status, next, PLAN);
  if (next === "APPROVED") {
    if (!plan.contentHash || !approval || approval.adultId !== plan.ownerId)
      throw new InvalidTransitionError("storyboard-approval", plan.status, next);
    return { ...plan, status: next, approvedBy: approval.adultId, approvedAt: approval.at };
  }
  return { ...plan, status: next };
}
