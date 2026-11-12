# API Design — Edupilo / AI Educational Story Video Platform (V1)

> **Visual contract:** APIs and jobs reference versioned layered 3D-style assets and cinematic 2.5D scene manifests. They do not expose or require a paid generative-video provider in V1. A scene that contains only a still image plus pan/zoom cannot be marked animation-complete.

**Status:** Proposed API contract for founder/engineering review; **not an implementation approval**  
**Prepared:** 11 November 2026  
**Target:** One adult-operated educational-story web application, with a separately running media worker if that architecture is approved.

**Source hierarchy:** `docs/PRD.md` (scope) → `docs/DECISIONS.md` (per-item approval status) → `docs/SYSTEM_DESIGN.md` and `docs/TECHNICAL_DESIGN.md` (runtime boundaries) → `docs/DATABASE_DESIGN.md` (persistence contract). Root `AGENTS.md` imposes implementation and approval boundaries. This file is the canonical HTTP API contract.

> **Repository-evidence caveat:** The attached, dated `PROJECT_STATUS.md` records planning-only work; the founder has separately shown a running `web/` Next.js dev server and a Remotion POC manifest. This design does **not** assert that the routes, persistent database, authentication, provider integrations, or worker are already implemented or verified. Inspect the live repository before implementation.

## 1. Scope, approval boundaries, and terminology

The V1 workflow is: **adult drafts lesson → one combined AI script/storyboard plan → structured and semantic checks → adult reviews/revises → adult approves an exact immutable plan → a background job resolves assets, synthesizes narration, renders/validates media → authorized playback**. The adult's Parent/Teacher choice is a **preference**, not a separate role-permission tier. Children have no accounts.

| Area | Current documented status | API-design implication |
|---|---|---|
| Adult accounts, review, supported lesson context, protected playback | Working V1 functional direction; final safety/overall signoffs remain open (`INC-001`, `INC-003`, `OPS-001/002`) | Design adult ownership and a **non-bypassable approval gate**; do not represent the production policy as signed off |
| Next.js App Router + TypeScript + Tailwind, REST-like API | **Proposed** (`TECH-007/008`) | Paths below are recommended contracts, not existing implemented endpoints |
| MongoDB Atlas + Mongoose, persistent jobs, separate TypeScript worker | **Proposed** (`TECH-009/010/011`) | Atomic job creation, ownership and retry semantics depend on approved persistence capabilities |
| Gemini creator, Groq reviewer/fallback, structured facts | Approved Phase 0 directions; model IDs/configuration not pinned | APIs expose **provider-neutral plans**, not vendor payloads |
| ElevenLabs Hindi/English narration | **Approved only for internal Phase 0 evaluation** (`TECH-006`) | TTS is worker-internal and runs **only after approval**; no public provider-key endpoints |
| Remotion / FFmpeg | Candidate / proposed; licensing review open | APIs do not imply production licenses or arbitrary animated-scene creation |
| Cloudflare R2 | Approved **hosted-media direction**, lifecycle/access settings unresolved | Expose only **authorized short-lived playback access** after settings approval |
| User-facing MP4 download | **Explicitly excluded from V1** (`PROD-016`, `FR-19`) | No download endpoint, button, disposition, or persistent public media URL |
| Child-name personalization, public sharing, user-supplied assets, full library, deletion semantics | Unapproved or not in V1 scope | Do not add active CRUD/upload/share/delete endpoints without separate scope and privacy decisions |

### 1.1 Domain terms

- **Lesson / project**: the adult-owned `lessonRequests` aggregate. UI may call it a *story project*; use one resource identity, `/lessons/{lessonId}`, rather than a duplicate `/projects` API.
- **Plan**: one immutable-version script **and** storyboard together, stored as `videoPlans`; never split authoring into independent freeform script and scene-editor endpoints in V1.
- **Job**: a durable logical `generationJobs` operation (`PLAN_GENERATION`, `VIDEO_GENERATION`, or an approved `STAGE_RETRY`), not a synchronous request held until the video renders.
- **Video**: validated private final media metadata in `videos`; intermediate clips, frames and narration remain private worker artifacts.
- **Asset**: a curated, license-checked internal catalog entry; **not** permission for an end user to upload arbitrary images in V1.

## 2. HTTP conventions and common contracts

### 2.1 Base URL, implementation shape, versioning

- **Proposed base:** `/api/v1`. In Next.js App Router, a resource such as `POST /api/v1/lessons` would map to `web/app/api/v1/lessons/route.ts` (or an equivalent source-root path). Files and route modules are illustrative, **not created**.
- Use JSON over HTTPS and stable resource URLs. Use **one versioned, validated domain schema** for plans; plan `schemaVersion` is distinct from API path version.
- Standard data-changing requests use JSON with a documented `Content-Type: application/json`, validated byte-size limits, and bounded strings/arrays. Set no universal numeric limits without founder/backend approval; **server must enforce explicit configured limits** before beta.
- Adult authentication mechanism remains **unselected** (`TECH-017`). A proposed private route is not enabled until a secure adult session is established. Never accept `ownerId`, `authSubject`, worker identity or approval actor from client input.
- Avoid long-running operations in Next.js handlers. Enqueue durable work, then return `202 Accepted` and a job identifier. Use polling initially, not a WebSocket implementation.
- All client inputs are untrusted, including provider-generated scripts and future asset metadata.

### 2.2 Success and error envelopes

**Success** — keep the original system-design convention:

```json
{
  "data": {},
  "requestId": "req_opaque"
}
```

**Failure** — do not leak raw provider responses, stack traces, internal object keys, query details, prompts, or credentials:

```json
{
  "error": {
    "code": "PLAN_NOT_APPROVED",
    "message": "The selected plan version must be approved before rendering.",
    "retryable": false,
    "details": []
  },
  "requestId": "req_opaque"
}
```

- `requestId`: an opaque, server-generated value in the response, optionally echoed in `X-Request-ID`. Clients may send a correlation header only after validation; never trust it as an authorization or idempotency token.
- `data`: one resource or a collection envelope. For asynchronous starts, include a stable `jobId` and machine `state`/public `stage` where known.
- `error.code`: stable application codes; `message` is safe for users. `details` can contain safe field validation errors (e.g. `{ "field": "language", "reason": "unsupported" }`), **never** rejected child-related prose.
- `retryable` indicates whether the **request** can be retried safely; a provider-stage retry has its own separate eligibility rules.
- Unknown fields: reject at security-critical boundary schemas; normalization and safe-field rules must be consistent for hash/idempotency calculation.

