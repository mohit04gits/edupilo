# Technical Design

> **Confirmed visual direction (11 November 2026):** The renderer consumes layered 3D-style PNG/SVG assets and produces cinematic 2.5D motion. Scene manifests must describe real character/object changes, depth, timing and deterministic educational overlays. Remotion composes and renders these layers; it is not treated as a generative 3D engine. Static pan/zoom-only scenes fail the V1 animation bar.

## AI Educational Story Video Platform — V1 Reference Architecture

**Status:** Proposed reference design — pending relevant approvals  
**Last updated:** 10 November 2026  
**Sources of truth:** `docs/PRD.md`, `docs/DECISIONS.md`, `AGENTS.md`, and `PROJECT_STATUS.md`

This document translates the working product requirements into an implementable technical design. It does not approve technologies or resolve open product decisions. When this document and the decision register differ, `docs/DECISIONS.md` controls approval status.

## Approval boundaries

| Area | Status carried from decision register |
|---|---|
| Gemini creator/planner direction | Approved for Phase 0; exact model and production configuration unapproved |
| Groq semantic reviewer/fallback direction | Approved for Phase 0; exact model unapproved |
| ElevenLabs TTS direction | Approved for internal Phase 0 evaluation; exact model/voices and production/commercial use unapproved |
| Cloudflare R2 hosted-media direction | Approved; access, retention, deletion, backup, limits, and pricing unresolved |
| Script and storyboard generated together | Approved |
| Deterministic mathematical validation | Approved |
| Next.js, TypeScript application composition, MongoDB Atlas/Mongoose, separate worker | Proposed; not approved for implementation |
| Remotion | Candidate for evaluation; not an approved commercial dependency |
| FFmpeg | Proposed; build, codec, and distribution compliance unresolved |
| Adult approval gate | Working P0 requirement, but final safety checklist approval is inconsistent/open |
| Native 1080p final quality, aspect ratio, and FPS | 1080p requirement remains pending final approval; aspect ratio and FPS are open |

## 1. System architecture

### 1.1 Proposed deployment shape

Use a modular monolith for the web application plus one separate background worker. This is a process boundary for long-running work, not a microservice architecture.

```mermaid
flowchart TB
    U[Adult browser]
    APP[Proposed Next.js + TypeScript application]
    AUTH[Authentication adapter\nmethod pending]
    DB[(Proposed MongoDB Atlas\nmetadata only)]
    JOBS[(Generation jobs and checkpoints)]
    WORKER[Proposed Node.js/TypeScript worker\none job at a time]
    GEMINI[Gemini creator adapter]
    GROQ[Groq reviewer / fallback adapter]
    TTS[ElevenLabs TTS adapter]
    CATALOG[Asset catalogue\nlayered SVG/PNG]
    REMOTION[Remotion candidate renderer]
    FFMPEG[FFmpeg proposed processor]
    LOCAL[(Local media in development)]
    R2[(Cloudflare R2 when hosted)]

    U -->|HTTPS| APP
    APP --> AUTH
    APP --> DB
    APP -->|Create/read durable job| JOBS
    WORKER -->|Claim with lease| JOBS
    WORKER --> GEMINI
    WORKER --> GROQ
    WORKER --> TTS
    WORKER --> CATALOG
    WORKER --> REMOTION
    REMOTION --> FFMPEG
    FFMPEG --> LOCAL
    FFMPEG --> R2
    WORKER -->|Checkpoints and artifact metadata| DB
    APP -->|Authorized playback URL| LOCAL
    APP -->|Short-lived authorized access| R2
    APP --> U
```

### 1.2 Proposed application structure

The following is a target module layout, not an instruction to scaffold before stack approval.

| Module | Responsibility | Must not do |
|---|---|---|
| Web UI | Lesson input, combined plan review, revision requests, approval, status, and playback | Run provider calls or render video in the browser |
| Server API | Authentication boundary, authorization, validation, resource CRUD, approval transaction, job creation, playback authorization | Hold an HTTP request open for TTS or rendering |
| Domain services | Lesson rules, plan versioning, approval policy, state transitions, deterministic math validation | Import provider SDKs directly |
| Provider adapters | Gemini, Groq, ElevenLabs TTS, storage, and renderer-specific translation | Leak provider response formats into domain entities |
| Persistence adapters | Metadata models, queries, atomic state transitions, leases, and idempotency records | Store large media binaries in MongoDB |
| Background worker | Claim one job, execute stages, checkpoint outputs, retry safely, and release leases | Accept user traffic or bypass authorization/approval checks |
| Render package | Scene manifests, reusable animation templates, timing conversion, and render validation | Generate educational facts independently of approved structured data |
| Shared contracts | Versioned request/response schemas, enums, error codes, and normalized timing types | Contain secrets or environment-specific values |

### 1.3 Server-side API responsibilities

- Establish an authenticated adult principal using the approved authentication method.
- Authorize every lesson, plan, job, asset reference, video, and playback request by owner.
- Validate inputs against explicit schemas and supported class/language/topic values.
- Create lesson drafts and immutable plan versions.
- Accept scoped revision instructions without mutating previously approved versions.
- Atomically freeze an approved plan and create one idempotent generation job.
- Return durable named job stages rather than fabricated progress percentages.
- Issue playback responses or short-lived signed URLs only after authorization.
- Return quickly after durable state changes; provider work runs in the worker.

