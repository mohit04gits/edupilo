export const SUPPORTED_LOCALES = ["en-IN", "hi-IN"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const LEARNER_LEVELS = [
  "NURSERY",
  "KG",
  "CLASS_1",
  "CLASS_2",
  "CLASS_3",
  "CLASS_4",
] as const;
export type LearnerLevel = (typeof LEARNER_LEVELS)[number];
export type AdultRolePreference = "PARENT" | "TEACHER";
export type IsoTimestamp = string & { readonly __brand: "IsoTimestamp" };
export type EntityId<T extends string> = string & { readonly __entity: T };
export type AdultUserId = EntityId<"AdultUser">;
export type StoryProjectId = EntityId<"StoryProject">;
export type StoryboardId = EntityId<"Storyboard">;
export type SceneId = EntityId<"Scene">;
export type AssetId = EntityId<"Asset">;
export type NarrationAssetId = EntityId<"NarrationAsset">;
export type GenerationJobId = EntityId<"GenerationJob">;
export type VideoRenderId = EntityId<"VideoRender">;

export interface AdultAccountMetadata {
  id: AdultUserId;
  authSubject?: string;
  rolePreference?: AdultRolePreference;
  preferredLocale?: Locale;
  status: "PENDING_AUTH" | "ACTIVE" | "SUSPENDED";
  acceptedPolicyVersions: Readonly<Record<string, IsoTimestamp>>;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}
export interface StoryProject {
  id: StoryProjectId;
  ownerId: AdultUserId;
  learnerLevel: LearnerLevel;
  subjectKey: string;
  topicKey: string;
  locale: Locale;
  instruction: string;
  /** Absent on drafts created before open-ended idea input. */
  taxonomySource?: "SELECTED" | "INFERRED" | "OPEN";
  creativePreferences?: readonly string[];
  preferredCharacterAssetId?: AssetId;
  status: "DRAFT" | "PLANNING" | "REVIEW_READY" | "APPROVED" | "ARCHIVED";
  inputRevision: number;
  currentStoryboardVersion: number;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}

export interface EqualGroupsFact {
  kind: "EQUAL_GROUPS";
  groups: number;
  itemsPerGroup: number;
  total: number;
  itemLabel: string;
  additionEquation: string;
  multiplicationEquation: string;
}
export interface CountingFact {
  kind: "COUNTING";
  values: readonly number[];
  total: number;
  itemLabel: string;
}
export interface LabelFact {
  kind: "LABEL";
  key: string;
  value: string;
}
export type EducationalFact = EqualGroupsFact | CountingFact | LabelFact;

export const CINEMATIC_ACTION_TYPES = [
  "CHARACTER_POSE",
  "CHARACTER_EXPRESSION",
  "OBJECT_MOVE",
  "LAYER_PARALLAX",
  "CAMERA_MOVE",
  "LIGHTING_CUE",
  "PARTICLE_EFFECT",
  "REVEAL_GROUPS",
  "DISTRIBUTE_ITEMS",
  "SHOW_LABEL",
  "SHOW_EQUATION",
  "CAPTION_CUE",
] as const;
export type CinematicActionType = (typeof CINEMATIC_ACTION_TYPES)[number];
export interface SceneAction {
  id: string;
  type: CinematicActionType;
  startMs: number;
  endMs: number;
  targetRef?: string;
  parameters: Readonly<Record<string, string | number | boolean>>;
}
export type AssetLayerRole =
  | "BACKGROUND"
  | "MIDGROUND"
  | "FOREGROUND"
  | "CHARACTER_BODY"
  | "CHARACTER_HEAD"
  | "CHARACTER_EYES"
  | "CHARACTER_MOUTH"
  | "CHARACTER_ARM_LEFT"
  | "CHARACTER_ARM_RIGHT"
  | "PROP"
  | "EFFECT";
export interface AssetLayerRequirement {
  role: AssetLayerRole;
  required: boolean;
  minDepth: number;
  maxDepth: number;
  supportedActions: readonly CinematicActionType[];
}
export interface SceneAssetReference {
  assetId: AssetId;
  logicalKey: string;
  version: number;
  requiredLayers: readonly AssetLayerRequirement[];
}
export interface CaptionCue {
  text: string;
  startMs: number;
  endMs: number;
}
export interface StoryboardScene {
  id: SceneId;
  order: number;
  learningPurpose: string;
  narration: string;
  visualIntent: string;
  estimatedDurationMs: number;
  facts: readonly EducationalFact[];
  assets: readonly SceneAssetReference[];
  actions: readonly SceneAction[];
  captionCues: readonly CaptionCue[];
}
export interface StoryboardVersion {
  id: StoryboardId;
  projectId: StoryProjectId;
  ownerId: AdultUserId;
  schemaVersion: "1.0";
  version: number;
  locale: Locale;
  title: string;
  learningObjective: string;
  presentationMode: "ANIMATED_DEMONSTRATION" | "VISUAL_EXPLORATION" | "EXPLANATION" | "STORYTELLING";
  explanationApproach: string;
  /** Present only when storytelling is the chosen educational approach. */
  storyPremise?: string;
  scenes: readonly StoryboardScene[];
  validation: {
    schemaValid: boolean;
    deterministicValid: boolean;
    semanticDisposition: "PASS" | "NEEDS_REVISION" | "BLOCK";
    summary: string;
    findings: readonly {
      code: string;
      severity: "INFO" | "WARNING" | "ERROR";
      sceneIndex: number | null;
      message: string;
    }[];
  };
  status: "GENERATING" | "INVALID" | "REVIEW_READY" | "APPROVED" | "SUPERSEDED";
  contentHash?: string;
  approvedBy?: AdultUserId;
  approvedAt?: IsoTimestamp;
  createdAt: IsoTimestamp;
}

export type MediaBackend = "LOCAL" | "R2";
export interface PrivateMediaReference {
  backend: MediaBackend;
  objectKey: string;
  sha256: string;
  mimeType: string;
  sizeBytes: number;
}
export interface VisualAssetRecord {
  id: AssetId;
  logicalKey: string;
  version: number;
  kind: "CHARACTER" | "OBJECT" | "BACKGROUND" | "ICON" | "FONT" | "MUSIC" | "SFX";
  styleFamily: string;
  layers: readonly AssetLayerRequirement[];
  poses: readonly string[];
  expressions: readonly string[];
  media: PrivateMediaReference;
  provenance: { source: string; creator: string; method: string };
  license: {
    identifier: string;
    commercialUse: "ALLOWED" | "PROHIBITED" | "UNVERIFIED";
    evidenceRef?: string;
  };
  approvalState: "DRAFT" | "REVIEW_REQUIRED" | "APPROVED" | "REJECTED" | "RETIRED";
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}
export interface NarrationTimingCue {
  text: string;
  startMs: number;
  endMs: number;
  kind: "WORD" | "PHRASE";
}
export interface NarrationAssetMetadata {
  id: NarrationAssetId;
  projectId: StoryProjectId;
  storyboardId: StoryboardId;
  locale: Locale;
  provider: string;
  model: string;
  voiceId: string;
  normalizedTextHash: string;
  media: PrivateMediaReference;
  durationMs: number;
  timing: readonly NarrationTimingCue[];
  createdAt: IsoTimestamp;
}

export type GenerationJobType = "PLAN_GENERATION" | "VIDEO_GENERATION" | "STAGE_RETRY";
export const GENERATION_JOB_STATES = [
  "QUEUED",
  "CLAIMED",
  "RUNNING",
  "WAITING_RETRY",
  "SUCCEEDED",
  "FAILED",
  "CANCEL_REQUESTED",
  "CANCELLED",
] as const;
export type GenerationJobState = (typeof GENERATION_JOB_STATES)[number];
export const GENERATION_STAGES = [
  "PLANNING",
  "SEMANTIC_REVIEW",
  "ASSET_RESOLUTION",
  "NARRATION",
  "TIMING",
  "COMPOSITION",
  "RENDERING",
  "POST_PROCESSING",
  "STORAGE",
  "VALIDATION",
] as const;
export type GenerationStage = (typeof GENERATION_STAGES)[number];
export interface GenerationError {
  code: string;
  stage?: GenerationStage;
  retryable: boolean;
  safeMessage: string;
}
export interface GenerationAttempt {
  number: number;
  stage: GenerationStage;
  startedAt: IsoTimestamp;
  finishedAt?: IsoTimestamp;
  outcome: "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  error?: GenerationError;
}
export interface ProviderUsage {
  provider: string;
  operation: "PLAN" | "REVIEW" | "TTS" | "IMAGE" | "RENDER" | "STORAGE";
  model?: string;
  voiceId?: string;
  attempt: number;
  requestCount: number;
  inputTokens?: number;
  outputTokens?: number;
  characters?: number;
  audioDurationMs?: number;
  latencyMs: number;
  cacheHit: boolean;
  estimatedCostMinor: number;
  currency: string;
  pricingSnapshot: string;
  recordedAt: IsoTimestamp;
}
export interface GenerationJob {
  id: GenerationJobId;
  ownerId: AdultUserId;
  projectId: StoryProjectId;
  storyboardId?: StoryboardId;
  type: GenerationJobType;
  state: GenerationJobState;
  stage?: GenerationStage;
  idempotencyKey: string;
  inputHash: string;
  attempts: readonly GenerationAttempt[];
  usage: readonly ProviderUsage[];
  error?: GenerationError;
  cancelRequestedAt?: IsoTimestamp;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
  startedAt?: IsoTimestamp;
  finishedAt?: IsoTimestamp;
}
export interface VideoRenderMetadata {
  id: VideoRenderId;
  ownerId: AdultUserId;
  projectId: StoryProjectId;
  storyboardId: StoryboardId;
  generationJobId: GenerationJobId;
  status: "PROCESSING" | "READY" | "FAILED";
  locale: Locale;
  media?: PrivateMediaReference;
  durationMs?: number;
  width?: number;
  height?: number;
  fps?: number;
  videoCodec?: string;
  audioCodec?: string;
  renderProfileVersion: string;
  validation: {
    integrity: "PENDING" | "PASS" | "FAIL";
    educationalVisuals: "PENDING" | "PASS" | "FAIL";
    narrationSync: "PENDING" | "PASS" | "FAIL" | "HUMAN_REVIEW_REQUIRED";
  };
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}