### 2.3 Recommended HTTP status map

| Status | Meaning in proposed API |
|---|---|
| `200` | Successful read, update, idempotent operation replay, or playback-session grant |
| `201` | Synchronous creation of a draft lesson |
| `202` | Durable asynchronous job created or accepted; response contains job identifier |
| `204` | Successful no-body operation **only** when a corresponding approved endpoint is implemented |
| `400` | Malformed JSON, malformed path/header, or fundamentally invalid request shape |
| `401` | Unauthenticated/missing adult session; do not disclose account existence |
| `403` | Authenticated request violates a verified access/policy boundary; use `404` for unknown vs non-owned resource enumeration resistance |
| `404` | Resource absent **or not visible to the current owner** |
| `409` | Stale plan hash, incompatible state/version, conflicting idempotency-key reuse, conflicting active job |
| `413` | Body exceeds an approved and enforced maximum size |
| `415` | Unsupported content type |
| `422` | Valid syntax but unsupported learner/topic/locale/action, failed educational/schema validation, or other domain constraints |
| `429` | Application throttling or quota exceeded; supply safe `Retry-After` where applicable |
| `503` | Required provider or worker infrastructure temporarily unavailable; never imply that work was queued if it was not durably persisted |

**Proposed stable error codes:** `INVALID_INPUT`, `UNSUPPORTED_LEARNER_LEVEL`, `UNSUPPORTED_TOPIC`, `UNSUPPORTED_LANGUAGE`, `UNSUPPORTED_ACTION`, `EDUCATIONAL_VALIDATION_FAILED`, `PLAN_NOT_REVIEW_READY`, `PLAN_NOT_APPROVED`, `PLAN_HASH_MISMATCH`, `STALE_PLAN_VERSION`, `JOB_ALREADY_ACTIVE`, `JOB_NOT_CANCELLABLE`, `RETRY_NOT_ALLOWED`, `IDEMPOTENCY_CONFLICT`, `MEDIA_NOT_READY`, `PLAYBACK_NOT_AUTHORIZED`, `RATE_LIMITED`, `PROVIDER_UNAVAILABLE`, `WORKER_UNAVAILABLE`. Code naming is a **proposed contract** to be versioned/approved before implementation; do not treat it as an existing code enum.

### 2.4 Idempotency, concurrency and ownership

- For externally consuming operations, require an opaque, appropriately length-bounded `Idempotency-Key` header **or** the baseline contract's JSON `idempotencyKey` field. **Choose one canonical transport before coding**; examples below use the JSON field to align with existing `SYSTEM_DESIGN.md` §4. The server binds it to authenticated owner, operation, target resource, and normalized input fingerprint.
- A repeated key with **identical** fingerprint returns the *same logical job*, approval record, or outcome; it must **not** start a second provider request. A repeated key with a *different* fingerprint returns `409 IDEMPOTENCY_CONFLICT`.
- Deduplicate active planning/render jobs according to approved job policy. A new intentional version after revision has a distinct immutable plan ID and/or fingerprint. Keys must not contain plain child data or raw narration.
- Conditional draft updates use an explicit revision/version precondition (e.g. a body `expectedRevision` or approved `If-Match` strategy). Choosing exact revision representation is a **small implementation design decision**, not evidence that concurrency behavior exists.
- Every private fetch is scoped by `(serverAuthenticatedOwnerId, resourceId)`. Do not fetch arbitrary IDs first and authorize afterward. `ownerId` is never accepted from UI as a filter.
- All video media references remain private; short-lived signed URLs are **ephemeral response values only**, never stored in MongoDB or logs.

### 2.5 Pagination and list semantics

Proposed for `GET /lessons`, `GET /lessons/{id}/plans`, and any later approved collection endpoints:

```json
{
  "data": {
    "items": [],
    "nextCursor": null
  },
  "requestId": "req_opaque"
}
```

- Query: `limit` (bounded configured positive integer), `cursor` (opaque continuation token), and only documented allowlisted filters.
- Order: newest-first for recent lessons (`updatedAt` descending with `_id` tie-breaker); plan versions newest-first (`version` descending).
- Cursor must be validated, owner/query-bound, tamper-resistant or otherwise protected against enumeration; do not expose raw MongoDB query predicates.
- No infinite unbounded lists. A **full personal library** is still open (`PROD-013`), so `GET /lessons` begins as a **proposed simple recent-project list** rather than an approved library product.

## 3. Endpoint inventory — proposed V1 contract

Every endpoint below is a *design specification*. Availability depends on approval of the relevant product scope, authentication, persistence, worker and storage choices. No route implementation is claimed.

| Method / path | Purpose | Core protection | Priority / state |
|---|---|---|---|
| `POST /api/v1/lessons` | Create adult-owned draft lesson | Adult session; class/topic/language/instruction validation | P0 direction; persistence stack proposed |
| `GET /api/v1/lessons` | Recent owned projects | Adult session; owner filter; cursor | Proposed P2 UX; library policy pending |
| `GET /api/v1/lessons/{lessonId}` | Reopen lesson aggregate | Adult session; owner filter | Core supporting operation |
| `PATCH /api/v1/lessons/{lessonId}` | Change a mutable draft | Adult session; current revision and state | Core supporting operation |
| `POST /api/v1/lessons/{lessonId}/plans` | Start joint script/storyboard planning | Adult; input validation; quota/idempotency | P0 |
| `GET /api/v1/lessons/{lessonId}/plans` | List immutable plan versions | Adult; owner-scoped pagination | Supporting review/history |
| `GET /api/v1/plans/{planId}` | Review one script and storyboard | Adult; owner; sanitized reviewer findings | P0 |
| `POST /api/v1/plans/{planId}/revisions` | Request supported scoped revision | Adult; idempotent, version-aware | P0 |
| `POST /api/v1/plans/{planId}/approval` | Explicit adult approval **and** video-job enqueue | Adult; verified hash; atomic idempotency | P0; non-bypassable |
| `GET /api/v1/jobs/{jobId}` | Poll machine state, named stage and safe diagnostics | Adult; owner | P0 |
| `POST /api/v1/jobs/{jobId}/cancel` | Request safe job cancellation | Adult; state check; idempotent | P0 supporting operation |
| `POST /api/v1/jobs/{jobId}/retry` | Retry a validated recoverable failure | Adult; permitted checkpoint; bounded budget | P0 supporting operation |
| `GET /api/v1/videos/{videoId}` | Read validated final video metadata | Adult; owner | P0 |
| `POST /api/v1/videos/{videoId}/playback-session` | Return controlled playback permission | Adult; READY video; owner; short lifetime | P0; R2 policy pending |