### 1.4 Communication rules

| Path | Contract |
|---|---|
| Browser → API | HTTPS JSON; authenticated session; CSRF protection if cookie-based auth is selected |
| API → MongoDB | Metadata-only reads/writes; owner-scoped queries; atomic approval/job transitions |
| Worker → MongoDB | Lease-based job claim, heartbeat, bounded attempt count, stage checkpoints, sanitized errors |
| Worker → AI/TTS providers | Server-side credentials, strict timeouts, usage recording, bounded retry/backoff |
| Worker → renderer | Versioned scene manifest plus approved plan and normalized narration timing |
| Worker → media storage | Private objects; deterministic object keys; integrity metadata; no permanent public URL |
| API → media storage | Authorized stream/proxy in development or short-lived signed URL when hosted |

### 1.5 End-to-end data flow

1. Adult creates a lesson request.
2. API validates and stores the request, then creates a `PLAN_GENERATION` job.
3. Worker asks Gemini for one structured script-and-storyboard response.
4. Worker validates JSON shape, supported actions, age rules, and deterministic facts.
5. Groq reviews semantic alignment. On bounded correction, Gemini receives structured findings. If Gemini remains unavailable or invalid after allowed retry, a tested Groq fallback may produce the same schema.
6. A valid plan version becomes `REVIEW_READY`; no media generation occurs yet.
7. Adult requests revisions or atomically approves a specific plan version.
8. Approval creates one `VIDEO_GENERATION` job keyed by the approved plan version.
9. Worker resolves assets, generates narration, normalizes timing, creates a scene manifest, renders, processes, validates, and stores the final MP4.
10. API exposes job status and authorized playback; it does not expose V1 download.

## 2. AI video-generation pipeline

```mermaid
flowchart LR
    A[Lesson input] --> B[Input and safety validation]
    B --> C[Gemini: script + storyboard JSON]
    C --> D[Schema validation]
    D --> E[Deterministic education validation]
    E --> F[Groq semantic review]
    F -->|Pass| G[Review-ready plan]
    F -->|Bounded correction| C
    C -. retry exhausted .-> H[Groq fallback using same schema]
    H --> D
    G --> I{Adult decision}
    I -->|Revise| C
    I -->|Approve immutable version| J[Asset resolution]
    J --> K[ElevenLabs narration]
    K --> L[Word/phrase timing normalization]
    J --> M[Layered scene assets]
    L --> N[Scene manifest]
    M --> N
    N --> O[Remotion candidate composition]
    O --> P[FFmpeg processing and validation]
    P --> Q[Private MP4 storage]
    Q --> R[Authorized playback]
```

### 2.1 Input contract and validation

Minimum input:

| Field | Constraint |
|---|---|
| `learnerLevel` | Approved Nursery/KG/Class 1–4 taxonomy only |
| `subject` / `topic` | Selected initial taxonomy only; selection pending |
| `language` | `en-IN` or `hi-IN` initially; exact locale policy to validate |
| `instruction` | Required, bounded length, normalized Unicode, injection-aware validation |
| `preferredContext` | Optional non-personal scenario/character request |

Do not require a child’s name, date of birth, school, photo, voice, or location. Personalization remains unresolved and must not be implemented by default.

### 2.2 Versioned structured plan

The LLM must return data conforming to a versioned schema. It must not return renderer code.

```json
{
  "schemaVersion": "1.0",
  "lesson": {
    "objective": "Recognize multiplication as equal groups",
    "learnerLevel": "CLASS_2",
    "language": "en-IN",
    "title": "Ria Rabbit and the Carrot Groups"
  },
  "story": {
    "premise": "A rabbit arranges carrots into equal groups",
    "summary": "The learner sees repeated addition become multiplication."
  },
  "scenes": [
    {
      "sceneId": "scene-01",
      "learningPurpose": "Introduce three equal groups of two",
      "narration": "Ria makes three groups with two carrots in each group.",
      "visualIntent": "Show exactly three baskets and reveal two carrots per basket.",
      "assets": ["character.rabbit.ria", "object.carrot", "object.basket"],
      "facts": {
        "groups": 3,
        "itemsPerGroup": 2,
        "total": 6,
        "equation": "3 × 2 = 6"
      },
      "actions": [
        {"type": "REVEAL_GROUPS", "count": 3},
        {"type": "DISTRIBUTE_ITEMS", "itemsPerGroup": 2},
        {"type": "SHOW_LABEL", "textRef": "equation"}
      ],
      "captionCues": ["three groups", "two carrots each"],
      "estimatedDurationMs": 9000,
      "reviewFlags": []
    }
  ],
  "safetyFlags": [],
  "factualReviewRequired": true
}
```

Required schema rules:

- Stable `schemaVersion`; reject unsupported major versions.
- Stable `sceneId` within a plan version.
- Every scene has one learning purpose, narration, visual intent, supported assets/actions, and an estimated duration.
- Numeric educational facts are typed values, never extracted from display text.
- `total` and `equation` must pass deterministic recomputation.
- Actions use an allowlist; unknown actions return the plan for correction.
- Captions are derived from approved narration and timing, not treated as independent facts.
- Text fields have size limits and are escaped before display/rendering.

### 2.3 Gemini creation

