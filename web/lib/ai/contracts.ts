import type { LearnerLevel, Locale, NormalizedPlanDraft, ProviderFailure } from "../domain";
export interface LessonPlanningInput {
  learnerLevel: LearnerLevel;
  locale: Locale;
  subjectKey: string;
  topicKey: string;
  instruction: string;
  deterministicFacts: Readonly<Record<string, string | number | readonly number[]>>;
  allowedAssetKeys: readonly string[];
  allowedActionTypes: readonly string[];
  /** Present only for the single bounded quality-correction call. */
  correctionFindings?: readonly string[];
}
export interface PlanCreator {
  createPlan(input: LessonPlanningInput, signal?: AbortSignal): Promise<NormalizedPlanDraft>;
}
export type ReviewDisposition = "PASS" | "NEEDS_REVISION" | "BLOCK";
export interface ReviewFinding {
  code: string;
  severity: "INFO" | "WARNING" | "ERROR";
  sceneIndex: number | null;
  message: string;
}
export interface PlanReview {
  disposition: ReviewDisposition;
  summary: string;
  findings: readonly ReviewFinding[];
}
export interface PlanReviewer {
  reviewPlan(
    input: LessonPlanningInput,
    plan: NormalizedPlanDraft,
    signal?: AbortSignal,
  ): Promise<PlanReview>;
}
export interface FallbackPlanCreator extends PlanCreator {
  readonly fallbackOnly: true;
}
export class AiProviderError extends Error {
  constructor(public readonly failure: ProviderFailure) {
    super(`${failure.provider}:${failure.safeCode}`);
  }
}