**No standalone `/api/v1/render` endpoint:** starting a final video job is the **side effect of approving an exact plan**. A public direct-render call could bypass educational safeguards. **No standalone scene-generation endpoint:** the current storyboard is an immutable section of the plan, not a freeform scene-editor service.

## 4. Request/response designs by endpoint

For compactness, each successful JSON example below shows the `data` object only; the actual HTTP response wraps it in `{ "data": ..., "requestId": "..." }`. `{lessonId}`, `{planId}`, `{jobId}`, `{videoId}` are server-issued opaque identifiers; actual MongoDB IDs may remain internal. `R` means required input; `O` optional; every request is further bounded/validated by the approved schema.

### 4.1 `POST /api/v1/lessons` — create draft

**Authorization:** authenticated adult (Parent/Teacher preference does not affect access).  
**Request `R`:** `learnerLevel` (`NURSERY`, `KG`, `CLASS_1`...`CLASS_4` **illustrative taxonomy pending approval**); `subjectKey`, `topicKey` (supported allowlist), `language` (`en-IN` or `hi-IN`), `instruction` (bounded Unicode string). **Request `O`:** `preferredContext` with approved, non-personal scenario/character key only. No `ownerId`, child name, birth date, photo, school or exact location.

```json
{
  "learnerLevel": "CLASS_2",
  "subjectKey": "MATH",
  "topicKey": "MULTIPLICATION_EQUAL_GROUPS",
  "language": "en-IN",
  "instruction": "Explain multiplication using a rabbit and carrots.",
  "preferredContext": { "characterKey": "character.rabbit.ria" }
}
```

**Response:** `201` with `data: { "lessonId": "lesson_opaque", "status": "DRAFT", "revision": 1, "createdAt": "2026-11-11T12:00:00.000Z" }`; revision is an **optional proposed extension** to support safe edits.  
**Errors:** `401`, `400/413/415`, `422 UNSUPPORTED_TOPIC|UNSUPPORTED_LEARNER_LEVEL|UNSUPPORTED_LANGUAGE|INVALID_INPUT`, `429`.  
**Idempotency:** Creating a draft is a synchronous resource creation. Optional creation key may be adopted to avoid double-submit; if adopted, duplicate exact request returns same lesson, conflicting reuse `409`. This behavior is **not** specified in the source contract and requires implementation agreement.  
**Side effects:** create exactly one owner-bound `lessonRequests` draft, no AI/TTS/render calls.

### 4.2 `GET /api/v1/lessons` — recent-project list (proposed)

**Authorization:** authenticated adult; restrict to owned requests.  
**Request:** optional `cursor`, bounded `limit`, optional documented `status` filter (enumerated lesson states). **Never** `ownerId` or child-based filters.  
**Response:** `200` with `{ "items": [{ "lessonId": "lesson_opaque", "title": "Ria Rabbit and the Carrots", "learnerLevel": "CLASS_2", "language": "en-IN", "status": "REVIEW_READY", "updatedAt": "...", "latestJob": { "jobId": "job_opaque", "state": "SUCCEEDED" } }], "nextCursor": null }`; `title` may be nullable until planning returns a validated title; `latestJob` is a safe summary only.  
**Errors:** `401`, `400` invalid cursor/filter, `429`.  
**Idempotency:** safe read; none required.  
**Side effects:** none. **Status:** simple recent-list behavior remains a proposed UX decision; not a promise of comprehensive library history or indefinite retention.

### 4.3 `GET /api/v1/lessons/{lessonId}` — reopen owned project

**Authorization:** authenticated lesson owner; mismatched/unknown ID returns `404`.  
**Request:** `lessonId` path only; no body.  
**Response:** `200` with `{ "lesson": { "lessonId": "...", "learnerLevel": "CLASS_2", "subjectKey": "MATH", "topicKey": "MULTIPLICATION_EQUAL_GROUPS", "language": "en-IN", "instruction": "...", "status": "REVIEW_READY", "revision": 1 }, "currentPlan": { "planId": "plan_opaque", "version": 1, "status": "REVIEW_READY", "contentHash": "sha256:..." }, "currentJob": { "jobId": "job_opaque", "state": "SUCCEEDED", "stage": "SEMANTIC_REVIEW" }, "latestVideo": null }`. Aggregate parts may be `null` if not created.  
**Errors:** `401`, `404`, `400` invalid identifier.  
**Idempotency:** safe read.  
**Side effects:** none; do not expose another adult's assets, private media paths or provider payloads.

### 4.4 `PATCH /api/v1/lessons/{lessonId}` — update draft context

**Authorization:** lesson owner, and only when current lesson/job state permits editing.  
**Request:** a **non-empty subset** of `learnerLevel`, `subjectKey`, `topicKey`, `language`, `instruction`, `preferredContext` plus a concurrency precondition (`expectedRevision` shown below; exact scheme to approve). Reject all unrecognized write fields.

```json
{
  "expectedRevision": 1,
  "instruction": "Explain three equal groups of two carrots using a rabbit."
}
```

**Response:** `200` with `{ "lessonId": "...", "status": "DRAFT", "revision": 2, "updatedAt": "..." }`.  
**Errors:** `401`, `404`, `400/422` field/domain validation, `409 STALE_PLAN_VERSION|JOB_ALREADY_ACTIVE` if stale or active, `429`.  
**Idempotency:** conditional revision prevents lost updates; replay semantics must be defined for duplicated PATCH requests (otherwise same stale revision returns `409`). No provider usage.  
**Side effects:** change only mutable draft input; preserve existing immutable plans and approval history. A content-changing edit cannot retroactively change or invalidate the record of a previously approved plan; any new render must be based on a newly generated/reviewed/approved version.

### 4.5 `POST /api/v1/lessons/{lessonId}/plans` — start script + storyboard generation