- One request should create the initial script and storyboard together.
- Prompt includes learner level, language, learning objective, supported actions, available asset IDs, schema, and safety constraints.
- Use a configured exact model only after Phase 0 selection.
- Validate response locally; do not accept prose wrapped around JSON as successful output.
- Record model identifier, input/output token usage, latency, attempt number, and sanitized error.

### 2.4 Groq review and fallback

- Reviewer receives the normalized plan plus an explicit rubric.
- Reviewer returns structured findings: `severity`, `sceneId`, `rule`, `explanation`, and `suggestedConstraint`; it does not rewrite an approved plan.
- Review checks age level, factual consistency, narration/visual agreement, caption density, unsupported actions, and cross-scene continuity.
- Auto-correction is bounded and occurs before adult approval.
- Fallback generation is activated only after retryable Gemini failures or repeated invalid output according to an approved policy.
- Exact model, false-positive tolerance, and fallback limits remain open.

### 2.5 Adult approval boundary

- Display narration and scene intent together.
- Revisions create a new plan version; never overwrite the previous version.
- Approval targets an exact immutable plan version and records adult user, timestamp, and content hash.
- The approval request and job creation must be one idempotent operation.
- Any content-changing revision after approval requires a new approval before media regeneration.

### 2.6 Illustration and asset resolution

Resolution order:

1. Approved layered SVG assets
2. Approved transparent PNG assets
3. Procedural shapes, diagrams, labels, and deterministic object layouts
4. Optional static generated illustration only if later approved and validated

Each asset record needs a stable logical key, version, type, dimensions/view box, layers/poses, style family, storage reference, integrity hash, provenance, license, attribution, and approval state. Embedded educational text should be avoided; render important text programmatically.

### 2.7 ElevenLabs narration and timing

- Generate audio only from approved narration.
- Normalize numbers, equations, abbreviations, dates, symbols, and pause cues before synthesis.
- Validate language/voice compatibility before sending a request.
- Cache by provider, exact model/voice, settings, locale, and normalized-text hash.
- Request timestamped TTS alignment and normalize character timing into word/phrase cues; use an approved forced-alignment fallback only if measured alignment is inadequate.
- Normalize all cues to millisecond offsets and preserve provider timing metadata for audit.
- Reject empty, clipped, wrong-language, or incomplete audio; never silently switch voice/language.

### 2.8 Synchronization model

Narration timing becomes authoritative after synthesis.

| Cue | Derived behavior |
|---|---|
| Phrase start | Highlight/reveal the related object or label |
| Count word | Add or emphasize the exact deterministic item/group |
| Equation phrase | Reveal repeated addition and multiplication label |
| Pause | Hold the completed visual long enough for comprehension |
| Scene end | Transition only after required visual comprehension hold |

The scene manifest contains resolved assets, measured audio duration, normalized cues, actions, frame ranges, captions, safe-area layout, and validation results. Exact synchronization tolerances remain a POC output.

### 2.9 Animation, processing, and playback

- Remotion is the candidate for timeline composition, animated SVG/PNG/text, camera motion, transitions, and frame rendering.
- Use prepared poses and controlled translation, scale, rotation, opacity, masks, highlights, swaps, and camera movement. Full skeletal animation is outside V1.
- FFmpeg is proposed for media inspection, final encoding/transcoding, audio normalization/mixing, stream validation, and optional thumbnail generation.
- Final output is a private MP4 object with duration, codec, resolution, frame rate, audio-stream, checksum, and size metadata.
- V1 provides authorized playback only. Do not expose a download action or permanent public object URL.

## 3. Database schema

MongoDB Atlas + Mongoose is a proposed implementation. The metadata model below remains useful even if another approved document database is selected. Use `ObjectId` references, timestamps, schema validation, and owner-scoped indexes. Store no video, audio, frame, or large image binaries.

### 3.1 Common conventions

- `_id`: database-generated identifier.
- `createdAt` / `updatedAt`: UTC timestamps.
- `ownerId`: adult user authorization boundary where applicable.
- Enum fields reject unknown values.
- Mutable resources use `version` or optimistic concurrency.
- Provider metadata excludes secrets and raw sensitive payloads.
- Soft deletion is not assumed; deletion behavior remains pending retention approval.

### 3.2 `users`

| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `authSubject` | string | Required, unique; opaque ID from selected auth provider |
| `emailNormalized` | string | Optional until auth method is approved; unique/sparse if stored |
| `rolePreference` | enum | `PARENT`, `TEACHER`; experience preference, not authorization tier |
| `preferredLanguage` | enum | `en-IN`, `hi-IN`; optional |
| `consentVersions` | object | Policy identifier → accepted timestamp; exact policy pending |
| `status` | enum | `ACTIVE`, `SUSPENDED`, `DELETION_PENDING` |
| `createdAt`, `updatedAt` | date | Required |

Indexes: unique `authSubject`; optional unique sparse `emailNormalized`; `{status: 1}` only if operationally needed.

### 3.3 `lessonRequests`

