import { Schema, model, models, type Model } from "mongoose";
import {
  CINEMATIC_ACTION_TYPES,
  GENERATION_JOB_STATES,
  GENERATION_STAGES,
  LEARNER_LEVELS,
  SUPPORTED_LOCALES,
} from "../domain";

const text = (max: number) => ({ type: String, required: true, trim: true, maxlength: max });
const objectId = { type: Schema.Types.ObjectId, required: true };
const optionalObjectId = { type: Schema.Types.ObjectId };

const mediaRef = new Schema(
  {
    backend: { type: String, enum: ["LOCAL", "R2"], required: true },
    objectKey: text(1024),
    sha256: text(128),
    mimeType: text(100),
    sizeBytes: { type: Number, required: true, min: 0 },
  },
  { _id: false, strict: true },
);
const layer = new Schema(
  {
    role: {
      type: String,
      enum: [
        "BACKGROUND",
        "MIDGROUND",
        "FOREGROUND",
        "CHARACTER_BODY",
        "CHARACTER_HEAD",
        "CHARACTER_EYES",
        "CHARACTER_MOUTH",
        "CHARACTER_ARM_LEFT",
        "CHARACTER_ARM_RIGHT",
        "PROP",
        "EFFECT",
      ],
      required: true,
    },
    required: { type: Boolean, required: true },
    minDepth: { type: Number, required: true },
    maxDepth: { type: Number, required: true },
    supportedActions: { type: [String], enum: CINEMATIC_ACTION_TYPES, default: [] },
  },
  { _id: false, strict: true },
);
const sceneAsset = new Schema(
  {
    assetId: objectId,
    logicalKey: text(200),
    version: { type: Number, required: true, min: 1 },
    requiredLayers: { type: [layer], default: [] },
  },
  { _id: false, strict: true },
);
const action = new Schema(
  {
    id: text(120),
    type: { type: String, enum: CINEMATIC_ACTION_TYPES, required: true },
    startMs: { type: Number, required: true, min: 0 },
    endMs: { type: Number, required: true, min: 1 },
    targetRef: { type: String, maxlength: 200 },
    parameters: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false, strict: true },
);
const caption = new Schema(
  {
    text: text(180),
    startMs: { type: Number, required: true, min: 0 },
    endMs: { type: Number, required: true, min: 1 },
  },
  { _id: false, strict: true },
);
const scene = new Schema(
  {
    id: text(120),
    order: { type: Number, required: true, min: 0 },
    learningPurpose: text(500),
    narration: text(4000),
    visualIntent: text(500),
    estimatedDurationMs: { type: Number, required: true, min: 1 },
    facts: { type: [Schema.Types.Mixed], default: [] },
    assets: { type: [sceneAsset], default: [] },
    actions: { type: [action], default: [] },
    captionCues: { type: [caption], default: [] },
  },
  { _id: false, strict: true },
);
const safeError = new Schema(
  {
    code: text(120),
    stage: { type: String, enum: GENERATION_STAGES },
    retryable: { type: Boolean, required: true },
    safeMessage: text(500),
  },
  { _id: false, strict: true },
);
const attempt = new Schema(
  {
    number: { type: Number, required: true, min: 1 },
    stage: { type: String, enum: GENERATION_STAGES, required: true },
    startedAt: { type: Date, required: true },
    finishedAt: Date,
    outcome: {
      type: String,
      enum: ["RUNNING", "SUCCEEDED", "FAILED", "CANCELLED"],
      required: true,
    },
    error: safeError,
  },
  { _id: false, strict: true },
);
const usage = new Schema(
  {
    provider: text(100),
    operation: {
      type: String,
      enum: ["PLAN", "REVIEW", "TTS", "IMAGE", "RENDER", "STORAGE"],
      required: true,
    },
    model: { type: String, maxlength: 200 },
    voiceId: { type: String, maxlength: 200 },
    attempt: { type: Number, required: true, min: 1 },
    requestCount: { type: Number, required: true, min: 0 },
    inputTokens: { type: Number, min: 0 },
    outputTokens: { type: Number, min: 0 },
    characters: { type: Number, min: 0 },
    audioDurationMs: { type: Number, min: 0 },
    latencyMs: { type: Number, required: true, min: 0 },
    cacheHit: { type: Boolean, required: true },
    estimatedCostMinor: { type: Number, required: true, min: 0 },
    currency: { ...text(3), minlength: 3 },
    pricingSnapshot: text(200),
    recordedAt: { type: Date, required: true },
  },
  { _id: false, strict: true },
);

const userSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    authSubject: text(255),
    emailNormalized: { type: String, lowercase: true, trim: true, maxlength: 320 },
    passwordHash: { type: String, required: true, select: false },
    rolePreference: { type: String, enum: ["PARENT", "TEACHER"] },
    preferredLanguage: { type: String, enum: SUPPORTED_LOCALES },
    consentVersions: { type: Map, of: Date, default: {} },
    status: {
      type: String,
      enum: ["PENDING_AUTH", "ACTIVE", "SUSPENDED", "DELETION_PENDING"],
      required: true,
    },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: "users", strict: true, versionKey: false },
);
userSchema.index({ authSubject: 1 }, { unique: true });
userSchema.index(
  { emailNormalized: 1 },
  { unique: true, partialFilterExpression: { emailNormalized: { $type: "string" } } },
);

const lessonRequestSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    ownerId: objectId,
    learnerLevel: { type: String, enum: LEARNER_LEVELS, required: true },
    subjectKey: text(80),
    topicKey: text(120),
    language: { type: String, enum: SUPPORTED_LOCALES, required: true },
    instruction: text(2000),
    // Optional so drafts saved before open-ended ideas remain valid.
    taxonomySource: { type: String, enum: ["SELECTED", "INFERRED", "OPEN"] },
    creativePreferences: {
      type: [{ type: String, maxlength: 40 }],
      default: undefined,
      validate: (value: string[] | undefined) => !value || value.length <= 10,
    },
    preferredCharacterAssetId: optionalObjectId,
    status: {
      type: String,
      enum: ["DRAFT", "PLANNING", "REVIEW_READY", "APPROVED", "ARCHIVED"],
      required: true,
    },
    inputRevision: { type: Number, required: true, min: 1 },
    currentPlanVersion: { type: Number, required: true, min: 0 },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: "lessonRequests", strict: true, versionKey: false },
);
lessonRequestSchema.index({ ownerId: 1, updatedAt: -1, _id: -1 });
lessonRequestSchema.index({ ownerId: 1, status: 1 });

const videoPlanSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    ownerId: objectId,
    lessonRequestId: objectId,
    schemaVersion: { type: String, enum: ["1.0"], required: true },
    version: { type: Number, required: true, min: 1 },
    language: { type: String, enum: SUPPORTED_LOCALES, required: true },
    title: text(140),
    learningObjective: text(500),
    presentationMode: {type:String,enum:["ANIMATED_DEMONSTRATION","VISUAL_EXPLORATION","EXPLANATION","STORYTELLING"],required:true},
    explanationApproach: text(1000),
    storyPremise: {type:String,maxlength:1000},
    scenes: { type: [scene], required: true },
    validation: {
      schemaValid:{type:Boolean,required:true},
      deterministicValid:{type:Boolean,required:true},
      semanticDisposition:{type:String,enum:["PASS","NEEDS_REVISION","BLOCK"],required:true},
      summary:text(1000),
      findings:{type:[new Schema({code:text(120),severity:{type:String,enum:["INFO","WARNING","ERROR"],required:true},sceneIndex:{type:Number,min:0},message:text(500)},{_id:false,strict:true})],default:[]},
    },
    status: {
      type: String,
      enum: ["GENERATING", "INVALID", "REVIEW_READY", "APPROVED", "SUPERSEDED"],
      required: true,
    },
    contentHash: { type: String, maxlength: 200 },
    approvedBy: optionalObjectId,
    approvedAt: Date,
    createdAt: { type: Date, required: true },
  },
  { collection: "videoPlans", strict: true, versionKey: false },
);
videoPlanSchema.index({ lessonRequestId: 1, version: 1 }, { unique: true });
videoPlanSchema.index({ ownerId: 1, lessonRequestId: 1, version: -1 });

const generationJobSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    ownerId: objectId,
    lessonRequestId: objectId,
    videoPlanId: optionalObjectId,
    type: {
      type: String,
      enum: ["PLAN_GENERATION", "VIDEO_GENERATION", "STAGE_RETRY"],
      required: true,
    },
    state: { type: String, enum: GENERATION_JOB_STATES, required: true },
    stage: { type: String, enum: GENERATION_STAGES },
    idempotencyKey: text(200),
    inputHash: text(200),
    attempts: { type: [attempt], default: [] },
    usage: { type: [usage], default: [] },
    error: safeError,
    leaseOwner: { type: String, maxlength: 200 },
    leaseExpiresAt: Date,
    heartbeatAt: Date,
    cancelRequestedAt: Date,
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    startedAt: Date,
    finishedAt: Date,
  },
  { collection: "generationJobs", strict: true, versionKey: false },
);
generationJobSchema.index({ idempotencyKey: 1 }, { unique: true });
generationJobSchema.index({ state: 1, createdAt: 1 });
generationJobSchema.index({ leaseExpiresAt: 1 });
generationJobSchema.index({ ownerId: 1, updatedAt: -1 });
generationJobSchema.index({ videoPlanId: 1, type: 1 });

const assetSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    logicalKey: text(200),
    version: { type: Number, required: true, min: 1 },
    kind: {
      type: String,
      enum: ["CHARACTER", "OBJECT", "BACKGROUND", "ICON", "FONT", "MUSIC", "SFX"],
      required: true,
    },
    format: { type: String, enum: ["SVG", "PNG", "JSON", "AUDIO", "FONT"], required: true },
    styleFamily: text(120),
    layers: { type: [layer], default: [] },
    poses: { type: [String], default: [] },
    expressions: { type: [String], default: [] },
    actions: { type: [String], enum: CINEMATIC_ACTION_TYPES, default: [] },
    storageRef: { type: mediaRef, required: true },
    provenance: { source: text(300), creator: text(200), method: text(200) },
    license: {
      identifier: text(200),
      commercialUse: {
        type: String,
        enum: ["ALLOWED", "PROHIBITED", "UNVERIFIED"],
        required: true,
      },
      evidenceRef: { type: String, maxlength: 500 },
    },
    approvalState: {
      type: String,
      enum: ["DRAFT", "REVIEW_REQUIRED", "APPROVED", "REJECTED", "RETIRED"],
      required: true,
    },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: "assets", strict: true, versionKey: false },
);
assetSchema.index({ logicalKey: 1, version: 1 }, { unique: true });
assetSchema.index({ kind: 1, styleFamily: 1, approvalState: 1 });

const videoSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    ownerId: objectId,
    lessonRequestId: objectId,
    videoPlanId: objectId,
    generationJobId: objectId,
    status: {
      type: String,
      enum: ["PROCESSING", "READY", "FAILED", "EXPIRED", "DELETION_PENDING"],
      required: true,
    },
    language: { type: String, enum: SUPPORTED_LOCALES, required: true },
    mediaRef: mediaRef,
    durationMs: { type: Number, min: 1 },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
    fps: { type: Number, min: 1 },
    videoCodec: { type: String, maxlength: 80 },
    audioCodec: { type: String, maxlength: 80 },
    audioSampleRate: { type: Number, min: 1 },
    fileSizeBytes: { type: Number, min: 0 },
    renderProfileVersion: text(100),
    validation: {
      integrity: { type: String, enum: ["PENDING", "PASS", "FAIL"], required: true },
      educationalVisuals: { type: String, enum: ["PENDING", "PASS", "FAIL"], required: true },
      narrationSync: {
        type: String,
        enum: ["PENDING", "PASS", "FAIL", "HUMAN_REVIEW_REQUIRED"],
        required: true,
      },
    },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: "videos", strict: true, versionKey: false },
);
videoSchema.index({ ownerId: 1, createdAt: -1 });
videoSchema.index({ generationJobId: 1 }, { unique: true });

const existing = (name: string, schema: Schema): Model<unknown> =>
  (models[name] as Model<unknown> | undefined) ?? model<unknown>(name, schema);
export const UserModel = existing("User", userSchema);
export const LessonRequestModel = existing("LessonRequest", lessonRequestSchema);
export const VideoPlanModel = existing("VideoPlan", videoPlanSchema);
export const GenerationJobModel = existing("GenerationJob", generationJobSchema);
export const AssetModel = existing("Asset", assetSchema);
export const VideoModel = existing("Video", videoSchema);
export const DATABASE_MODELS = [
  UserModel,
  LessonRequestModel,
  VideoPlanModel,
  GenerationJobModel,
  AssetModel,
  VideoModel,
] as const;
/** Add documented indexes without dropping any existing database indexes. */
export async function createDatabaseIndexes(): Promise<void> {
  for (const databaseModel of DATABASE_MODELS) await databaseModel.createIndexes();
}