**Authorization:** lesson owner; eligible lesson state, supported topic, approved usage budget and safe input.  
**Request:** `R idempotencyKey` (opaque string), optionally an explicit draft revision precondition if approved. No freeform arbitrary renderer code.

```json
{ "idempotencyKey": "op_create_plan_opaque" }
```

**Response:** `202` with `{ "jobId": "job_plan_opaque", "type": "PLAN_GENERATION", "state": "QUEUED", "stage": "PLANNING", "lessonId": "lesson_opaque" }`. `QUEUED` + `PLANNING` represents the intended first named stage; the worker has not necessarily started.  
**Errors:** `401`, `404`, `409 IDEMPOTENCY_CONFLICT|JOB_ALREADY_ACTIVE|STALE_PLAN_VERSION`, `422` ineligible/unsupported content, `429`, `503` if durable creation cannot be guaranteed.  
**Idempotency:** bind key to `(ownerId, lessonId, normalized input revision, operation)`; same logical operation returns the same `jobId` even after browser refresh.  
**Side effects:** persist a `PLAN_GENERATION` job and transition lesson summary to `PLANNING`; worker later invokes one Gemini creator for **joint** script/storyboard, validates schema and deterministic facts, requests Groq semantic review, and stores a new immutable `videoPlans` version at `REVIEW_READY` or records an explicit failure. **No TTS, assets generation or final rendering before adult approval.** Provider model choice and production permissions still require approval.

### 4.6 `GET /api/v1/lessons/{lessonId}/plans` — list version history

**Authorization:** owner of the lesson.  
**Request:** optional `cursor` and bounded `limit`; no body.  
**Response:** `200` with `{ "items": [{ "planId": "plan_opaque", "version": 1, "schemaVersion": "1.0", "status": "REVIEW_READY", "contentHash": "sha256:...", "createdAt": "...", "summary": { "title": "Ria Rabbit and the Carrots", "sceneCount": 5 } }], "nextCursor": null }`.  
**Errors:** `401`, `404`, `400` invalid cursor, `429`.  
**Idempotency:** safe read.  
**Side effects:** none. Exclude raw AI prompts, provider credentials and sensitive free-text logs.

### 4.7 `GET /api/v1/plans/{planId}` — review combined plan

**Authorization:** adult owner of the plan and its parent lesson.  
**Request:** path `planId`; no body.  
**Response:** `200` with `data` containing the **same plan version's** educational objective, `learnerLevel`, `language`, ordered `scenes`, narration, visual intent, typed `facts`, allowlisted `actions`, estimated duration, readable validation/findings and `contentHash`; example excerpt:

```json
{
  "planId": "plan_opaque",
  "lessonId": "lesson_opaque",
  "version": 1,
  "schemaVersion": "1.0",
  "status": "REVIEW_READY",
  "contentHash": "sha256:approved-content-digest",
  "lesson": {
    "title": "Ria Rabbit and the Carrot Groups",
    "objective": "Recognize multiplication as equal groups",
    "learnerLevel": "CLASS_2",
    "language": "en-IN"
  },
  "story": { "premise": "A rabbit arranges carrots into equal groups." },
  "scenes": [
    {
      "sceneId": "scene-01",
      "learningPurpose": "Explain three equal groups of two",
      "narration": "Ria makes three groups with two carrots in each group.",
      "visualIntent": "Reveal three baskets and exactly two carrots per basket.",
      "assets": ["character.rabbit.ria", "object.carrot", "object.basket"],
      "facts": { "groups": 3, "itemsPerGroup": 2, "total": 6, "equation": "3 × 2 = 6" },
      "actions": [ { "type": "REVEAL_GROUPS", "count": 3 }, { "type": "DISTRIBUTE_ITEMS", "itemsPerGroup": 2 } ],
      "estimatedDurationMs": 9000
    }
  ],
  "validation": { "schema": "PASSED", "deterministicMath": "PASSED", "semanticReview": "PASSED" },
  "reviewFindings": []
}
```

The `validation` response labels are **illustrative projections**; the authoritative schema and its actual result enums require approval. A plan may have multiple scenes; one-scene excerpt does not imply a one-scene lesson.  
**Errors:** `401`, `404`, `422` if an unsupported/internal plan format cannot be safely projected.  
**Idempotency:** safe read.  
**Side effects:** none; read must not auto-approve or render. An `INVALID` version must clearly present failures and disable approval.

### 4.8 `POST /api/v1/plans/{planId}/revisions` — request scoped changes