| Field | Type | Constraints |
|---|---|---|
| `_id`, `ownerId` | ObjectId | Required; `ownerId → users` |
| `learnerLevel` | enum | Approved age/grade taxonomy |
| `subjectKey`, `topicKey` | string | Required; supported taxonomy only |
| `language` | enum | `en-IN` or `hi-IN` |
| `instruction` | string | Required; bounded; sanitized for display |
| `preferredContext` | object | Optional non-personal character/scenario fields |
| `status` | enum | `DRAFT`, `PLANNING`, `REVIEW_READY`, `APPROVED`, `ARCHIVED` |
| `currentPlanVersion` | number | Non-negative integer |
| `createdAt`, `updatedAt` | date | Required |

Indexes: `{ownerId: 1, updatedAt: -1}`; `{ownerId: 1, status: 1}`. Never create a global topic/history profile for a child.

### 3.4 `videoPlans`

| Field | Type | Constraints |
|---|---|---|
| `_id`, `ownerId`, `lessonRequestId` | ObjectId | Required; lesson and owner must match |
| `version` | number | Required, starts at 1; immutable content version |
| `schemaVersion` | string | Required; supported version |
| `generator` | object | Provider/model/config revision, usage, latency; no secret |
| `reviewer` | object | Provider/model/findings/result; no secret |
| `lesson`, `story`, `scenes` | embedded objects | Must pass structured schema and size limits |
| `validation` | object | Schema, semantic, math, safety results |
| `status` | enum | `GENERATING`, `INVALID`, `REVIEW_READY`, `APPROVED`, `SUPERSEDED` |
| `contentHash` | string | Required once valid; integrity/idempotency key component |
| `approvedBy`, `approvedAt` | ObjectId/date | Both null unless approved |
| `createdAt` | date | Required; content remains immutable after review-ready except status/approval metadata |

Indexes: unique `{lessonRequestId: 1, version: 1}`; `{ownerId: 1, lessonRequestId: 1}`; optional unique `{lessonRequestId: 1, contentHash: 1}`.

### 3.5 `generationJobs`

| Field | Type | Constraints |
|---|---|---|
| `_id`, `ownerId`, `lessonRequestId` | ObjectId | Required |
| `videoPlanId` | ObjectId | Required for video generation; must reference approved immutable plan |
| `type` | enum | `PLAN_GENERATION`, `VIDEO_GENERATION`, `STAGE_RETRY` |
| `state` | enum | See §5.1 |
| `stage` | enum | `PLANNING`, `SEMANTIC_REVIEW`, `ASSET_RESOLUTION`, `NARRATION`, `TIMING`, `COMPOSITION`, `RENDERING`, `POST_PROCESSING`, `STORAGE`, `VALIDATION` |
| `idempotencyKey` | string | Required, unique per logical operation |
| `attempts` / `maxAttempts` | number | Non-negative; bounded by stage policy |
| `leaseOwner`, `leaseExpiresAt`, `heartbeatAt` | string/date/date | Nullable; used for atomic claim and stale recovery |
| `cancelRequestedAt` | date | Nullable; worker checks at safe checkpoints |
| `checkpoints` | array | Stage, status, input/output artifact refs, timestamps, hash |
| `usage` | array | Provider/model, tokens/characters/requests, latency, estimated cost |
| `error` | object | Sanitized code, stage, retryable flag, message; no secrets/raw sensitive payload |
| `createdAt`, `updatedAt`, `startedAt`, `finishedAt` | date | Lifecycle timestamps |

Indexes: unique `idempotencyKey`; `{state: 1, createdAt: 1}` for claims; `{leaseExpiresAt: 1}` for stale recovery; `{ownerId: 1, updatedAt: -1}`; `{videoPlanId: 1, type: 1}`.

### 3.6 `assets`

| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `logicalKey`, `version` | string/number | Stable asset identity and revision |
| `kind` | enum | `CHARACTER`, `OBJECT`, `BACKGROUND`, `ICON`, `FONT`, `MUSIC`, `SFX` |
| `format` | enum | `SVG`, `PNG`, `JSON`, `AUDIO`, `FONT` as supported |
| `styleFamily` | string | Required for visual consistency |
| `layers`, `poses`, `expressions`, `actions` | arrays | Allowlisted capability metadata |
| `storageRef` | object | Backend, private object key/path, checksum, MIME type, size |
| `provenance` | object | Creator/source/model/prompt where applicable |
| `license` | object | License ID, commercial-use state, attribution, evidence reference |
| `approvalState` | enum | `DRAFT`, `REVIEW_REQUIRED`, `APPROVED`, `REJECTED`, `RETIRED` |
| `createdAt`, `updatedAt` | date | Required |

Indexes: unique `{logicalKey: 1, version: 1}`; `{kind: 1, styleFamily: 1, approvalState: 1}`. Only `APPROVED` assets may enter a final render.

### 3.7 `videos`

| Field | Type | Constraints |
|---|---|---|
| `_id`, `ownerId`, `lessonRequestId`, `videoPlanId`, `generationJobId` | ObjectId | Required relationships |
| `status` | enum | `PROCESSING`, `READY`, `FAILED`, `EXPIRED`, `DELETION_PENDING` |
| `mediaRef` | object | Backend, private object key/path, checksum; never a permanent public URL |
| `durationMs`, `width`, `height`, `fps` | number | Required when ready; validated positive values |
| `videoCodec`, `audioCodec`, `audioSampleRate` | string/number | Required when ready |
| `language` | enum | Must match approved plan |
| `fileSizeBytes` | number | Required when ready |
| `validation` | object | Integrity, streams, duration, resolution, synchronization review outcome |
| `retentionClass`, `expiresAt` | string/date | Values pending retention decision |
| `createdAt`, `updatedAt` | date | Required |

