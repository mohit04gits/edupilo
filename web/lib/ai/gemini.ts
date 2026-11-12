import type { NormalizedPlanDraft } from "../domain";
import { AiProviderError, type LessonPlanningInput, type PlanCreator } from "./contracts";
import { postJson, type FetchLike } from "./http";
import { normalizePlan } from "./normalize";
import { creatorSystemPrompt, planningPrompt } from "./prompts";
import { planJsonSchema } from "./schemas";
export interface GeminiConfig {
  apiKey: string;
  model: string;
  endpoint?: string;
}
export class GeminiPlanCreator implements PlanCreator {
  constructor(
    private readonly config: GeminiConfig,
    private readonly fetcher: FetchLike = fetch,
  ) {
    if (!config.apiKey || !config.model)
      throw new Error("Gemini API key and explicit model are required");
  }
  async createPlan(input: LessonPlanningInput, signal?: AbortSignal): Promise<NormalizedPlanDraft> {
    const base = this.config.endpoint ?? "https://generativelanguage.googleapis.com/v1beta",
      response = await postJson(
        "gemini",
        `${base}/models/${encodeURIComponent(this.config.model)}:generateContent`,
        { "x-goog-api-key": this.config.apiKey },
        {
          systemInstruction: { parts: [{ text: creatorSystemPrompt }] },
          contents: [{ role: "user", parts: [{ text: planningPrompt(input) }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
            responseJsonSchema: planJsonSchema,
          },
        },
        this.fetcher,
        signal,
      );
    try {
      const text = (response as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
        .candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error();
      return normalizePlan(JSON.parse(text));
    } catch {
      throw new AiProviderError({
        provider: "gemini",
        operation: "plan",
        safeCode: "INVALID_STRUCTURED_OUTPUT",
        retryable: false,
      });
    }
  }
}
