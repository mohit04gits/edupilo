import "server-only";

type AiEnvName =
  | "CLOUDFLARE_ACCOUNT_ID"
  | "CLOUDFLARE_API_TOKEN"
  | "CLOUDFLARE_AI_MODEL"
  | "GROQ_API_KEY"
  | "GROQ_MODEL";

function required(name: AiEnvName) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`AI_CONFIG_MISSING:${name}`);
  return value;
}

/** Cloudflare Workers AI creates plans; Groq reviews them. Gemini is no longer active. */
export function readPlanningAiConfig() {
  return {
    cloudflare: {
      accountId: required("CLOUDFLARE_ACCOUNT_ID"),
      apiToken: required("CLOUDFLARE_API_TOKEN"),
      model: required("CLOUDFLARE_AI_MODEL"),
    },
    groq: { apiKey: required("GROQ_API_KEY"), model: required("GROQ_MODEL") },
  };
}
