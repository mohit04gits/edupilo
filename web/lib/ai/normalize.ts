import {
  CINEMATIC_ACTION_TYPES,
  SUPPORTED_LOCALES,
  type AssetLayerRole,
  type CinematicActionType,
  type EducationalFact,
  type NormalizedPlanDraft,
  type SceneAction,
  type SceneAssetReference,
} from "../domain";
import type { PlanReview, ReviewFinding } from "./contracts";
const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, name: string) => {
  if (typeof v !== "string" || !v.trim()) throw new Error(`INVALID_${name}`);
  return v.trim();
};
const int = (v: unknown, name: string) => {
  if (!Number.isInteger(v) || Number(v) < 0) throw new Error(`INVALID_${name}`);
  return Number(v);
};
function fact(v: unknown): EducationalFact {
  if (!record(v)) throw new Error("INVALID_FACT");
  if (v.kind === "EQUAL_GROUPS")
    return {
      kind: "EQUAL_GROUPS",
      groups: int(v.groups, "GROUPS"),
      itemsPerGroup: int(v.itemsPerGroup, "ITEMS_PER_GROUP"),
      total: int(v.total, "TOTAL"),
      itemLabel: str(v.itemLabel, "ITEM_LABEL"),
      additionEquation: str(v.additionEquation, "ADDITION"),
      multiplicationEquation: str(v.multiplicationEquation, "MULTIPLICATION"),
    };
  if (v.kind === "COUNTING") {
    if (!Array.isArray(v.values)) throw new Error("INVALID_VALUES");
    return {
      kind: "COUNTING",
      values: v.values.map((x, i) => int(x, `VALUE_${i}`)),
      total: int(v.total, "TOTAL"),
      itemLabel: str(v.itemLabel, "ITEM_LABEL"),
    };
  }
  if (v.kind === "LABEL")
    return { kind: "LABEL", key: str(v.key, "KEY"), value: str(v.value, "VALUE") };
  throw new Error("UNSUPPORTED_FACT");
}
function action(v: unknown): SceneAction {
  if (!record(v) || !CINEMATIC_ACTION_TYPES.includes(v.type as CinematicActionType))
    throw new Error("UNSUPPORTED_ACTION");
  if (!record(v.parameters)) throw new Error("INVALID_ACTION_PARAMETERS");
  const parameters: Record<string, string | number | boolean> = {};
  for (const [k, x] of Object.entries(v.parameters))
    if (typeof x === "string" || typeof x === "number" || typeof x === "boolean") parameters[k] = x;
    else throw new Error("INVALID_ACTION_PARAMETER");
  return {
    id: str(v.id, "ACTION_ID"),
    type: v.type as CinematicActionType,
    startMs: int(v.startMs, "ACTION_START"),
    endMs: int(v.endMs, "ACTION_END"),
    targetRef: typeof v.targetRef === "string" ? v.targetRef : undefined,
    parameters,
  };
}
function asset(v: unknown): SceneAssetReference {
  if (!record(v) || !Array.isArray(v.requiredLayers)) throw new Error("INVALID_ASSET");
  const key = str(v.logicalKey, "ASSET_KEY"),
    version = int(v.version, "ASSET_VERSION");
  return {
    assetId: `unresolved:${key}@${version}` as SceneAssetReference["assetId"],
    logicalKey: key,
    version,
    requiredLayers: v.requiredLayers.map((l) => {
      if (!record(l) || !Array.isArray(l.supportedActions)) throw new Error("INVALID_LAYER");
      return {
        role: str(l.role, "LAYER_ROLE") as AssetLayerRole,
        required: Boolean(l.required),
        minDepth: Number(l.minDepth),
        maxDepth: Number(l.maxDepth),
        supportedActions: l.supportedActions.map((x) => {
          if (!CINEMATIC_ACTION_TYPES.includes(x as CinematicActionType))
            throw new Error("UNSUPPORTED_LAYER_ACTION");
          return x as CinematicActionType;
        }),
      };
    }),
  };
}
export function normalizePlan(v: unknown): NormalizedPlanDraft {
  if (
    !record(v) ||
    !SUPPORTED_LOCALES.includes(v.locale as "en-IN" | "hi-IN") ||
    !Array.isArray(v.scenes)
  )
    throw new Error("INVALID_PLAN");
  return {
    locale: v.locale as NormalizedPlanDraft["locale"],
    title: str(v.title, "TITLE"),
    learningObjective: str(v.learningObjective, "OBJECTIVE"),
    presentationMode: (() => {
      const mode = str(v.presentationMode, "PRESENTATION_MODE");
      if (!["ANIMATED_DEMONSTRATION", "VISUAL_EXPLORATION", "EXPLANATION", "STORYTELLING"].includes(mode))
        throw new Error("INVALID_PRESENTATION_MODE");
      return mode as NormalizedPlanDraft["presentationMode"];
    })(),
    explanationApproach: str(v.explanationApproach, "EXPLANATION_APPROACH"),
    ...(typeof v.storyPremise === "string" && v.storyPremise.trim()
      ? { storyPremise: v.storyPremise.trim() }
      : {}),
    scenes: v.scenes.map((s) => {
      if (
        !record(s) ||
        !Array.isArray(s.facts) ||
        !Array.isArray(s.assets) ||
        !Array.isArray(s.actions)
      )
        throw new Error("INVALID_SCENE");
      return {
        learningPurpose: str(s.learningPurpose, "PURPOSE"),
        narration: str(s.narration, "NARRATION"),
        visualIntent: str(s.visualIntent, "VISUAL_INTENT"),
        estimatedDurationMs: int(s.estimatedDurationMs, "DURATION"),
        facts: s.facts.map(fact),
        assets: s.assets.map(asset),
        actions: s.actions.map(action),
      };
    }),
  };
}
export function normalizeReview(v: unknown): PlanReview {
  if (
    !record(v) ||
    !["PASS", "NEEDS_REVISION", "BLOCK"].includes(String(v.disposition)) ||
    !Array.isArray(v.findings)
  )
    throw new Error("INVALID_REVIEW");
  const findings: ReviewFinding[] = v.findings.map((x) => {
    if (!record(x) || !["INFO", "WARNING", "ERROR"].includes(String(x.severity)))
      throw new Error("INVALID_FINDING");
    return {
      code: str(x.code, "FINDING_CODE"),
      severity: x.severity as ReviewFinding["severity"],
      sceneIndex: x.sceneIndex === null ? null : int(x.sceneIndex, "SCENE_INDEX"),
      message: str(x.message, "FINDING_MESSAGE"),
    };
  });
  return {
    disposition: v.disposition as PlanReview["disposition"],
    summary: str(v.summary, "REVIEW_SUMMARY"),
    findings,
  };
}
