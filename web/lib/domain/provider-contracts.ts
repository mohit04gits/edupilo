import type { EducationalFact, Locale, SceneAction, SceneAssetReference } from "./types";
/** Untrusted provider output; validate and normalize before creating a domain record. */
export interface ProviderPlanPayload {
  providerRequestId?: string;
  locale?: unknown;
  title?: unknown;
  learningObjective?: unknown;
  storyPremise?: unknown;
  scenes?: unknown;
  rawUsage?: unknown;
}
export interface NormalizedPlanDraft {
  locale: Locale;
  title: string;
  learningObjective: string;
  presentationMode: "ANIMATED_DEMONSTRATION" | "VISUAL_EXPLORATION" | "EXPLANATION" | "STORYTELLING";
  explanationApproach: string;
  storyPremise?: string;
  scenes: readonly {
    learningPurpose: string;
    narration: string;
    visualIntent: string;
    estimatedDurationMs: number;
    facts: readonly EducationalFact[];
    assets: readonly SceneAssetReference[];
    actions: readonly SceneAction[];
  }[];
}
export interface ProviderFailure {
  provider: string;
  operation: string;
  safeCode: string;
  retryable: boolean;
  retryAfterMs?: number;
}