**Authorization:** owner and supported revision state; never mutate already approved source content.  
**Request:** `R instruction` (bounded revision request), `R idempotencyKey`, `O targetSceneIds` (subset of the source plan's known scenes); server resolves base plan/version and records a new version rather than editing a stored approved plan.

```json
{
  "instruction": "Explain repeated addition more slowly in the last two scenes.",
  "targetSceneIds": ["scene-04", "scene-05"],
  "idempotencyKey": "op_revise_plan_opaque"
}
```

**Response:** `202` with `{ "jobId": "job_revision_opaque", "basePlanId": "plan_opaque", "type": "PLAN_GENERATION", "state": "QUEUED", "stage": "PLANNING" }` (job type for scoped revision is a **modeling choice**, not a new enum implied by request).  
**Errors:** `401`, `404`, `400/422` empty/invalid instruction, unknown scene IDs or unsupported request, `409` superseded/stale source or idempotency conflict, `429`, `503` on failed persistence.  
**Idempotency:** one normalized revision operation and key → one job.  
**Side effects:** create a **new immutable plan version** through bounded creator/reviewer workflow. Preserve previous review-ready/approved plans and last valid video. New content requires its **own** validation and adult approval. Do not expose a professional scene timeline or arbitrary JSON/JavaScript mutation API.

### 4.9 `POST /api/v1/plans/{planId}/approval` — adult approval and video-job start

**Authorization:** authenticated owning adult only; exact plan is currently `REVIEW_READY`, passes required reviews, and has an immutable `contentHash`. The adult gate is a working requirement whose final safety checklist remains open; **do not build bypass behavior**.  
**Request:** `R contentHash` matching canonical server-stored plan content; `R idempotencyKey`.

```json
{
  "contentHash": "sha256:approved-content-digest",
  "idempotencyKey": "op_approve_and_render_opaque"
}
```

**Response:** `202` with `{ "approvedPlanId": "plan_opaque", "jobId": "job_video_opaque", "type": "VIDEO_GENERATION", "state": "QUEUED", "stage": "ASSET_RESOLUTION" }`. The exact initial stage can be a worker-projection choice; do not claim media generation has started until claimed.  
**Errors:** `401`, `404`, `409 PLAN_HASH_MISMATCH|STALE_PLAN_VERSION|IDEMPOTENCY_CONFLICT|JOB_ALREADY_ACTIVE`, `422 PLAN_NOT_REVIEW_READY|EDUCATIONAL_VALIDATION_FAILED`, `429` rate/budget, `503` when atomic persistence cannot be assured.  
**Idempotency:** exact `(ownerId, planId, immutable contentHash, render-profile revision, logical operation)` can create **at most one** video-generation job. Same key returns same job; same hash from a different request must not double-charge through accidental clicks. Whether an intentional second render of the same plan is allowed is **unapproved** and must use an explicit policy.  
**Atomic side effects:** record `approvedBy`, `approvedAt`, transition exact plan version to `APPROVED`, and durably enqueue **one** `VIDEO_GENERATION` job as one transactional operation **if supported**; otherwise approve a recoverable outbox/transaction design first. The worker must recheck approval hash, same owner/locale/facts and approved assets before TTS/render. Never synthesize audio or render from an unapproved, invalid or stale plan. No standalone bypass route.

### 4.10 `GET /api/v1/jobs/{jobId}` — poll generation status and scene evidence

**Authorization:** job owner.  
**Request:** path `jobId`; no body. **Polling** cadence is client-configured with backoff and must obey rate limits; refresh must not lose persisted job state.  
**Response:** `200` with `{ "jobId": "job_opaque", "type": "VIDEO_GENERATION", "state": "RUNNING", "stage": "NARRATION", "attempts": 1, "canCancel": true, "canRetry": false, "updatedAt": "...", "sceneStatus": [{ "sceneId": "scene-01", "state": "PENDING" }], "error": null, "result": null }`.

- `state` enum: `QUEUED`, `CLAIMED`, `RUNNING`, `WAITING_RETRY`, `SUCCEEDED`, `FAILED`, `CANCEL_REQUESTED`, `CANCELLED` (see proposed state machine). `stage` is separately one of `PLANNING`, `SEMANTIC_REVIEW`, `ASSET_RESOLUTION`, `NARRATION`, `TIMING`, `COMPOSITION`, `RENDERING`, `POST_PROCESSING`, `STORAGE`, `VALIDATION`.
- **Do not invent a percentage.** `sceneStatus` is an **optional derived projection**, only included if actual named checkpoints track meaningful per-scene work. `PENDING`, `RUNNING`, `SUCCEEDED`, `FAILED` are *candidate per-scene display values*, **not** an approved or independent scene-job state machine. If the worker only has global-stage checkpoints, return `sceneStatus: null` or omit it.
- After success, `result` may include `{ "planId": "..." }` for planning or `{ "videoId": "video_opaque" }` for a completed final render. Never include a private storage key, permanent public URL, raw provider trace or secret.
- On failure, `error` is sanitized `{ "code": "...", "stage": "...", "retryable": true, "message": "..." }`; stage/attempt metadata must not reveal private content.

**Errors:** `401`, `404`, `400` malformed ID, `429`.  
**Idempotency:** safe read.  
**Side effects:** none beyond optional server request diagnostics; must not automatically retry merely because the UI polled.

### 4.11 `POST /api/v1/jobs/{jobId}/cancel` — safe cancellation

**Authorization:** owner; eligible pending/running job.  
**Request:** empty `{}` body or no body according to one chosen content-type contract; no provider commands accepted from client.  
**Response:** `200` with `{ "jobId": "job_opaque", "state": "CANCEL_REQUESTED", "canCancel": false }` if active, or `{ "jobId": "...", "state": "CANCELLED" }` if safely cancelled while queued.  
**Errors:** `401`, `404`, `409 JOB_NOT_CANCELLABLE` for terminal states when not an idempotent replay, `429`.  
**Idempotency:** repeated cancellation requests for the **same** job do not create additional actions. Return current cancellation state.  
**Side effects:** queued jobs can transition to `CANCELLED`; executing worker observes `cancelRequestedAt` at safe checkpoints and transitions only when safe. Never delete previously approved plans or the last validated video. Provider calls already in flight may not be refundable/cancellable; surface safe usage implications.

### 4.12 `POST /api/v1/jobs/{jobId}/retry` — bounded stage retry

**Authorization:** job owner; only a `FAILED` (or explicitly approved recovery-eligible) job and stage.  
**Request:** optional stage scope **only if** the server exposes an allowlisted, validated retryable checkpoint; **`R idempotencyKey`**. Do not let clients choose arbitrary internal paths, worker actions, or an unapproved model/provider.

```json
{ "idempotencyKey": "op_retry_narration_opaque" }
```

**Response:** `202` with `{ "jobId": "new_or_reused_job_opaque", "retryOfJobId": "job_opaque", "state": "QUEUED", "stage": "NARRATION", "mayConsumeProviderQuota": true }`. Whether retries reuse the logical job or create a fresh `STAGE_RETRY` job remains an **implementation choice requiring alignment** with `generationJobs` schema; the example depicts a new job.  
**Errors:** `401`, `404`, `409 RETRY_NOT_ALLOWED|IDEMPOTENCY_CONFLICT|JOB_ALREADY_ACTIVE`, `422` nonretryable educational/safety/licensing/asset failure or unsupported checkpoint, `429` quota/budget, `503` if persistence/worker unavailable.  
**Idempotency:** same key + exact retry fingerprint reuses one retry operation; cap attempts and preserve cached successful artifacts.  
**Side effects:** enqueue only verified eligible work; retry **must not** skip adult approval or mutate its plan, quantities, language or narration. Show that additional Gemini/Groq/ElevenLabs usage **may** occur before confirmation in the UI. No automatic paid retry.

### 4.13 `GET /api/v1/videos/{videoId}` — final-video metadata

**Authorization:** video owner; video must be visible under approved retention rules.  
**Request:** path `videoId`; no body.  
**Response:** `200` with `{ "videoId": "video_opaque", "lessonId": "lesson_opaque", "planId": "plan_opaque", "generationJobId": "job_opaque", "status": "READY", "title": "Ria Rabbit and the Carrot Groups", "language": "en-IN", "durationMs": 65300, "width": 1920, "height": 1080, "fps": 30, "validation": { "mediaIntegrity": "PASSED" }, "createdAt": "..." }`. **The numeric media fields here are illustrative, not measured POC results or approved aspect/FPS decisions.**  
**Errors:** `401`, `404`, `400` invalid ID. A known owned, not-ready video may return `200 status=PROCESSING` or `FAILED` with safe details; this behavior should be specified before implementation, not represented as `READY`.  
**Idempotency:** safe read.  
**Side effects:** none. No `mediaRef`, bucket, object key, direct URL, internal file path, or download hint is returned.

### 4.14 `POST /api/v1/videos/{videoId}/playback-session` — protected playback

**Authorization:** adult video owner, current entitlement, final `READY` state, valid media checksum/stream, and approved storage/access policy.  
**Request:** path `videoId`, no meaningful payload. A server-only policy determines authorized access method and lifetime.  
**Response:** `200` with a **one-session playback grant**, **one of**:

- **Development:** `{ "mode": "app-stream", "playbackUrl": "/api/v1/media/sessions/session_opaque/stream", "expiresAt": "..." }`, requiring a separately designed authenticated route/proxy implementation; **its existence is not assumed** by this document.
- **Hosted:** `{ "mode": "signed", "playbackUrl": "https://<ephemeral-provider-url>", "expiresAt": "..." }`. The URL is a **temporary access grant**, not a permanent public object path or a downloadable resource. Configure content disposition and cache/access controls to support **playback only** within browser limitations.

The example addresses/URLs above are **schematic**, not valid links or implemented endpoints. Signed URL lifetime, range support, CORS, revocation, logging and retention are **pending founder/engineering decisions** (`TECH-018`). Browser playback controls cannot technically prevent screen recording or all forms of saving; **do not promise DRM**.  
**Errors:** `401`, `404`, `409/422 MEDIA_NOT_READY`, `403` for a distinct explicit policy deny if appropriate, `429` to resist token harvesting, `503` storage unavailable.  
**Idempotency:** no billable media job; repeated authorized requests may issue **distinct short-lived grants**, which should be rate-limited.  
**Side effects:** create or compute a short-lived authorized playback session/access token only. Do not mark video READY here, trigger rendering, publish the bucket, disclose raw object keys, or create a download route.

## 5. What Prompt 4 asks for but the approved V1 does **not** provide

The prompt pack requests endpoints for deletion, standalone storyboard editing, per-scene generation/retries, user reference uploads, generated-asset lists, character/style/motion approvals and signed **download** URLs. Treat these as **scope reconciliation**, not implicit permission to implement them.

| Requested capability | V1 decision | API disposition |
|---|---|---|
| `DELETE /lessons/{id}` and cascading media deletion | Retention/deletion, backups, consent and deletion propagation are unresolved (`TECH-018`, `OPS-002`). | **Not active.** A compliant deletion capability may be required before public release, but no semantics/path may be finalized until policy, authorization and lifecycle behavior are approved. Do not silently implement hard-delete, TTL, or soft-delete-as-complete. |
| `POST/PATCH /plans/{id}/scenes` or standalone storyboard authoring | V1 requires **joint** script + storyboard planning; revisions are scoped natural-language requests and produce immutable versions. | **Do not create** freeform scene-editor/scene-CRUD endpoints. `GET /plans/{id}` presents scene objects; `POST /plans/{id}/revisions` requests changes safely. |
| `GET /jobs/{id}/scenes/{sceneId}` and standalone scene job | Current jobs/checkpoints are **stage-oriented**, not guaranteed per-scene. | **Not required.** Optional read-only `sceneStatus` projection inside `GET /jobs/{id}` only if stored/checkpointed evidence exists. No per-scene independent jobs without approval. |
| `POST /jobs/{id}/scenes/{sceneId}/retry` | Render-checkpoint safe retry direction exists; arbitrary scene-level re-render is not approved. | **No new route.** `POST /jobs/{id}/retry` can retry an approved safe stage; scene scope only after supported checkpoints and validation exist. |
| `POST /assets/uploads`, signed upload grants or registering user reference images | Current asset library is curated and approved; user-upload consent, malware scanning, copyright, child-image handling, quotas and storage policy are **not** in approved V1 scope. | **Deferred / unapproved.** Do not expose arbitrary user uploads or imply users own catalog assets. Internal project asset seeding is a private development operation, not an adult API. |
| `GET /assets` as a generated-asset library | User-facing asset management is not an agreed V1 feature. | **Deferred.** Approved future UI might display a small allowlisted character-selection taxonomy, but not a general asset-management API. |
| `POST /character-tests/{id}/approval`, style or motion rejection/approval | POC/human quality review is internal; separate user-facing character/style/motion approvals are not part of the adult's required **plan approval** gate. | **Deferred / unapproved.** Do not confuse quality-review feedback with approval of immutable lesson facts. |
| `GET /videos/{id}/download` or signed download URLs | Explicitly excluded (`PROD-016`, `FR-19`). | **Prohibited in V1.** No direct user download endpoint, even though internal workers produce MP4 files. |
| Public sharing links, public playback, student accounts, payments and social publishing | Deferred or unapproved in PRD. | No routes. |
| Full user video library and indefinite retention | UX and lifecycle remain undecided. | `GET /lessons` is a **proposed recent list**, not a commitment to a full library or indefinite storage. |

For user privacy, the absence of a finalized deletion route is **a pre-beta policy blocker**, not permission to ignore valid data-rights requests. Qualified privacy/legal review and an approved deletion process are required before public use.

## 6. Proposed request lifecycle and background-worker boundary

```mermaid
sequenceDiagram
    actor Adult as Parent / Teacher (authenticated adult)
    participant API as Next.js API (proposed)
    participant DB as Metadata / jobs (proposed)
    participant W as Single worker (proposed)
    participant AI as Gemini + Groq adapters
    participant MEDIA as Assets + ElevenLabs + Remotion + FFmpeg
    participant STORE as Private media storage

    Adult->>API: POST /lessons (validated context)
    API->>DB: Create owned draft
    API-->>Adult: 201 lessonId
    Adult->>API: POST /lessons/{id}/plans (idempotencyKey)
    API->>DB: Persist PLAN_GENERATION job
    API-->>Adult: 202 planning jobId
    W->>DB: Atomic job claim / lease
    W->>AI: Produce joint plan + validate + semantic review
    AI-->>W: Validated proposal or explicit failure
    W->>DB: Store immutable version / checkpoint
    Adult->>API: GET /plans/{id} (review narration + scenes)
    API-->>Adult: REVIEW_READY version + contentHash
    alt Adult requests changes
        Adult->>API: POST /plans/{id}/revisions
        API->>DB: Queue new plan version
        API-->>Adult: 202 new planning job
    else Adult explicitly approves exact content
        Adult->>API: POST /plans/{id}/approval (hash, key)
        API->>DB: Atomically approve + enqueue video job
        API-->>Adult: 202 render jobId
        W->>DB: Claim approved job; recheck plan/hash
        W->>MEDIA: Resolve assets; generate Hindi/English narration; render; validate
        MEDIA-->>W: Final validated MP4 or stage error
        W->>STORE: Save private media + verify reference
        W->>DB: Write video READY + job success checkpoint
        Adult->>API: GET /jobs/{jobId} (poll)
        API-->>Adult: SUCCEEDED, videoId
        Adult->>API: POST /videos/{videoId}/playback-session
        API-->>Adult: Short-lived authorized playback grant
    end
```

**Meaning of stages:** `QUEUED/CLAIMED/RUNNING/WAITING_RETRY/SUCCEEDED/FAILED/CANCEL_REQUESTED/CANCELLED` are machine `state` values; `PLANNING/SEMANTIC_REVIEW/ASSET_RESOLUTION/NARRATION/TIMING/COMPOSITION/RENDERING/POST_PROCESSING/STORAGE/VALIDATION` are user-readable `stage` values. Stage history/checkpoints may exist, but there is **no fabricated completion percentage**.

### 6.1 Atomic approval transaction and recovery

The API must ensure the exact adult-approved immutable plan and durable video job are created as **one logically atomic action**. If the approved database supports multi-document transactions, use a verified transaction; if not, require an approved idempotent outbox/state-reconciliation strategy before enabling this endpoint. Do not return `202` unless durable state exists. Worker claims require atomic lease/heartbeat and safe stale-job recovery. A failed later stage does **not** destroy the prior plan, cached narration, or last ready video.

### 6.2 Retry/safe cancellation rules

- Retry only classified transient failures (`429`, temporary provider `5xx`, timeouts, recoverable worker/process failures) with bounded attempts and backoff; respect provider `Retry-After`.
- Do not retry licensing, educational-count mismatch, unsafe content, unapproved assets, wrong language, failed math validation or invalid plan approval by blindly rerunning providers.
- Cache by approved plan and provider/model/voice/config/locale hash; do not regenerate successful approved artifacts unless affected by a specific safe revision.
- Cancellation during provider execution/rendering is **requested** first and honored at safe checkpoints. Confirm state change only when worker observes it. Never delete validated media without approved retention rules.
- If a provider stage can incur additional quota or cost, disclose it before triggering the retry, and reject paid use without explicit founder approval.

## 7. Security, privacy, rate limits and abuse prevention

### 7.1 Adult identity and authorization

- Authentication method is an **open decision**. Do not invent password, OAuth, Clerk, Auth.js or third-party auth endpoints just because they are popular. After selecting a method, write a **separate** auth-specific contract and session/logout/recovery behaviors.
- Private routes require an authenticated **adult**; Parent/Teacher preference changes UI defaults only. No student account/roster endpoints.
- Derive owner from the verified server session; owner-scope every `lessonRequests`, `videoPlans`, `generationJobs`, `videos` lookup and cross-reference. Return `404` for absent and other-owner objects to prevent enumeration. Check owner plus plan/lesson/job relationship consistency on writes.
- If cookie sessions are selected, require `Secure`, `HttpOnly`, appropriate `SameSite`, CSRF protections for state changes and origin checks; production HTTPS is mandatory. Session and CSRF design remain dependent on the chosen provider.

### 7.2 Input and provider-output controls

- Validate learner level, topic taxonomy, languages (`en-IN`, `hi-IN`), instruction/scene text lengths, Unicode and dangerous content according to approved policy. Do not require full child names, ages with birth dates, child photographs, schools or locations.
- Validate AI output against a versioned structured schema, known scene-action allowlist and approved asset IDs. Compute counts/equations in code. Escape/sanitize text and SVG when rendering UI/video; never execute LLM-authored source code as a template.
- Maintain separate, bounded review for sensitive topics; the exact content moderation policy and policy owner remain **pending**.
- Do not accept user-provided provider name, voice/model ID, asset storage key, arbitrary URL, output destination, shell command or `ownerId` that would bypass server config/allowlists.
- Keep provider keys in server/worker secret configuration. Do not leak keys through browser, API JSON, logs, URLs, source maps or commits.

### 7.3 Proposed throttling buckets — thresholds pending

| Surface | Rate-limit purpose | What must be decided |
|---|---|---|
| Adult authentication | Stop brute-force/credential stuffing | Auth provider/method and IP/account thresholds |
| `POST /lessons`, `PATCH /lessons` | Limit request size and draft spam | Per-owner quotas and input caps |
| `POST /lessons/{id}/plans`, `POST /plans/{id}/revisions` | Control LLM usage, prompt abuse and duplicate work | Daily requests, token ceilings, retry counts and spending policy |
| `POST /plans/{id}/approval` | Prevent duplicate TTS/render work | Approval state, idempotency and per-owner active render limit |
| `POST /jobs/{id}/retry`, `/cancel` | Prevent replay storms and unsafe restarts | Attempt ceilings and allowed retry window |
| `GET /jobs/{id}`, `/lessons` | Protect polling/database capacity | Polling interval, burst limits, cached safe responses |
| `POST /videos/{id}/playback-session` | Prevent signed-link harvesting and media abuse | Grant lifetime, issuance rate, origin/CORS policy |

Never hardcode guessed quotas or prices as product guarantees; record provider usage, requests, input tokens/TTS chars, latency, retry counts and **estimated** cost server-side. Rate-limit by authenticated owner and suitable network/browser signals where privacy-safe; return `429` with appropriate retry guidance. Avoid detailed existence differences between owned and unowned resources.

### 7.4 Storage and signed-playback safety

- Development media may use local filesystem behind a guarded access layer; production hosted media direction is **private Cloudflare R2**, with lifecycle/CORS/access settings still open.
- Keep `mediaRef` (private object key/path, integrity metadata) server-side. API returns only an owner-authorized playback grant; do not persist a signed URL or create permanent public bucket access.
- Validate output media integrity, codec, duration, audio stream, requested language, resolution/aspect profile and synchronization before `READY`.
- Short-lived signed playback is access control, **not an absolute technical guarantee against downloading or recording**. Product should omit a download action and explicit attachment disposition in V1, but must not make misleading claims that files are technically impossible to save.
- Child-data minimization, asset provenance/license checks and retention/deletion policy need signoff before any public beta.

## 8. Webhooks, internal events and observability

**No public webhook endpoint is necessary for the initial local pipeline.** A single local worker can checkpoint/poll its persisted jobs. If a future approved provider requires asynchronous callbacks, separately design: authenticated or signed webhook verification, replay protection, deduplication, strict event schema, bounded payload, short response, no unsafe provider-to-plan mutation, and auditable job correlation. **Do not add a generic webhook receiver now.**

**Internal milestones (not public event-bus requirements):** `LESSON_CREATED`, `PLAN_JOB_QUEUED`, `PLAN_REVIEW_READY`, `PLAN_APPROVED`, `VIDEO_JOB_QUEUED`, `JOB_STAGE_CHANGED`, `JOB_FAILED`, `VIDEO_VALIDATED`, `VIDEO_READY`, `CANCEL_REQUESTED`. They can be recorded as durable state changes/checkpoints without Kafka, WebSockets, Redis or event-sourcing infrastructure.

**Minimum logs:** request ID, authenticated opaque owner ID, resource/job ID, operation, safe error code, state/stage, attempts, duration, provider/model/config revision, token/TTS character usage and estimated cost. Never log API keys, signed URLs, child names/photos or raw free-text story prompts by default. Metrics (render time/peak RAM/output size/availability) come from actual observed runs; do not invent benchmarks.

## 9. Example end-to-end HTTP sequence (illustrative, not implemented)

The following example models a **Class 2 English rabbit-and-carrots lesson** with exactly **3 baskets × 2 carrots = 6 carrots**. It demonstrates relationships, not approved taxonomy IDs or real server output.

| Step | Adult action / route | Expected result |
|---|---|---|
| 1 | `POST /api/v1/lessons` with class, topic, `language=en-IN`, instruction | `201`, `lessonId=lesson_1`, `status=DRAFT` |
| 2 | `POST /api/v1/lessons/lesson_1/plans` with `idempotencyKey=op_plan_1` | `202`, `jobId=job_p1`; no media generation |
| 3 | Poll `GET /api/v1/jobs/job_p1` | `QUEUED → RUNNING/PLANNING → RUNNING/SEMANTIC_REVIEW → SUCCEEDED`; `result.planId=plan_1` |
| 4 | `GET /api/v1/plans/plan_1` | `REVIEW_READY`, `contentHash`, script and scene intent, 3/2/6 math validation |
| 5a (optional) | `POST /api/v1/plans/plan_1/revisions` with scoped request and new key | `202`; later returns `plan_2`; original `plan_1` remains immutable |
| 5b | Adult reviews **current version** and `POST /api/v1/plans/plan_2/approval` with exact `contentHash` and key | `202`, one `VIDEO_GENERATION` job `job_v1`; no unreviewed video |
| 6 | Poll `GET /api/v1/jobs/job_v1` | Named `ASSET_RESOLUTION → NARRATION → TIMING → COMPOSITION → RENDERING → ... → VALIDATION`; terminal success has `videoId=video_1` |
| 7 | `GET /api/v1/videos/video_1` | `200`, `status=READY`, actual measured media metadata; **not** the private MP4 object key |
| 8 | `POST /api/v1/videos/video_1/playback-session` | `200`, temporary playback grant after authorization; **no user-facing download** |

**Failure examples:** incorrect `3 × 2` visual count → validation failure, no `READY` video; Hindi voice missing or wrong language → explicit `NARRATION`/`VALIDATION` failure, **no silent English substitution**; duplicate approval key → same job, no duplicate provider charge; stale content hash → `409`, no rendering; retry on permanent unlicensed asset → `422/409`, no blind regeneration.

## 10. Contract approval checklist before building routes

1. **Product:** Confirm adult/learner pivot, supported initial topics, full V1 scope and non-bypassable approval gate (`PROD-001/005/017`, `OPS-001/002`).
2. **Web/API:** Approve or adjust Next.js + TypeScript + REST-like routes (`TECH-007/008`), then verify existing `web/` code and avoid touching root Remotion POC unnecessarily.
3. **Auth:** Select adult authentication method and session security, then write the provider-specific auth contract (`TECH-017`).
4. **Persistence/jobs:** Approve MongoDB/worker or alternatives; verify atomic approval/job transaction strategy, leases, replay/recovery and retention boundaries (`TECH-009/010/011/018`).
5. **Planner/voice/render:** Pin evaluated model/voices and asset set; restrict ElevenLabs to internal Phase 0 until commercial/privacy rights are separately approved; verify Remotion/FFmpeg license constraints (`TECH-001/002/006/012/014/019`).
6. **Media:** Approve authorized private playback implementation, R2 access/CORS/expiry, media integrity, deletion and lifecycle; keep user download excluded (`TECH-015/018`, `PROD-016`).
7. **Costs/quality:** Decide job limits, retry caps, β spend ceiling, final output profile, and measured acceptance criteria; do not invent percentages, output-quality guarantees or free-tier capacity (`OPS-004`, `PROD-010/011/012`).
8. **Safety:** Approve child-data minimization, moderation owner/policy, consent/retention/deletion procedures and qualified legal review before public beta.
9. **Contract testing:** Once authorized, verify happy and failure paths: ownership/ID enumeration, stale hash, duplicated approval, unsupported topic, math mismatch, worker restart, missing voice, safe cancel, permitted retry, corrupt MP4, expired grant, and quota-exceeded response. These are **future implementation checks**, not claimed completed tests.

**Decision:** This document is an **API proposal**, not a change to any row in `docs/DECISIONS.md`, not evidence of implemented endpoints, and not an instruction to create unrelated project files. Existing source-of-truth documents must remain unchanged until separately approved amendments are requested.
