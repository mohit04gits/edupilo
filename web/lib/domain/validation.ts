import {
  CINEMATIC_ACTION_TYPES,
  GENERATION_JOB_STATES,
  GENERATION_STAGES,
  LEARNER_LEVELS,
  SUPPORTED_LOCALES,
  type EducationalFact,
  type GenerationJob,
  type PrivateMediaReference,
  type StoryProject,
  type StoryboardScene,
  type StoryboardVersion,
} from "./types";
export interface ValidationIssue {
  path: string;
  code: string;
  message: string;
}
export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: readonly ValidationIssue[] };
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const string = (value: unknown, min = 1, max = 5000) =>
  typeof value === "string" && value.length >= min && value.length <= max;
const integer = (value: unknown, min = 0) => Number.isInteger(value) && Number(value) >= min;
const isoTime = (value: unknown) => typeof value === "string" && Number.isFinite(Date.parse(value));
const oneOf = <T extends readonly string[]>(value: unknown, values: T): value is T[number] =>
  typeof value === "string" && values.includes(value as T[number]);
const issue = (path: string, code: string, message: string): ValidationIssue => ({
  path,
  code,
  message,
});
export function validatePrivateMediaReference(value: unknown, path = "media"): ValidationIssue[] {
  if (!isRecord(value)) return [issue(path, "INVALID_TYPE", "Media reference must be an object")];
  const x: ValidationIssue[] = [];
  if (!oneOf(value.backend, ["LOCAL", "R2"] as const))
    x.push(issue(`${path}.backend`, "UNSUPPORTED_BACKEND", "Unsupported media backend"));
  if (
    !string(value.objectKey, 1, 1024) ||
    String(value.objectKey).includes("..") ||
    /^https?:/i.test(String(value.objectKey))
  )
    x.push(
      issue(
        `${path}.objectKey`,
        "INVALID_PRIVATE_KEY",
        "Use a private object key without traversal or public URL",
      ),
    );
  if (!string(value.sha256, 8, 128))
    x.push(issue(`${path}.sha256`, "INVALID_HASH", "A checksum is required"));
  if (!string(value.mimeType, 3, 100))
    x.push(issue(`${path}.mimeType`, "INVALID_MIME", "A MIME type is required"));
  if (!integer(value.sizeBytes, 0))
    x.push(issue(`${path}.sizeBytes`, "INVALID_SIZE", "Size must be a non-negative integer"));
  return x;
}
export function validateEducationalFact(fact: unknown, path: string): ValidationIssue[] {
  if (!isRecord(fact) || !string(fact.kind))
    return [issue(path, "INVALID_FACT", "Fact must have a supported kind")];
  const x: ValidationIssue[] = [];
  if (fact.kind === "EQUAL_GROUPS") {
    const groups = fact.groups,
      each = fact.itemsPerGroup,
      total = fact.total;
    if (!integer(groups, 1) || !integer(each, 1) || !integer(total, 1))
      return [issue(path, "INVALID_QUANTITY", "Equal-group quantities must be positive integers")];
    if (Number(groups) * Number(each) !== Number(total))
      x.push(issue(path, "MATH_INVARIANT", "groups × itemsPerGroup must equal total"));
    const add = `${Array.from({ length: Number(groups) }, () => each).join(" + ")} = ${total}`,
      multiply = `${groups} × ${each} = ${total}`;
    if (fact.additionEquation !== add)
      x.push(issue(`${path}.additionEquation`, "EQUATION_MISMATCH", `Expected ${add}`));
    if (fact.multiplicationEquation !== multiply)
      x.push(issue(`${path}.multiplicationEquation`, "EQUATION_MISMATCH", `Expected ${multiply}`));
    if (!string(fact.itemLabel, 1, 80))
      x.push(issue(`${path}.itemLabel`, "INVALID_LABEL", "Item label is required"));
  } else if (fact.kind === "COUNTING") {
    if (
      !Array.isArray(fact.values) ||
      fact.values.length === 0 ||
      !fact.values.every((v) => integer(v, 0))
    )
      x.push(
        issue(
          `${path}.values`,
          "INVALID_SEQUENCE",
          "Counting values must be non-negative integers",
        ),
      );
    if (
      !integer(fact.total, 0) ||
      (Array.isArray(fact.values) &&
        fact.values.reduce((sum, v) => sum + Number(v), 0) !== fact.total)
    )
      x.push(issue(`${path}.total`, "COUNT_MISMATCH", "Counting values must sum to total"));
  } else if (fact.kind === "LABEL") {
    if (!string(fact.key, 1, 80) || !string(fact.value, 1, 300))
      x.push(issue(path, "INVALID_LABEL", "Label key and value are required"));
  } else x.push(issue(`${path}.kind`, "UNSUPPORTED_FACT", "Unsupported educational fact kind"));
  return x;
}
function validateScene(scene: unknown, path: string): ValidationIssue[] {
  if (!isRecord(scene)) return [issue(path, "INVALID_SCENE", "Scene must be an object")];
  const x: ValidationIssue[] = [];
  if (!string(scene.id, 1, 120)) x.push(issue(`${path}.id`, "INVALID_ID", "Scene ID is required"));
  if (!integer(scene.order, 0))
    x.push(issue(`${path}.order`, "INVALID_ORDER", "Scene order must be a non-negative integer"));
  for (const key of ["learningPurpose", "narration", "visualIntent"] as const)
    if (!string(scene[key], 1, key === "narration" ? 4000 : 500))
      x.push(issue(`${path}.${key}`, "INVALID_TEXT", `${key} is required and bounded`));
  if (!integer(scene.estimatedDurationMs, 1))
    x.push(issue(`${path}.estimatedDurationMs`, "INVALID_DURATION", "Duration must be positive"));
  if (!Array.isArray(scene.facts))
    x.push(issue(`${path}.facts`, "INVALID_FACTS", "Facts must be an array"));
  else scene.facts.forEach((f, i) => x.push(...validateEducationalFact(f, `${path}.facts[${i}]`)));
  if (!Array.isArray(scene.assets))
    x.push(issue(`${path}.assets`, "INVALID_ASSETS", "Assets must be an array"));
  if (!Array.isArray(scene.actions))
    x.push(issue(`${path}.actions`, "INVALID_ACTIONS", "Actions must be an array"));
  else
    scene.actions.forEach((a, i) => {
      const p = `${path}.actions[${i}]`;
      if (!isRecord(a) || !oneOf(a.type, CINEMATIC_ACTION_TYPES))
        x.push(issue(`${p}.type`, "UNSUPPORTED_ACTION", "Unsupported cinematic action"));
      else if (
        !integer(a.startMs, 0) ||
        !integer(a.endMs, 0) ||
        Number(a.endMs) <= Number(a.startMs) ||
        Number(a.endMs) > Number(scene.estimatedDurationMs)
      )
        x.push(
          issue(p, "INVALID_ACTION_TIMING", "Action timing must be ordered and inside the scene"),
        );
    });
  if (!Array.isArray(scene.captionCues))
    x.push(issue(`${path}.captionCues`, "INVALID_CAPTIONS", "Caption cues must be an array"));
  else
    scene.captionCues.forEach((c, i) => {
      if (
        !isRecord(c) ||
        !string(c.text, 1, 180) ||
        !integer(c.startMs, 0) ||
        !integer(c.endMs, 0) ||
        Number(c.endMs) <= Number(c.startMs) ||
        Number(c.endMs) > Number(scene.estimatedDurationMs)
      )
        x.push(
          issue(
            `${path}.captionCues[${i}]`,
            "INVALID_CAPTION",
            "Caption must be bounded and timed inside the scene",
          ),
        );
    });
  return x;
}
export function validateStoryProject(value: unknown): ValidationResult<StoryProject> {
  if (!isRecord(value))
    return { ok: false, issues: [issue("project", "INVALID_TYPE", "Project must be an object")] };
  const x: ValidationIssue[] = [];
  if (!string(value.id) || !string(value.ownerId))
    x.push(issue("project.id", "INVALID_ID", "Project and owner IDs are required"));
  if (!oneOf(value.learnerLevel, LEARNER_LEVELS))
    x.push(issue("project.learnerLevel", "UNSUPPORTED_LEVEL", "Unsupported learner level"));
  if (!oneOf(value.locale, SUPPORTED_LOCALES))
    x.push(issue("project.locale", "UNSUPPORTED_LOCALE", "Only en-IN and hi-IN are supported"));
  if (!string(value.subjectKey, 1, 80) || !string(value.topicKey, 1, 120))
    x.push(issue("project.taxonomy", "INVALID_TAXONOMY", "Subject and topic keys are required"));
  if (!string(value.instruction, 1, 2000))
    x.push(
      issue("project.instruction", "INVALID_INSTRUCTION", "Instruction must be 1–2000 characters"),
    );
  if (!oneOf(value.status, ["DRAFT", "PLANNING", "REVIEW_READY", "APPROVED", "ARCHIVED"] as const))
    x.push(issue("project.status", "INVALID_STATUS", "Unsupported project status"));
  if (!integer(value.inputRevision, 1) || !integer(value.currentStoryboardVersion, 0))
    x.push(issue("project.version", "INVALID_VERSION", "Project revisions are invalid"));
  if (!isoTime(value.createdAt) || !isoTime(value.updatedAt))
    x.push(issue("project.timestamps", "INVALID_TIMESTAMP", "UTC ISO timestamps are required"));
  return x.length
    ? { ok: false, issues: x }
    : { ok: true, value: value as unknown as StoryProject };
}
export function validateStoryboardVersion(value: unknown): ValidationResult<StoryboardVersion> {
  if (!isRecord(value))
    return {
      ok: false,
      issues: [issue("storyboard", "INVALID_TYPE", "Storyboard must be an object")],
    };
  const x: ValidationIssue[] = [];
  if (!string(value.id) || !string(value.projectId) || !string(value.ownerId))
    x.push(issue("storyboard.id", "INVALID_ID", "Storyboard, project and owner IDs are required"));
  if (value.schemaVersion !== "1.0" || !integer(value.version, 1))
    x.push(
      issue("storyboard.version", "UNSUPPORTED_VERSION", "Storyboard schema/version is invalid"),
    );
  if (!oneOf(value.locale, SUPPORTED_LOCALES))
    x.push(issue("storyboard.locale", "UNSUPPORTED_LOCALE", "Only en-IN and hi-IN are supported"));
  if (
    !string(value.title, 1, 140) ||
    !string(value.learningObjective, 1, 500) ||
    !oneOf(value.presentationMode, ["ANIMATED_DEMONSTRATION", "VISUAL_EXPLORATION", "EXPLANATION", "STORYTELLING"] as const) ||
    !string(value.explanationApproach, 1, 1000) ||
    (value.storyPremise !== undefined && !string(value.storyPremise, 1, 1000))
  )
    x.push(
      issue("storyboard.text", "INVALID_TEXT", "Storyboard text fields are required and bounded"),
    );
  if (!isRecord(value.validation) ||
      typeof value.validation.schemaValid !== "boolean" ||
      typeof value.validation.deterministicValid !== "boolean" ||
      !oneOf(value.validation.semanticDisposition, ["PASS", "NEEDS_REVISION", "BLOCK"] as const) ||
      !string(value.validation.summary, 1, 1000) ||
      !Array.isArray(value.validation.findings))
    x.push(issue("storyboard.validation", "INVALID_VALIDATION", "Plan validation evidence is required"));
  if (
    !oneOf(value.status, [
      "GENERATING",
      "INVALID",
      "REVIEW_READY",
      "APPROVED",
      "SUPERSEDED",
    ] as const)
  )
    x.push(issue("storyboard.status", "INVALID_STATUS", "Unsupported storyboard status"));
  if (!Array.isArray(value.scenes) || value.scenes.length === 0 || value.scenes.length > 30)
    x.push(
      issue("storyboard.scenes", "INVALID_SCENE_COUNT", "Storyboard must contain 1–30 scenes"),
    );
  else {
    const seen = new Set<string>();
    value.scenes.forEach((s, i) => {
      x.push(...validateScene(s, `storyboard.scenes[${i}]`));
      if (isRecord(s) && typeof s.id === "string") {
        if (seen.has(s.id))
          x.push(issue(`storyboard.scenes[${i}].id`, "DUPLICATE_ID", "Scene IDs must be unique"));
        seen.add(s.id);
      }
    });
    if (value.scenes.map((s) => (isRecord(s) ? s.order : undefined)).some((o, i) => o !== i))
      x.push(
        issue("storyboard.scenes", "INVALID_ORDER", "Scene order must be contiguous from zero"),
      );
  }
  if (
    ["REVIEW_READY", "APPROVED"].includes(String(value.status)) &&
    !string(value.contentHash, 8, 200)
  )
    x.push(
      issue(
        "storyboard.contentHash",
        "MISSING_HASH",
        "Review-ready and approved plans require a content hash",
      ),
    );
  if (value.status === "APPROVED" && (!string(value.approvedBy) || !isoTime(value.approvedAt)))
    x.push(
      issue(
        "storyboard.approval",
        "MISSING_APPROVAL",
        "Approved plan requires adult actor and timestamp",
      ),
    );
  if (!isoTime(value.createdAt))
    x.push(issue("storyboard.createdAt", "INVALID_TIMESTAMP", "Created timestamp is required"));
  return x.length
    ? { ok: false, issues: x }
    : { ok: true, value: value as unknown as StoryboardVersion };
}
export function validateGenerationJob(value: unknown): ValidationResult<GenerationJob> {
  if (!isRecord(value))
    return { ok: false, issues: [issue("job", "INVALID_TYPE", "Job must be an object")] };
  const x: ValidationIssue[] = [];
  if (!string(value.id) || !string(value.ownerId) || !string(value.projectId))
    x.push(issue("job.id", "INVALID_ID", "Job, owner and project IDs are required"));
  if (!oneOf(value.state, GENERATION_JOB_STATES))
    x.push(issue("job.state", "INVALID_STATE", "Unsupported job state"));
  if (value.stage !== undefined && !oneOf(value.stage, GENERATION_STAGES))
    x.push(issue("job.stage", "INVALID_STAGE", "Unsupported job stage"));
  if (!oneOf(value.type, ["PLAN_GENERATION", "VIDEO_GENERATION", "STAGE_RETRY"] as const))
    x.push(issue("job.type", "INVALID_TYPE", "Unsupported job type"));
  if (value.type === "VIDEO_GENERATION" && !string(value.storyboardId))
    x.push(
      issue(
        "job.storyboardId",
        "MISSING_STORYBOARD",
        "Video generation requires an approved storyboard reference",
      ),
    );
  if (!string(value.idempotencyKey, 8, 200) || !string(value.inputHash, 8, 200))
    x.push(
      issue(
        "job.identity",
        "INVALID_IDEMPOTENCY",
        "Opaque idempotency key and input hash are required",
      ),
    );
  if (!Array.isArray(value.attempts) || !Array.isArray(value.usage))
    x.push(issue("job.history", "INVALID_HISTORY", "Attempt and usage histories must be arrays"));
  if (!isoTime(value.createdAt) || !isoTime(value.updatedAt))
    x.push(issue("job.timestamps", "INVALID_TIMESTAMP", "UTC ISO timestamps are required"));
  return x.length
    ? { ok: false, issues: x }
    : { ok: true, value: value as unknown as GenerationJob };
}
export function assertValid<T>(result: ValidationResult<T>): T {
  if (!result.ok) throw new Error(result.issues.map((i) => `${i.path}:${i.code}`).join(", "));
  return result.value;
}
export type { EducationalFact, PrivateMediaReference, StoryboardScene };
