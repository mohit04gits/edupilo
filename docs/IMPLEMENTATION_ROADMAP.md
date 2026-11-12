# Implementation Roadmap — Edupilo / AI Educational Story Video Platform (V1)

**Status:** Proposed execution plan — founder approval and repository verification required  
**Prepared:** 11 November 2026  
**Task:** Documentation Prompt 9 — Implementation Roadmap  
**Authority:** `docs/PRD.md` (scope) → `docs/DECISIONS.md` (approval state) → `AGENTS.md` (implementation rules) → approved technical architecture → `PROJECT_STATUS.md` (verified progress).

> **Do not equate this plan with approval to build.** The supplied `PROJECT_STATUS.md` is dated 10 November 2026 and says documentation-only; subsequent discussion reports an existing Next.js `web/` app, Remotion POC, and ElevenLabs evaluation. Actual files, working behavior, tests, and integration completeness must be inspected in the current repository. Do not mark any phase complete based only on a document or conversation.

## 1. North star and scope guardrails

Build a small adult-operated product for parents/teachers to produce a correct, engaging **Hindi or English** animated story teaching a Nursery/KG–Class 4 concept: lesson input → joint script/storyboard → deterministic and semantic checks → **adult approval** → illustrated animation with timed narration → rendered video → protected playback. Parent/Teacher is a preference, not a separate permission system.

**V1 visual direction:** free-first premium cinematic 2.5D animation using reusable layered 3D-style artwork. Static pan/zoom-only output is rejected. Paid provider-generated true 3D is deferred. V1 also excludes child accounts and profiles, quizzes, games, progress tracking, classrooms/rosters, teams, payment/subscription, social publishing, voice cloning, and user-facing MP4 download. Do not invent a project-sharing feature or public-media URL. Exact subject/topic taxonomy, auth, persistence stack, output format, privacy, retention, licensing, and several final quality parameters are pending approval.

**Technical direction, subject to decisions:** `web/` Next.js App Router + TypeScript + Tailwind UI/APIs; MongoDB/Mongoose **proposed** for metadata; one separate Node/TypeScript worker **proposed**; Gemini planner and Groq reviewer/fallback approved for limited Phase 0 direction; ElevenLabs approved for **internal Phase 0 TTS evaluation only** (not public/commercial use); reusable layered licensed SVG/PNG assets; Remotion **candidate**, FFmpeg **proposed**; local media during development, private Cloudflare R2 selected as hosted direction subject to configuration approval.

## 2. Sequencing and release gates

The documentation prompt pack suggests **foundational app work before expensive provider automation**. The current PRD and POC plan prioritize a **small measured rendering proof before full app build**. Reconcile them by keeping the POC as a separate *evaluation track*, then doing foundational V1 development before automating additional paid/cloud providers:

1. **Gate A — Reconcile approvals and verify repository:** establish what actually exists; authorize only a narrow POC while the full product stack remains pending.
2. **Track 0 — Complete the educational-media POC:** one bilingual rabbit-and-carrots lesson, deterministic quantities, expressive motion, narration synchronization, render measurements, and a Go/Change/Stop decision. Use local fixtures/mocks when provider permission is absent; do not create the full product to test the renderer.
3. **Gate B — Approve the V1 product/stack:** approve or revise the parent/teacher pivot, initial topics, mandatory adult gate, Next.js/MongoDB/worker/auth approach, V1 exclusions, licensing, and privacy boundaries.
4. **Track 1 — Build the smallest production-shaped application:** domain contract → persistence → APIs → basic UI → durable jobs → storage/assets → review flow → provider adapters → approved TTS integration → animation/render → beta hardening. Implement one small slice at a time, demonstrating evidence after each.
5. **Gate C — Invited beta only after** authorization, child-data/privacy policy, retention, media security, educational safety, licensing, cost controls, realistic performance, and successful bilingual end-to-end review are satisfied.

**Dependency rule:** A downstream stage may use recorded local fixtures or mocked adapters until its real provider/architecture is approved. A mock is never represented as successful live generation.

## 3. Track 0 — Narrow Phase 0 proof (before committing to full MVP)