Indexes: `{ownerId: 1, createdAt: -1}`; unique `{generationJobId: 1}`; `{status: 1, expiresAt: 1}` for approved lifecycle processing.

### 3.8 Relationship summary

```mermaid
erDiagram
    USERS ||--o{ LESSON_REQUESTS : owns
    USERS ||--o{ VIDEO_PLANS : reviews
    LESSON_REQUESTS ||--o{ VIDEO_PLANS : versions
    VIDEO_PLANS ||--o{ GENERATION_JOBS : drives
    LESSON_REQUESTS ||--o{ GENERATION_JOBS : tracks
    VIDEO_PLANS ||--o| VIDEOS : produces
    GENERATION_JOBS ||--o| VIDEOS : creates
    ASSETS }o--o{ VIDEO_PLANS : referenced_by
```

## 4. API design

All endpoints are proposed under `/api/v1`. Exact authentication endpoints depend on the unresolved auth method. Every private resource query must include an owner authorization filter, not merely fetch by ID and check later.

### 4.1 Response and error conventions

Success envelope:

```json
{"data": {}, "requestId": "req_..."}
```

Error envelope:

```json
{
  "error": {
    "code": "PLAN_NOT_APPROVED",
    "message": "The selected plan version must be approved before generation.",
    "retryable": false,
    "details": []
  },
  "requestId": "req_..."
}
```

Use stable application error codes. Do not expose provider payloads, stack traces, object keys, secrets, or sensitive inputs.

### 4.2 Authentication and profile

| Method and path | Purpose | Request | Response | Authorization |
|---|---|---|---|---|
| `POST /auth/register` | Create adult account if selected auth method owns registration | Auth-provider-specific validated credentials/flow | Session principal and minimal profile | Public with rate limiting; exact route pending auth decision |
| `POST /auth/session` | Establish adult session | Provider-specific proof | Session principal | Public with rate limiting; exact route pending |
| `DELETE /auth/session` | End session | None | `204` | Authenticated adult |
| `GET /profile` | Read current profile | None | `userId`, role preference, preferred language | Authenticated adult |
| `PATCH /profile` | Change experience preferences | `{rolePreference?, preferredLanguage?}` | Updated profile | Authenticated adult; no privilege elevation |

Role preference personalizes wording/defaults and must not create separate authorization tiers in V1.

### 4.3 Lesson and plan endpoints

| Method and path | Purpose | Key request shape | Key response shape | Authorization / rules |
|---|---|---|---|---|
| `POST /lessons` | Create draft lesson | `{learnerLevel, subjectKey, topicKey, language, instruction, preferredContext?}` | `{lessonId, status: "DRAFT"}` | Authenticated adult; validate supported taxonomy and minimize child data |
| `GET /lessons` | List owned recent projects | Query: cursor, status, limit | `{items, nextCursor}` | Owner only; full library scope pending |
| `GET /lessons/{lessonId}` | Retrieve project aggregate | None | Lesson, current plan summary, current job, video summary | Owner only |
| `PATCH /lessons/{lessonId}` | Update draft input | Mutable lesson fields | Updated draft | Owner only; reject if a generation is active or preserve version semantics |
| `POST /lessons/{lessonId}/plans` | Generate script/storyboard | `{idempotencyKey}` | `{jobId, stage: "PLANNING"}` with `202` | Owner only; creates durable plan job; rate/spend checks |
| `GET /lessons/{lessonId}/plans` | List plan versions | Cursor optional | Plan summaries | Owner only |
| `GET /plans/{planId}` | Review full structured plan | None | Script, scenes, validations, findings, approval state | Owner only |
| `POST /plans/{planId}/revisions` | Request scoped natural-language revision | `{instruction, targetSceneIds?, idempotencyKey}` | `{jobId, basePlanId}` with `202` | Owner only; previous plan remains immutable |
| `POST /plans/{planId}/approval` | Approve exact version and create video job | `{contentHash, idempotencyKey}` | `{approvedPlanId, jobId}` with `202` | Owner only; atomic; reject hash mismatch or invalid plan |

Example lesson creation:

```json
{
  "learnerLevel": "CLASS_2",
  "subjectKey": "MATH",
  "topicKey": "MULTIPLICATION_EQUAL_GROUPS",
  "language": "en-IN",
  "instruction": "Explain multiplication using a rabbit and carrots.",
  "preferredContext": {"characterKey": "character.rabbit.ria"}
}
```

### 4.4 Job and playback endpoints

| Method and path | Purpose | Response | Authorization / rules |
|---|---|---|---|
| `GET /jobs/{jobId}` | Read durable named stage | `{jobId, state, stage, attempts, canCancel, error?, updatedAt}` | Owner only |
| `POST /jobs/{jobId}/cancel` | Request cancellation | `{state: "CANCEL_REQUESTED"}` | Owner only; idempotent; completes at safe checkpoint |
| `POST /jobs/{jobId}/retry` | Retry an eligible failed stage | `{newJobId}` or updated job | Owner only; bounded; disclose possible provider usage; preserve checkpoints |
| `GET /videos/{videoId}` | Retrieve authorized metadata | Topic/language/duration/status/validation summary | Owner only |
| `POST /videos/{videoId}/playback-session` | Issue playback access | Development stream URL or short-lived signed URL plus expiry | Owner only; ready video; no download disposition |

