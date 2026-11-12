import "server-only";

function required(name: "GEMINI_API_KEY" | "GEMINI_MODEL" | "GROQ_API_KEY" | "GROQ_MODEL") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`AI_CONFIG_MISSING:${name}`);
  return value;
}

export function readPlanningAiConfig() {
  return {
    gemini: { apiKey: required("GEMINI_API_KEY"), model: required("GEMINI_MODEL") },
    groq: { apiKey: required("GROQ_API_KEY"), model: required("GROQ_MODEL") },
  };
}