### P0.1 — Reconcile approval and baseline
- **Objective/deliverable:** inspect actual repository and existing `web/`, Remotion, media files, scripts, tests, configuration, and provider adapters; record what runs and what is only planned. Capture Windows/Node versions, RAM, disk, and current usage/licensing notes.
- **Likely files:** existing root/web `package.json`, `PROJECT_STATUS.md`, `docs/DECISIONS.md`, `docs/POC_EXECUTION_PLAN.md` (status updates only with actual evidence/approval).
- **Prerequisite:** repository access; explicit authorization before any new paid service, credential submission, or architecture change.
- **Verification:** run only existing local commands; report exact successes/failures; no invented benchmarks.
- **Risk/deferred:** stale documents and unexpected uncommitted work; defer the full website/auth/database.

### P0.2 — Validate the controlled rabbit-and-carrots proof
- **Objective/deliverable:** one fixed Class 2 example: **3 baskets × 2 carrots = 6**, `2+2+2=6`, `3×2=6`; versioned lesson/storyboard fixture; validated visual action vocabulary; reusable rabbit, basket, carrot assets; real object/character animation (not merely a pan/zoom slideshow).
- **Likely files:** existing `src/remotion/**`, `src/**/schemas/**`, `scripts/**`, `tests/**`, `assets/**` or actual equivalents found in repository.
- **Prerequisite:** narrow POC approval, licensed asset sources, and permission to evaluate Remotion/FFmpeg. Do not rename/restructure working files without reason.
- **Verification:** malformed/incorrect facts rejected; human review verifies object counts at every completed stage and continuity of rabbit poses; record exact unsupported actions.
- **Risk/deferred:** attractive but pedagogically weak animation; defer generative video, dozens of topics, and user-facing editors.

### P0.3 — Narration, sync, rendering, and decision evidence
- **Objective/deliverable:** evaluated Hindi/English narration with timestamps; visual reveals and captions synchronized to speech; one complete validated local MP4 at an **explicitly approved test profile**; cost/quota/latency/RAM/render-size report; Go/Change/Stop recommendation.
- **Likely files:** existing TTS adapter, timing normalizer, Remotion compositions, media-verification scripts, POC evidence notes.
- **Prerequisite:** approved internal ElevenLabs evaluation and voice/model selection; no paid usage; explicit profile/quality test choice. If not approved, retain deterministic timing/audio fixture and label it a mock.
- **Verification:** listen to both languages; check spoken numbers, pauses, subtitles, visual timing, decode integrity, expected streams, resolution, frame rate, and resource measurements. Validate one native 1080p sample **if approved**.
- **Risk/deferred:** timestamp quality, free-tier limitations, 8 GB RAM, commercial-use restrictions; defer deployment and production TTS selection.

**POC exit:** no automatic MVP approval. A render alone is insufficient; the approved learning example, narration, engaging motion, synchronization, quality, costs, and recovery behavior need evidence. Select/approve one substantially different *transfer topic* before claiming the renderer generalizes.

## 4. Track 1 — V1 implementation phases (after Gate B)

Each phase is a small Codex assignment with one acceptance demo. File paths below are **suggested**, not claims that the repository already contains them. Check architecture and existing code before choosing exact locations.

### Phase 1 — Domain types and validation schemas
- **Objective:** implement a versioned, provider-neutral contract for lesson request, lesson facts, joint script/storyboard, scenes, allowed actions/assets, timing cues, approval and job status.
- **Deliverables:** typed schemas; deterministic math rules; data fixtures in both `en-IN` and `hi-IN`; explicit unknown-action/locale rejection; immutable version/hash conventions.
- **Files:** `web/src/lib/domain/**` or a minimal shared package; schema/fixture files; focused checks.
- **Prerequisites:** supported learner/subject/topic taxonomy and relevant PRD approvals; use fixed POC values until topic selection is approved.
- **Tests/acceptance:** reject malformed scenes, invalid equations, mismatched object counts, unsupported language, duplicate IDs, and unsafe size bounds; accepted fixture round-trips unchanged.
- **Risks:** premature complex scene DSL. **Deferred:** arbitrary user-written renderer code, unrestricted topics, child profiles.

### Phase 2 — Database, repositories, and schema evolution
- **Objective:** persist adult-owned metadata without storing media binaries.
- **Deliverables:** approved database connection pattern; baseline collections `users`, `lessonRequests`, `videoPlans`, `generationJobs`, `assets`, `videos`; owner-scoped repositories, unique indexes, schema validation, development seed and non-destructive schema-evolution procedure.
- **Files:** `web/src/lib/db/**`, `web/src/lib/repositories/**`, `scripts/db/**`, `.env.example` (names only).
- **Prerequisites:** approval of database/provider, adult identity model, lifecycle/privacy position; verify transaction support in selected environment.
- **Tests/acceptance:** separate-user isolation; unique `(lessonRequestId, version)` and job idempotency key; correct aggregate reload; plan snapshot immutability; no MP4/audio binaries in database.
- **Risks:** migrations, free-tier capacity, transactional assumptions. **Deferred:** new workspace, provider ledger or character-profile collection without measured need.

