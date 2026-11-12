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
