import type { NormalizedPlanDraft } from "../domain";
import { AiProviderError, type LessonPlanningInput, type PlanCreator } from "./contracts";
import { postJson, type FetchLike } from "./http";
import { normalizePlan } from "./normalize";
import { creatorSystemPrompt, planningPrompt } from "./prompts";
import { planJsonSchema } from "./schemas";

export interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  model: string;
  /** Workers AI defaults to 256 output tokens, far too few for a full plan. */
  maxTokens?: number;
}

/** Creates the structured lesson plan with Cloudflare Workers AI (JSON-schema mode). */
export class CloudflarePlanCreator implements PlanCreator {
  constructor(
    private readonly config: CloudflareConfig,
    private readonly fetcher: FetchLike = fetch,
  ) {
    if (!config.accountId || !config.apiToken || !config.model)
      throw new Error("Cloudflare account ID, API token and explicit model are required");
  }

  async createPlan(input: LessonPlanningInput, signal?: AbortSignal): Promise<NormalizedPlanDraft> {
    const response = await postJson(
      "cloudflare",
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(this.config.accountId)}/ai/run/${this.config.model}`,
      { authorization: `Bearer ${this.config.apiToken}` },
      {
        messages: [
          { role: "system", content: creatorSystemPrompt },
          { role: "user", content: planningPrompt(input) },
        ],
        response_format: { type: "json_schema", json_schema: planJsonSchema },
        temperature: 0.4,
        max_tokens: this.config.maxTokens ?? 6000,
      },
      this.fetcher,
      signal,
    );
    try {
      // JSON mode may return the object directly or as a JSON string.
      const output = (response as { result?: { response?: unknown } }).result?.response;
      if (output === undefined || output === null || output === "") throw new Error();
      return normalizePlan(typeof output === "string" ? JSON.parse(output) : output);
    } catch {
      throw new AiProviderError({
        provider: "cloudflare",
        operation: "plan",
        safeCode: "INVALID_STRUCTURED_OUTPUT",
        retryable: false,
      });
    }
  }
}