### Phase 3 — Story-project and plan APIs
- **Objective:** let an authenticated adult create/reopen a lesson and view a versioned plan; APIs return promptly without long provider calls.
- **Deliverables:** `/api/v1/lessons`, `/api/v1/lessons/{id}`, plan creation/listing/detail and explicit revision contract; validation and owner authorization; stable error envelope and request IDs.
- **Files:** `web/src/app/api/v1/**`, service and repository modules, validation contracts.
- **Prerequisites:** approved auth mechanism and Phases 1–2; for isolated local contract proof, mocked principal is **development-only**.
- **Tests/acceptance:** 201/202/400/401/404/409/422/429 behavior as applicable; inaccessible owner IDs do not leak; idempotent mutations; API never exposes credentials or raw storage keys.
- **Risks:** accidentally launching paid planning on API request. **Deferred:** deletion until policy approved, generic uploads, sharing/download endpoints.

### Phase 4 — Minimal project creation, review, and status UI
- **Objective:** make the real parent/teacher journey understandable with no professional editing timeline.
- **Deliverables:** approved adult auth/onboarding choice, class/subject/topic/language/instruction form, combined narration-and-scene review with **Approve**/**Request revision**, named job-status view, protected video player shell; reuse approved Stitch/Next.js visual language if already implemented.
- **Files:** `web/src/app/**`, `web/src/components/**`, `web/src/lib/client/**` as needed.
- **Prerequisites:** approved navigation/role defaults, authentication, input taxonomy, and adult-gate behavior; Phase 3 contracts (mocked data allowed until real services ready).
- **Tests/acceptance:** user can draft/review/approve a valid fixture; no render is triggered before approval; form survives recoverable failures; mobile/tablet controls and Hindi typography work.
- **Risks:** polished UI hiding fake functionality. **Deferred:** full analytics dashboard, lesson library beyond approved recent-list scope, advanced editor, user download.

### Phase 5 — Durable job state machine and worker boundary
- **Objective:** support long-running work without blocking Next.js requests or losing state on refresh.
- **Deliverables:** persisted states `QUEUED/CLAIMED/RUNNING/WAITING_RETRY/SUCCEEDED/FAILED/CANCEL_REQUESTED/CANCELLED`, named stages, atomic claim/lease, heartbeat, bounded retries, checkpointing, cancellation, one-worker dev process, status/cancel/retry APIs.
- **Files:** `worker/**` (or approved existing worker), `web/src/lib/jobs/**`, API job routes, database repository code.
- **Prerequisites:** approved worker/queue approach, database transactions, idempotent approval→job creation; no Redis/BullMQ by default.
- **Tests/acceptance:** one approval generates one job under repeated clicks; restart resumes safely; stale lease is recoverable; no duplicate provider requests; previous good media remains intact after failure.
- **Risks:** double billing and partial outputs. **Deferred:** horizontal scaling, queue service, WebSocket infrastructure.

### Phase 6 — Media storage abstraction and approved asset registration
- **Objective:** safely resolve curated illustration/audio/video files without embedding binaries in MongoDB or exposing public links.
- **Deliverables:** local filesystem adapter, content-hash/checksum and MIME/size validation, private paths and asset provenance/license fields; R2 adapter only when configuration, access and lifecycle are approved.
- **Files:** `web/src/lib/storage/**`, `worker/src/storage/**`, `assets/**`, related metadata models.
- **Prerequisites:** storage-choice and asset-license decisions; retention and deletion rules before implementing cleanup automation.
- **Tests/acceptance:** reject traversal, malformed MIME, oversize/invalid content; owner-scoped reads; no permanent public media URL; media metadata reconciles with stored files.
- **Risks:** inconsistent asset states and unapproved uploads. **Deferred:** user-upload workflow unless expressly approved, public buckets, signed download URL feature.

### Phase 7 — Character/style and adult review safeguards
- **Objective:** preserve one reproducible cartoon art direction and prevent unreviewed assets/plans from entering final media.
- **Deliverables:** versioned approved character/pose manifest; linked layers/expressions/actions; validation that all scene assets are licensed and available; adult script/storyboard approval record with exact content hash. **Optional character/style preview approval** is proposed, not an autonomous V1 editor.
- **Files:** `assets/manifest.*`, `web/src/lib/domain/approval/**`, `worker/src/assets/**`, review UI components.
- **Prerequisites:** POC visual evidence and adult-approval gate confirmation; approved character set and asset rights.
- **Tests/acceptance:** changing plan content invalidates prior approval; missing/rejected asset blocks render; stable rabbit design across poses; only approved plan version passes media gate.
- **Risks:** flat assets cannot support required actions. **Deferred:** user-generated avatar rigs, complex skeletal animation, multi-character marketplace.

### Phase 8 — Provider-neutral interfaces and mocked integrations
- **Objective:** exercise the complete orchestration without exhausting free tiers or using unapproved production providers.
- **Deliverables:** typed `Creator`, `Reviewer`, `TTS`, `Renderer`, and `Storage` adapters; mock/recorded fixtures; versioned config; error normalization; usage tracking; Gemini creator and Groq reviewer/fallback wired only within their approved evaluation scope.
- **Files:** `worker/src/providers/**`, `web/src/lib/contracts/**`, test fixtures.
- **Prerequisites:** contract, approval gate, job/worker/storage boundaries; model/config, rate-limit and privacy checks before real calls.
- **Tests/acceptance:** injected timeouts/429s/invalid plans fail or retry safely; creator outputs script **and** storyboard together; deterministic checks and human gate always run; fallback stays within approved model list.
- **Risks:** mocks masking integration defects. **Deferred:** unrestricted image/video model calls, paid APIs, unlimited retries.

### Phase 9 — ElevenLabs Hindi/English narration hardening
- **Objective:** produce validated expressive narration and authoritative word/phrase timing for approved content.
- **Deliverables:** cached approved-text TTS, explicit locale/voice/model selection, text normalization (especially numbers and equations), normalized timestamps, duration checks, pronunciation review and usage/quota ledger.
- **Files:** `worker/src/providers/tts/**`, `worker/src/timing/**`, local narration cache/fixtures.
- **Prerequisites:** ElevenLabs **internal Phase 0** approval permits evaluation only; a separate approval is required for actual V1/beta/commercial usage. Never enable billing without approval.
- **Tests/acceptance:** English and Hindi listening samples, clock-aligned captions and counting cues, graceful failure for unsupported voice/empty audio, no silent language substitution, no unbounded retries.
- **Risks:** Hindi articulation, noisy alignment, quota and no free-plan commercial license. **Deferred:** voice cloning and unsupported commercial usage.

### Phase 10 — Optional genuine motion-provider investigation (decision gate only)
- **Objective:** decide whether the POC's layered/procedural cartoon animation is sufficiently expressive or requires a dedicated motion-generation provider.
- **Deliverables:** side-by-side human visual rubric; reproducibility, character consistency, educational count accuracy, licensing, privacy, quotas, cost and failure behavior; recommendation **use current controlled animation / limited optional provider pilot / defer**.
- **Files:** short evaluation notes and opt-in adapter only **after** explicit provider, data and budget approval.
- **Prerequisites:** functional controlled-motion POC and approved comparison criteria; no default external video generation integration.
- **Tests/acceptance:** character performs an identifiable action, not merely Ken Burns camera movement; examples teach correct quantities; no silent change to narration or facts.
- **Risks:** expensive inconsistent scenes and non-deterministic object counts. **Deferred:** mandatory text-to-video, cinematic/3D scenes, permanent provider integration without approval.

### Phase 11 — Remotion composition and media validation
- **Objective:** connect approved plan + approved assets + verified timing into a complete, correct animated story video.
- **Deliverables:** one end-to-end worker→Remotion scene manifest adapter; reused test-proven compositions; programmatic quantities/equations, actions, caption safe areas, audio placement; FFmpeg/ffprobe integrity inspection, private finalized artifact, authorized playback.
- **Files:** existing `src/remotion/**` or approved render package, `worker/src/render/**`, scripts for media validation, playback API.
- **Prerequisites:** successful POC, renderer/codec licensing checks, authorized TTS, approved output profile; one heavy render at a time on 8 GB development hardware.
- **Tests/acceptance:** complete rabbit lesson in each approved language; exactly 3 baskets with 2 carrots each; visual/audio sync and actual character/object movement; final media passes codec/resolution/duration checks. Native 1080p is binding only when approved; previews must be labeled.
- **Risks:** time/RAM, drift, clipping, licensing. **Deferred:** high-concurrency farm, generalized multi-scene cinematic engine and V1 download button.

### Phase 12 — Invited-beta safety, reliability and operations gate
- **Objective:** demonstrate a narrow, responsible adult-facing beta, not a public commercial launch by default.
- **Deliverables:** security review, adult auth and project isolation, child-data-minimization notice/consent, reviewed moderation policy, approved retention/deletion and private R2 playback configuration, cost/rate limits, usage alerts, recovery/runbook, dependency/license register, verified deployment topology.
- **Files:** existing security/config modules, deployment settings, `docs/DECISIONS.md` updates only with explicit approvals, `PROJECT_STATUS.md` factual results.
- **Prerequisites:** Gate C legal/privacy/security/license and budget signoffs; no open critical educational correctness issues; functioning hosted worker separate from web requests.
- **Tests/acceptance:** end-to-end Hindi/English flows; cross-owner denial; rate limit/abuse and prompt-injection tests; provider outages, worker restarts, stale leases, signed-URL expiry, unauthorized playback and deletion behavior; invited-adult usability review; measured quotas and latency.
- **Risks:** privacy, bills, public exposure, uptime. **Deferred:** broad public scaling, monetization, student accounts and comprehensive learning tools.

## 5. Review checklist after every Codex assignment

Record, tersely:

1. **What changed:** exact files, behavior, and why; no unrelated refactors.
2. **Evidence:** commands actually run and their outputs; checks skipped/failed clearly named.
3. **Education/quality:** visual correctness, audio sync, asset consistency and age appropriateness where relevant.
4. **Risk/cost:** provider usage, failed/retried calls, licenses, exposed secrets and unresolved assumptions.
5. **Status:** implemented / verified / blocked / proposed; update `PROJECT_STATUS.md` only with evidence.
6. **Approval:** if a proposed technology, paid service, child-data policy, scope expansion, or retention rule is implicated, **stop and seek founder approval before implementation**.

## 6. Dependencies and priorities at a glance

| Order | Work | Can use fixtures? | Approval gate |
|---|---|---|---|
| 0 | Verify repo and current decision state | N/A | Required before changing code |
| 1 | Narrow POC and Go/Change/Stop | Yes | Phase 0 + provider/tool evaluation |
| 2 | Domain types and deterministic validation | Yes | Topic scope and V1 contract |
| 3 | Database and adult-owned repositories | Yes | MongoDB/auth/retention decisions |
| 4 | Story/plan APIs | Yes | Auth/API architecture |
| 5 | Simple create/review/status UI | Yes | Adult flow and design |
| 6 | Durable worker and job orchestration | Yes | Worker/queue/persistence |
| 7 | Private storage + approved assets | Yes | R2 policy / asset licenses |
| 8 | Character and approval safeguards | Yes | Adult gate / character scope |
| 9 | Provider adapters and controlled integrations | Yes | Exact model, privacy and quotas |
| 10 | Narration hardening and motion decision | Yes | ElevenLabs commercial use / optional provider |
| 11 | Integrated Remotion final render | No for final proof | Renderer/codec/output approvals |
| 12 | Invited-beta release gate | No | Safety/privacy/security/cost/licensing |

## 7. Exactly one recommended next implementation task

**Task:** Perform a **read-only current-repository + POC evidence audit**, not another architecture rewrite or a new feature.

**Codex instruction:**

> Inspect `AGENTS.md`, `PROJECT_STATUS.md`, `docs/PRD.md`, `docs/DECISIONS.md`, the existing Next.js `web/` package, Remotion compositions/scripts, ElevenLabs/Gemini/Groq adapters if present, and any generated rabbit-and-carrots MP4. Report which Phase 0 steps are actually implemented and verified, which are mocks, the exact commands that currently work, missing files/credentials (names only), measured-versus-unmeasured results, and the **single smallest remaining POC task**. Do **not** modify code, install packages, call paid providers, or change decision statuses. Finish with a proposed focused implementation prompt and wait for approval.

**Why first:** Reported application and POC work postdates the uploaded status snapshot. Writing more code without reconciling actual state risks duplicate features, broken scripts, undocumented paid calls, and false completion claims. After this audit, the next coding task should fix the *first verified POC gap*, not automatically scaffold a database or add external video generation.

---

**Change control:** This roadmap is a proposal. Do not mark PRD approval boxes or rewrite `DECISIONS.md` merely because these phases are listed. Keep the product small, the videos genuinely animated and educationally accurate, and paid/public integrations behind explicit approval.