Polling is sufficient initially. Server-Sent Events may be proposed later if measured UX requires it; WebSockets are not required for V1.

### 4.5 HTTP behavior

- `201` for synchronous resource creation; `202` for durable asynchronous work.
- `400` malformed request, `401` unauthenticated, `403` unauthorized, `404` absent or inaccessible resource, `409` version/idempotency/state conflict, `422` schema/educational validation failure, `429` application quota, `503` temporary provider/worker unavailability.
- Mutation requests that can create external usage require an idempotency key.
- Pagination uses opaque cursors and bounded limits.
- API logs record request ID and sanitized resource/job IDs, not narration or child-related free text by default.

## 5. Background job architecture

### 5.1 Persistent state machine

```mermaid
stateDiagram-v2
    [*] --> QUEUED
    QUEUED --> CLAIMED
    CLAIMED --> RUNNING
    RUNNING --> WAITING_RETRY: retryable failure
    WAITING_RETRY --> QUEUED: backoff elapsed
    RUNNING --> SUCCEEDED
    RUNNING --> FAILED: terminal failure
    QUEUED --> CANCELLED: cancel
    RUNNING --> CANCEL_REQUESTED: cancel request
    CANCEL_REQUESTED --> CANCELLED: safe checkpoint
    CLAIMED --> QUEUED: stale lease recovered
```

User-facing stages are separate from machine state. A job can be `RUNNING` at `NARRATION`, `RENDERING`, or another named stage.

### 5.2 Sequential worker

- One worker process claims at most one heavy job at a time on the development laptop.
- Claim uses an atomic update from `QUEUED` to `CLAIMED` where no live lease exists.
- Worker writes `leaseOwner`, `leaseExpiresAt`, and periodic heartbeat.
- A stale-lease recovery routine returns safe jobs to `QUEUED` or marks them for manual review when stage safety is unknown.
- Do not introduce Redis/BullMQ before measured concurrency or reliability requirements justify it and approval is recorded.

### 5.3 Stage checkpoints

Each checkpoint records:

- Input content/config hash
- Stage status and attempt
- Private artifact references and checksums
- Provider/model/voice/config revision
- Usage, latency, and timestamps
- Validation summary
- Next safe stage

Recommended video stages:

1. `ASSET_RESOLUTION`
2. `NARRATION`
3. `TIMING`
4. `COMPOSITION`
5. `RENDERING`
6. `POST_PROCESSING`
7. `STORAGE`
8. `VALIDATION`

Do not delete the last successful final video until a replacement completes validation.

### 5.4 Idempotency and retry

- Plan generation key: owner + lesson + normalized input revision + operation ID.
- Video generation key: owner + approved plan ID + plan content hash + render-profile version.
- Provider cache key includes provider, exact model/voice, settings, locale, and normalized input hash.
- Retry only errors classified as transient: timeout, provider `429`, temporary `5xx`, recoverable process failure, or lease expiration.
- Use bounded exponential backoff with jitter and honor `Retry-After`.
- Validation, safety, unsupported action, authorization, licensing, and missing-approved-asset failures are not blind-retry candidates.
- Exact retry counts remain a measured Phase 0/Phase 1 decision.

### 5.5 Failure recovery and cancellation

- Preserve lesson input, all plan versions, approval evidence, successful narration/assets, and validated prior video.
- Return a stage-specific, sanitized error and whether retry may consume provider quota.
- Before rendering, cancellation can terminate at the next provider boundary.
- During rendering, set `CANCEL_REQUESTED`; stop at the next safe frame/segment/process checkpoint and clean only known temporary artifacts.
- Never expose partial or corrupt output as ready.

### 5.6 Usage and cost tracking

Record per external request:

- Provider, exact model/voice, operation, attempt
- Input/output tokens or TTS characters/audio duration
- Request latency and status
- Cache hit/miss
- Estimated cost using a versioned pricing snapshot, clearly labeled an estimate

Apply development quotas and alerts where providers support them. Paid usage requires founder approval.

## 6. Storage design

### 6.1 Development filesystem — proposed

```text
media/
  projects/{ownerScopedProjectId}/
    plans/
    narration/
    assets/
    scenes/
    previews/
    final/
```

- Generate opaque owner-scoped project IDs; never use child names in paths.
- Prevent traversal and sanitize filenames.
- Keep metadata and checksums in the database; store only media files on disk.
- Use explicit temporary directories and stage cleanup rules.
- Development filesystem storage is single-machine only and provides no public deployment durability.

### 6.2 Cloudflare R2 hosted direction

Proposed private key pattern:

```text
projects/{ownerId}/{lessonId}/{artifactType}/{artifactVersion}/{opaqueFilename}
```

- Buckets remain private.
- Store only the bucket/object key and checksum in MongoDB, never a permanent public URL.
- API authorizes the owner, then issues a short-lived signed playback URL or controlled stream.
- Playback response must not set a user-facing download disposition in V1.
- Validate object checksum, content type, size, and expected media streams before marking ready.
- CORS must allow only approved application origins and methods.

### 6.3 Unresolved lifecycle policy

The following must be approved before invited beta:

