import { CINEMATIC_ACTION_TYPES, SUPPORTED_LOCALES } from "../domain";

const closed = (properties: Record<string, unknown>, required = Object.keys(properties)) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});
const text = { type: "string" };
const integer = { type: "integer", minimum: 0 };

const factSchema = closed({
  kind: { type: "string", enum: ["EQUAL_GROUPS", "COUNTING", "LABEL"] },
  groups: { type: ["integer", "null"] },
  itemsPerGroup: { type: ["integer", "null"] },
  total: { type: ["integer", "null"] },
  itemLabel: { type: ["string", "null"] },
  additionEquation: { type: ["string", "null"] },
  multiplicationEquation: { type: ["string", "null"] },
  values: { type: ["array", "null"], items: { type: "integer" } },
  key: { type: ["string", "null"] },
  value: { type: ["string", "null"] },
});
const layerSchema = closed({
  role: text,
  required: { type: "boolean" },
  minDepth: { type: "number" },
  maxDepth: { type: "number" },
  supportedActions: { type: "array", items: { type: "string", enum: [...CINEMATIC_ACTION_TYPES] } },
});
const assetSchema = closed({
  logicalKey: text,
  version: { type: "integer", minimum: 1 },
  requiredLayers: { type: "array", items: layerSchema },
});
const actionSchema = closed({
  id: text,
  type: { type: "string", enum: [...CINEMATIC_ACTION_TYPES] },
  startMs: integer,
  endMs: integer,
  targetRef: { type: ["string", "null"] },
  parameters: { type: "object", additionalProperties: { type: ["string", "number", "boolean"] } },
});
const sceneSchema = closed({
  learningPurpose: text,
  narration: text,
  visualIntent: text,
  estimatedDurationMs: { type: "integer", minimum: 500, maximum: 120000 },
  facts: { type: "array", items: factSchema },
  assets: { type: "array", items: assetSchema },
  actions: { type: "array", items: actionSchema },
});

export const planJsonSchema = closed({
  locale: { type: "string", enum: [...SUPPORTED_LOCALES] },
  title: text,
  learningObjective: text,
  presentationMode: {
    type: "string",
    enum: ["ANIMATED_DEMONSTRATION", "VISUAL_EXPLORATION", "EXPLANATION", "STORYTELLING"],
  },
  explanationApproach: text,
  storyPremise: { type: ["string", "null"] },
  scenes: { type: "array", minItems: 1, maxItems: 12, items: sceneSchema },
});
export const reviewJsonSchema = closed({
  disposition: { type: "string", enum: ["PASS", "NEEDS_REVISION", "BLOCK"] },
  summary: text,
  findings: {
    type: "array",
    items: closed({
      code: text,
      severity: { type: "string", enum: ["INFO", "WARNING", "ERROR"] },
      sceneIndex: { type: ["integer", "null"] },
      message: text,
    }),
  },
});

/**
 * Gemini rejects the full plan schema as too complex (HTTP 400 INVALID_ARGUMENT).
 * Ask it only for what planning needs today: no asset layers (no approved assets exist yet,
 * and unapproved assets are discarded on save) and no free-form action parameters.
 * The adapter restores `assets: []` and `parameters: {}` before normalisation.
 */
const geminiActionSchema = closed({
  id: text,
  type: { type: "string", enum: [...CINEMATIC_ACTION_TYPES] },
  startMs: integer,
  endMs: integer,
  targetRef: { type: ["string", "null"] },
});
const geminiPlanJsonSchemaWithNulls = closed({
  ...planJsonSchema.properties,
  scenes: {
    type: "array",
    minItems: 1,
    maxItems: 12,
    items: closed({
      learningPurpose: text,
      narration: text,
      visualIntent: text,
      estimatedDurationMs: { type: "integer", minimum: 500, maximum: 120000 },
      facts: { type: "array", items: factSchema },
      actions: { type: "array", items: geminiActionSchema },
    }),
  },
});

/**
 * Gemini also limits overall schema complexity, and every `["x", "null"]` union multiplies it.
 * Convert nullable fields into plain optional fields; the normaliser treats a missing field
 * exactly like `null`.
 */
function optionalInsteadOfNull(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(optionalInsteadOfNull);
  if (!schema || typeof schema !== "object") return schema;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema)) out[key] = optionalInsteadOfNull(value);
  if (Array.isArray(out.type) && out.type.includes("null")) {
    const rest = (out.type as string[]).filter((t) => t !== "null");
    out.type = rest.length === 1 ? rest[0] : rest;
  }
  const props = out.properties as Record<string, { type?: unknown }> | undefined;
  const original = (schema as { properties?: Record<string, { type?: unknown }> }).properties;
  if (props && original && Array.isArray(out.required))
    out.required = (out.required as string[]).filter(
      (k) => !(Array.isArray(original[k]?.type) && (original[k].type as string[]).includes("null")),
    );
  return out;
}
export const geminiPlanJsonSchema = optionalInsteadOfNull(geminiPlanJsonSchemaWithNulls);

/** Restores the fields omitted from {@link geminiPlanJsonSchema}. */
export function withOmittedPlanDefaults(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { scenes?: unknown }).scenes))
    return raw;
  const plan = raw as { scenes: Record<string, unknown>[] };
  return {
    ...plan,
    scenes: plan.scenes.map((scene) => ({
      ...scene,
      assets: Array.isArray(scene.assets) ? scene.assets : [],
      actions: Array.isArray(scene.actions)
        ? scene.actions.map((a) =>
            a && typeof a === "object" && !("parameters" in a) ? { ...a, parameters: {} } : a,
          )
        : scene.actions,
    })),
  };
}
