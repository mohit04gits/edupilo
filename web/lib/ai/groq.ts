import type { NormalizedPlanDraft } from "../domain";
import {
  AiProviderError,
  type FallbackPlanCreator,
  type LessonPlanningInput,
  type PlanReview,
  type PlanReviewer,
} from "./contracts";
import { postJson, type FetchLike } from "./http";
import { normalizePlan, normalizeReview } from "./normalize";
import { creatorSystemPrompt, planningPrompt, reviewerSystemPrompt } from "./prompts";
import { planJsonSchema, reviewJsonSchema } from "./schemas";
export interface GroqConfig {
  apiKey: string;
  model: string;
  endpoint?: string;
  strictStructuredOutput?: boolean;
}
export class GroqPlanReviewer implements PlanReviewer {
  constructor(
    protected readonly config: GroqConfig,
    protected readonly fetcher: FetchLike = fetch,
  ) {
    if (!config.apiKey || !config.model)
      throw new Error("Groq API key and explicit model are required");
  }
  async reviewPlan(
    input: LessonPlanningInput,
    plan: NormalizedPlanDraft,
    signal?: AbortSignal,
  ): Promise<PlanReview> {
    const r = await this.call(
      [
        { role: "system", content: reviewerSystemPrompt },
        { role: "user", content: JSON.stringify({ input, plan }) },
      ],
      reviewJsonSchema,
      "educational_plan_review",
      signal,
    );
    try {
      return normalizeReview(JSON.parse(this.content(r)));
    } catch {
      throw new AiProviderError({
        provider: "groq",
        operation: "review",
        safeCode: "INVALID_STRUCTURED_OUTPUT",
        retryable: false,
      });
    }
  }
  protected call(messages: unknown[], schema: unknown, name: string, signal?: AbortSignal) {
    return postJson(
      "groq",
      this.config.endpoint ?? "https://api.groq.com/openai/v1/chat/completions",
      { authorization: `Bearer ${this.config.apiKey}` },
      {
        model: this.config.model,
        messages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name,
            strict: this.config.strictStructuredOutput ?? false,
            schema,
          },
        },
      },
      this.fetcher,
      signal,
    );
  }
  protected content(r: unknown) {
    const text = (r as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message
      ?.content;
    if (!text) throw new Error("missing content");
    return text;
  }
}
export class GroqFallbackPlanCreator extends GroqPlanReviewer implements FallbackPlanCreator {
  readonly fallbackOnly = true as const;
  async createPlan(input: LessonPlanningInput, signal?: AbortSignal): Promise<NormalizedPlanDraft> {
    const r = await this.call(
      [
        { role: "system", content: creatorSystemPrompt },
        { role: "user", content: planningPrompt(input) },
      ],
      planJsonSchema,
      "educational_story_plan",
      signal,
    );
    try {
      return normalizePlan(JSON.parse(this.content(r)));
    } catch {
      throw new AiProviderError({
        provider: "groq",
        operation: "fallback-plan",
        safeCode: "INVALID_STRUCTURED_OUTPUT",
        retryable: false,
      });
    }
  }
}