- Retention for temporary frames, scene renders, narration, failed jobs, and final videos
- Signed URL lifetime
- Final-video expiry and long-term availability promise
- Project deletion and deletion propagation
- Backup/recovery scope and schedule
- Storage/request/egress ceilings and alert thresholds
- Treatment of cached provider artifacts shared across revisions

Until approved, do not promise indefinite storage or implement irreversible automated deletion.

## 7. Security and educational safety

### 7.1 Authentication and authorization

- Authentication method remains open; use an established library/provider after approval rather than implementing password cryptography directly.
- Accounts are adult-operated. Parent/Teacher is a preference, not a privilege tier.
- Every owner-scoped query includes `ownerId` from the server-established principal.
- Use secure, HTTP-only, same-site cookies if cookie sessions are selected; apply CSRF protection to state-changing routes.
- Rate-limit authentication, generation, approval, retry, and playback-session endpoints.
- Prevent object-ID enumeration by returning the same inaccessible/not-found behavior.

### 7.2 Provider and application secrets

- Store keys only in server/worker secret configuration.
- Never expose keys to browser bundles, repository files, logs, rendered video, or error responses.
- Separate development and hosted credentials and restrict each key to required permissions.
- Rotate credentials after suspected disclosure.

### 7.3 Input and render safety

- Validate JSON shapes, enum values, lengths, Unicode, MIME types, and size limits.
- Escape or sanitize user/LLM text before HTML, SVG, subtitle, filename, shell, and renderer use.
- Invoke FFmpeg/process APIs with structured arguments; never build shell commands from user text.
- Reject unknown animation actions and unapproved asset references.
- Verify asset integrity hash and license/approval state before final rendering.

### 7.4 Child-data minimization

- Store class/age band, subject, topic, language, and learning instruction only as needed.
- Do not require child name, birthday, school, photo, voice, or location.
- Do not implement child history, profiling, targeted advertising, or child accounts.
- Keep free-text inputs out of routine logs.
- Retention, consent, deletion, and qualified legal review remain open before public use.

### 7.5 Educational correctness

Validation order:

1. Structured schema
2. Supported taxonomy and scene actions
3. Deterministic equations, counts, groups, units, and sequences
4. Age/language heuristics
5. Groq semantic review
6. Sensitive-topic policy
7. Adult review and explicit approval

The semantic reviewer cannot certify truth, and adult approval does not replace deterministic checks. A valid render must fail if displayed quantities disagree with the approved structured facts.

## 8. Performance and budget

### 8.1 Development constraints

| Constraint | Design response |
|---|---|
| Windows laptop, 8 GB RAM, Intel Iris Xe | One worker and one heavy operation at a time; no local generative video or large local LLM dependency |
| Zero-cost-first | Reusable assets, deterministic layouts, local rendering, caching, provider free tiers within current terms |
| Quality requirement | Draft previews may be lower quality only if approved/labeled; final validation targets native 1080p pending formal approval |
| Variable lesson duration | Derive duration from approved narration and comprehension holds; exact policy pending approval |
| Limited storage | Delete/reuse intermediates only under an approved lifecycle policy; record output sizes during POC |

### 8.2 Rendering profile

- POC must include at least one native 1080p final render if the pending quality requirement is approved.
- Aspect ratio and 24/30 FPS remain open; use an explicitly labeled test profile rather than implying a product decision.
- Prefer SVG/procedural assets for sharp scaling and low memory.
- Avoid holding all frames in memory; let the candidate renderer/encoder stream or batch frames according to measured behavior.
- Record peak process and system RAM, CPU utilization where available, render time, output size, and failures.

### 8.3 Cost controls

- Require adult approval before TTS and rendering.
- Cache plan, narration, asset, and render-stage outputs using content/config hashes.
- Regenerate only affected stages after a revision.
- Bound retries and prevent duplicate approval jobs.
- Track tokens, characters, requests, output duration, storage, and estimated cost.
- Do not introduce paid tiers, licensed assets, hosted workers, or mandatory subscriptions without founder approval.

## 9. Proof of concept

### 9.1 Experiment

> Teach Class 2 multiplication using a rabbit and carrots.

The POC is pending founder approval. It validates the risky pipeline, not the complete SaaS application. Authentication, dashboard polish, R2 hosting, full project library, and production deployment are unnecessary for the smallest local proof.

### 9.2 Minimum POC implementation

| Component | Minimum experiment |
|---|---|
| Structured input | Fixed Class 2 multiplication request in English and equivalent Hindi request |
| Gemini creator | Produce one schema-valid script/storyboard per language using the same lesson facts |
| Groq reviewer | Return structured alignment/age/factual findings; simulate Gemini failure and verify fallback schema behavior |
| Deterministic validator | Assert three groups × two carrots = six; validate every scene count and equation |
| Assets | One reusable layered rabbit, carrot, basket, background, and programmatic labels; recorded provenance/license |
| ElevenLabs narration | Generate English and Hindi audio plus timestamp alignment; compare candidate voices within the free internal-evaluation quota |
| Synchronization | Map key phrases to group reveal, carrot distribution, repeated addition, equation, captions, and comprehension hold |
| Remotion candidate | Render controlled motion, pose swaps, labels, captions, and transitions |
| FFmpeg proposed processing | Inspect, encode/process, normalize audio if needed, and validate output streams/file integrity |
| Output | Draft iterations plus one final 1080p test profile if approved; no user-facing download feature |
| Measurements | Schema validity, corrections, provider usage, latency, pronunciation review, peak RAM, render time, size, sync defects, and failure points |

### 9.3 Suggested scene test

1. Rabbit introduces the problem.
2. Three baskets appear.
3. Two carrots are placed in each basket, synchronized with narration.
4. `2 + 2 + 2 = 6` appears programmatically.
5. `3 × 2 = 6` appears with a short recap.

Every quantity comes from structured numeric facts. The asset generator or LLM does not decide how many objects appear.

### 9.4 POC evidence and exit gate

| Area | Required evidence |
|---|---|
| Educational correctness | Automated assertions plus adult confirmation of every count and equation |
| Plan quality | Schema-valid English/Hindi plans with narration and visual intent aligned per scene |
| Semantic review | Reviewer findings are useful; false positives and fallback behavior are recorded |
| Voice | Fluent English/Hindi reviewers assess pronunciation, pacing, numerals, equations, warmth, and glitches |
| Synchronization | Human review confirms key actions/captions align; proposed timing tolerance comes from observed output |
| Visual quality | Same rabbit style across scenes; sharp text/assets; motion supports learning rather than resembling a slideshow |
| Render feasibility | Complete render without system instability; peak RAM, time, output size, and failures recorded |
| Cost visibility | Every external request and estimated cost/usage recorded |
| Extensibility | One approved transfer topic can reuse the schema and at least some templates/assets |

The POC outcome is a go/change/stop recommendation. It does not by itself approve the full application stack or production providers.

## 10. Open technical decisions

| ID | Decision / validation | Current status | Needed before |
|---|---|---|---|
| OT-001 | Approve the rabbit-and-carrots POC, success criteria, and transfer topic | Pending founder approval | Phase 0 implementation |
| OT-002 | Approve or revise Next.js + TypeScript application structure | Proposed | Phase 1 scaffolding |
| OT-003 | Approve MongoDB Atlas + Mongoose and resolve its inconsistent PRD status | Proposed/inconsistent | Persistence implementation |
| OT-004 | Approve separate Node.js/TypeScript worker and persistence approach | Proposed | Background processing implementation |
| OT-005 | Select authentication method and session model | Open | Phase 1 authentication |
| OT-006 | Pin Gemini creator model/configuration | Approved direction; exact selection open | POC exit |
| OT-007 | Pin Groq reviewer/fallback model, thresholds, and activation policy | Approved direction; exact selection open | POC exit |
| OT-008 | Pin ElevenLabs model and English/Hindi voices; validate quota, timing, privacy, and production suitability | Internal Phase 0 evaluation direction approved; exact selection and commercial use open | POC exit/beta |
| OT-009 | Define structured plan schema version 1 and supported action vocabulary | Not defined | POC start |
| OT-010 | Define supported math/topic scope and deterministic assertions | Open | POC start |
| OT-011 | Approve Remotion evaluation and verify current commercial eligibility | Candidate | POC implementation/public use |
| OT-012 | Approve FFmpeg evaluation; document build flags, codecs, and distribution obligations | Proposed | POC implementation/distribution |
| OT-013 | Choose final aspect ratio and whether V1 supports one or both formats | Open | POC exit/UI design |
| OT-014 | Choose 24 or 30 FPS | Open | POC exit |
| OT-015 | Approve native 1080p minimum as binding | Pending founder approval | POC final validation |
| OT-016 | Approve content-driven duration and split guidance | Pending founder approval | Planning rules |
| OT-017 | Define synchronization tolerance and caption presentation rules | Requires POC evidence | POC exit |
| OT-018 | Approve adult gate as mandatory/non-bypassable | Approval inconsistency | Media-generation implementation |
| OT-019 | Define sensitive-topic moderation policy and owner | Open | Beta |
| OT-020 | Approve child-data minimization and personalization policy | Pending | UX/data implementation |
| OT-021 | Define R2 bucket, CORS, signed URL lifetime, lifecycle, limits, and pricing | Direction approved; configuration open | Invited beta |
| OT-022 | Define retention/deletion, project deletion, backups, and long-term availability | Open | Invited beta |
| OT-023 | Decide recent-project list versus full library and sharing-link scope | Open | Storage UI/API |
| OT-024 | Set retry counts, daily quotas, beta spend ceilings, concurrency, and latency targets | Requires measurements | Invited beta |
| OT-025 | Verify commercial licenses for providers, models, voices, assets, fonts, music, Remotion, FFmpeg, and codecs | Open | Public/commercial use |
| OT-026 | Approve privacy/legal position and consent/deletion behavior | Open | Public beta |

## 11. Design constraints summary

- Keep one web application and one worker process; do not introduce microservices, Kubernetes, Kafka, or mandatory Docker.
- Do not introduce Redis/BullMQ until actual concurrency or recovery evidence justifies it and approval is recorded.
- Keep external providers replaceable behind typed adapters.
- Keep media private and metadata-only in the database.
- Keep educational facts structured, deterministic, testable, and adult-reviewed.
- Keep script and storyboard coherent by generating them together.
- Preserve successful checkpoints and the last valid output.
- Prefer zero-cost tools, but never silently lower educational, visual, narration, synchronization, privacy, or security quality.
