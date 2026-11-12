# Project Status

## AI Educational Story Video Platform

**Last updated:** 12 November 2026  
**Evidence basis:** Repository inspection plus `docs/PRD.md`, `docs/DECISIONS.md`, and `AGENTS.md`  
**Overall status:** Phase 0 POC plus authenticated application foundation in progress

## 1. Current project phase

The project has completed **Phase 0, Stage 1 of the technical proof of concept**. The offline rabbit-and-carrots pipeline rendered and validated successfully, but the founder rejected the presentation-like visual quality as unsuitable for the intended final product.

The repository now contains a minimal offline POC source skeleton, deterministic lesson fixture and tests, original layered SVG assets, Remotion composition, and render/verification scripts. Pinned npm dependencies were installed. The authorized FFmpeg Windows package download stalled and did not install; work stopped as required. No MP4 has been rendered or verified. No provider integration, application, database, beta environment, or deployment exists.

The project must not be described as full application development, beta, or deployment. Stage 2 remains unauthorized.

### Isolated homepage implementation

On 11 November 2026, the founder authorized Next.js App Router, TypeScript, and Tailwind CSS for an isolated homepage implementation only. This approval does not approve the full production application architecture or any authentication, dashboard, API, database, worker, provider, or deployment work.

The responsive Edupilo homepage is implemented under `web/` from the Google Stitch reference stored in `design-reference/homepage/`. It preserves the reference section structure, cream/navy/orange/green palette, adult-review narrative, rabbit-and-carrots lesson imagery, and English/Hindi presentation. Fredoka is used for display typography, Mukta for body text and controls, and Tiro Devanagari Hindi for the Hindi specimen.

Verified evidence:

- `web`: `npm run typecheck` passed.
- `web`: `npm run build` passed; `/` is statically prerendered.
- Browser QA passed at mobile, tablet, and desktop widths with no document-level horizontal overflow or console errors.
- Existing POC regression checks remained healthy: TypeScript passed, 4/4 tests passed, and storyboard validation passed.
- No authentication, signup, dashboard, backend API, database, AI/TTS provider integration, or Remotion pipeline change was introduced.

## 2. Completed work

### Completed and verifiable documentation work

| Item | Evidence | Status |
|---|---|---|
| Product requirements draft | `docs/PRD.md` exists and documents the working V1 requirements, pipeline, risks, POC, milestones, and open decisions. | Completed as a draft; not finally approved |
| Decision register | `docs/DECISIONS.md` exists and separates approved, proposed, pending, deferred, and superseded decisions. | Completed |
| Codex operating instructions | Root `AGENTS.md` exists and defines scope, approval, development, AI-pipeline, budget, safety, privacy, and workflow guardrails. | Completed |
| Repository initialization | A `.git` directory and `main` branch exist. | Completed initialization only; no commits exist |

### Implemented product features

The public homepage, adult authentication, authenticated dashboard, and owner-scoped lesson-draft creation flow are implemented. AI generation, the background worker, hosted media storage, and the production provider pipeline remain outside this milestone.

| Item | Evidence | Status |
|---|---|---|
| Homepage | `web/app/`, `web/components/` | Implemented and previously verified; unchanged by the domain-foundation batch |
| Domain records and contracts | `web/lib/domain/types.ts`, `provider-contracts.ts`, `persistence.ts` | Implemented for adult metadata, projects, versioned storyboards/scenes, assets, narration timing, jobs, renders, provider usage, educational facts, locales, and cinematic 2.5D actions/layers |
| Runtime validation and safe transitions | `web/lib/domain/validation.ts`, `transitions.ts` | Implemented and verified for supported locales/actions, deterministic equal-group facts, scene bounds/order, approval ownership/hash, and job state transitions |
| Persistence-neutral repositories | `web/lib/domain/repositories.ts` | Interfaces implemented; no database adapter or connection exists |
| Open-ended idea creation (`/stories/new`) | `web/components/lessons/idea-studio.tsx`, `web/lib/lessons/idea.ts`, `validation.ts` | Implemented and verified 12 Nov 2026: natural-language idea input with learner level, language, example prompts, inspiration cards and optional allowlisted creative preferences. Drafts can now proceed to the separately gated AI plan-review workflow. Subject/topic are inferred deterministically from the approved catalog or stored as `OPEN`/`OPEN_IDEA`. |
| AI plan review workflow | `web/lib/plans/`, plan API routes, `web/app/stories/[projectId]/page.tsx` | Implemented with owner scoping, Cloudflare Workers AI creation, Groq semantic review, deterministic mathematics and age-quality checks, immutable versioned plans, bounded retry/idempotency, provider usage records, adult revision and idempotent exact-version approval. No narration or render job is started. |

### Partial Stage 1 POC implementation

| Item | Evidence | Status |
|---|---|---|
| Fixed bilingual storyboard and synthetic timings | `src/domain/storyboard.json` | Implemented but not executed |
| Structured and deterministic validation | `src/domain/storyboard.ts`, `tests/storyboard.test.ts` | Completed for Stage 1: type-check passed, 4/4 tests passed, storyboard validation passed |
| Original layered assets | `public/assets/rabbit.svg`, `carrot.svg`, `basket.svg`, `ASSET_LICENSES.md` | Implemented; visual render not yet inspected |
| Remotion composition | `src/remotion/` | Type-checked successfully; Studio preview exists, but no MP4 render or full visual QA |
| Measurement and media validation scripts | `scripts/render-with-metrics.ps1`, `scripts/verify-media.ps1` | Implemented but not executed |
| Local dependencies | `package.json`, `package-lock.json`, `node_modules/` | Pinned packages installed at ₹0 |

### Verified repository observations

- A Next.js homepage exists under `web/`; no dashboard, authenticated application flow, or API routes exist.
- Root and `web/` package, lockfile, and TypeScript configuration files exist.
- No database schema, migration, model, or connection code exists.
- No authentication implementation exists.
- No AI, TTS, storage, animation, or renderer integration exists.
- No illustration or character asset library exists.
- Automated deterministic POC and domain-foundation tests exist under `tests/`.
- No generated sample video, narration, storyboard artifact, or benchmark result exists.
- No environment configuration, CI workflow, hosting configuration, or deployment exists.
- Git has no commits; the existing repository files are currently untracked.

## 3. Current work

The current focus is defining and approving a stronger child-friendly animation style before any Stage 2 voice/API work.

Current planning work should concentrate on:

- Confirming the child-focused product pivot and V1/deferred scope
- Approving the first POC lesson, transfer topic, and success criteria
- Approving evaluation of the proposed renderer/media toolchain
- Defining the structured lesson and storyboard contract
- Preparing a measurable POC plan for bilingual planning, narration, synchronization, deterministic quantities, and final rendering

Stage 1 is closed as technically feasible but visually unacceptable. Stage 2 provider work is not authorized and has not started.

## 4. Pending decisions

The following summarizes unresolved items from `docs/DECISIONS.md`. The decision register remains authoritative for exact rationale and references.

### Product approvals

- Formal approval of the Parent/Teacher and Nursery–Class 4 product pivot
- Approval of the complete V1 scope and deferred V2 list
- Initial supported subjects and topics
- Rabbit-and-carrots multiplication POC, success criteria, and one transfer topic
- Content-driven duration and lesson-splitting rule
- Native 1080p minimum quality bar
- Final aspect ratio: 16:9, 9:16, or both
- Final frame rate: 24 or 30 FPS
- Simple recent-project list versus a fuller personal library
- Child-name or other personalization policy
- Sharing links, reusable-character count, and logo/classroom branding

### Architecture and provider approvals

- Approval or revision of the proposed Next.js/TypeScript application stack
- Approval of MongoDB Atlas/Mongoose rather than only the metadata-storage principle
- Approval of the separate Node.js/TypeScript worker architecture
- Authentication method
- Job persistence approach: database-backed simple worker versus a later queue
- Remotion evaluation and commercial-license eligibility
- FFmpeg evaluation, build configuration, codec obligations, and compliance owner
- Exact Gemini creator model and configuration
- Exact Groq reviewer/fallback model and configuration
- Exact ElevenLabs model and English/Hindi voices, quota behavior, privacy, timing, and production/commercial suitability

### Operations, safety, and privacy

- Mandatory adult-review gate confirmation
- Child-data-minimization approval
- Sensitive-topic policy and accountable owner
- R2 signed-access, CORS, retention, deletion, limits, pricing, and backup configuration
- Intermediate and final-media retention lifecycle
- Beta spend ceilings, concurrency limits, and acceptable generation latency
- Commercial licensing review for models, voices, assets, fonts, music, Remotion, FFmpeg, and codecs
- Privacy/legal review before public use
- Final product name

## 5. Blockers and risks

### Current blockers

| Blocker | Effect | Resolution needed |
|---|---|---|
| Product pivot is not formally approved | Implementation beyond an authorized technical proof could target an unapproved audience and scope. | Founder approval of the Parent/Teacher, Nursery–Class 4 direction |
| First POC and success criteria are unapproved | The team cannot objectively start or accept the technical proof. | Approve the multiplication lesson, transfer topic, and measurable exit criteria |
| Renderer and FFmpeg evaluation are not approved/compliance-assigned | The proposed POC assumes tools whose implementation and distribution status remain unresolved. | Approve limited POC evaluation and assign licensing/compliance review |
| Core application architecture is proposed, not approved | Full application scaffolding would prematurely commit to Next.js, MongoDB, and worker choices. | Approve or revise the Phase 1 architecture before application development |
| Adult-gate and child-data checklist items remain open | Safety-critical implementation behavior is not formally confirmed. | Explicit founder approval and policy ownership |
| Open-ended input conflicts with the recorded catalog decision | `docs/DECISIONS.md` PROD-005 still records the constrained V1 catalog as the approved input model, while the founder has now directed open-ended idea input. | Founder to update PROD-005 (decision status was not changed by engineering) |
| Input safety policy for open-ended ideas is undefined | Any topic can now be saved as a draft; length, allowlisted options and owner scoping are enforced, but no harmful/unsafe-topic screening exists. | Approve the safety policy. AI planning is now wired to open-ended drafts but has not run live (provider settings missing); do not enable live planning for real users until this is approved. |
| Visual style is not accepted | The rendered result feels like an animated presentation rather than an expressive children’s story. | Approve a short visual-style prototype before adding narration or building the full application |

### Unvalidated assumptions and material risks

- Gemini can produce consistently schema-valid, age-appropriate bilingual scripts and synchronized storyboards within current quotas.
- A Groq-hosted model can review output accurately without excessive false positives and can serve as a reliable fallback.
- ElevenLabs voices can meet Hindi/English pronunciation, warmth, timing, and child-friendly storytelling requirements within the internal evaluation quota.
- Word or phrase timing will be accurate enough to synchronize captions, labels, object reveals, and transitions.
- Reusable SVG/PNG assets plus programmatic motion will feel like a professional animated story rather than a slideshow.
- Remotion can render the required output reliably on the 8 GB Windows laptop and is commercially eligible for the intended entity/use.
- FFmpeg build and codec choices can meet quality and distribution requirements.
- A native 1080p render can complete without system instability; render time and peak memory are unknown.
- The first asset set can maintain consistent characters and sufficient expressive poses without costly generative media.
- Cloudflare R2 access, retention, egress/request behavior, and current pricing will suit invited beta use.
- Free tiers will remain available and adequate for POC work; none should be assumed unlimited.
- Educational and mathematical validation rules are not yet defined beyond high-level requirements.
- No actual cost, latency, memory, synchronization-tolerance, output-size, or failure-rate measurements exist.

## 6. Next priorities

### Priority 1 — Approve the narrow Phase 0 technical proof

Approve the rabbit-and-carrots multiplication lesson, one transfer topic, POC success criteria, and limited evaluation of Gemini, Groq, ElevenLabs, Remotion, and FFmpeg. ElevenLabs is authorized only for free internal Phase 0 evaluation and must not be treated as production/commercial approval.

### Priority 2 — Define the structured lesson/storyboard contract

Document a versioned schema covering learner level, language, learning objective, narration, visual intent, deterministic quantities/equations, assets, supported animation actions, captions, estimated timing, and safety/review flags. Define validation failures and bounded correction behavior.

### Priority 3 — Prepare controlled POC assets and deterministic math rules

Create an approved minimal rabbit/carrot character and object set, supported poses/actions, asset provenance fields, and programmatic rules/assertions for groups, counts, repeated addition, and multiplication equations.

### Priority 4 — Run bilingual planning and narration evaluations

Benchmark the candidate Gemini creator, Groq reviewer/fallback, and ElevenLabs English/Hindi voices using the same scripts and acceptance rubric. Record schema validity, correctness, pronunciation, timestamp alignment, latency, quota usage, retry behavior, and estimated cost.

### Priority 5 — Render and evaluate the synchronized POC

After the prerequisite approvals, produce draft iterations and one final-quality 1080p render. Measure peak RAM, render time, output size, synchronization, visual clarity, audio quality, provider usage, and failure recovery. Use results to approve, revise, or reject the proposed production architecture.

## 7. Technical status

| Area | Status | Evidence / current condition | Required next step |
|---|---|---|---|
| Frontend | In Progress | Homepage and dashboard are preserved. `/stories/[projectId]` now provides a parent-facing concept preview with deterministic topic-themed artwork, plan review/actions, and owner-scoped idea deletion. | Review the current concept-preview quality before any narration/rendering UI. |
| Backend | In Progress | Domain contracts remain provider-neutral. Authenticated, same-origin `/api/lesson-projects` create/list and owner-scoped retrieval routes are implemented; no AI-generation or worker API was added. | Implement AI script/storyboard generation only after explicit approval. |
| Database | In Progress | Atlas connectivity and all six metadata collections are verified. The minimum lesson-request repository now creates and retrieves owner-scoped drafts; E2E persistence and cross-user isolation passed. No media binary is stored in MongoDB. | Extend repositories only alongside an approved generation milestone. |
| Authentication | In Progress | Founder-approved bcrypt + JWT authentication remains intact. Login/signup now land on `/dashboard`; `/account` redirects there; protected dashboard and story-creation routes use the server-side session. Real HTTP verification passed. | Before public beta validate HTTPS/proxy configuration and distributed rate-limiting needs. |
| AI script generation | In Progress | The saved-idea flow invokes Cloudflare Workers AI through an idempotent owner-scoped job. Age-specific prompt rules request 4–7 scenes, 45–90 seconds, hook/explore/show/recap structure, concrete examples, and bounded sentence/vocabulary complexity. One correction call is allowed after deterministic quality findings. | Improve provider reliability and verify a compliant live plan for every target age band. |
| Storyboard generation | In Progress | Versioned plans persist the selected teaching approach, narration, scenes, assets/actions, deterministic validation and review results. Plans below four scenes, 45 seconds, sentence limits, vocabulary rules, or explicit math invariants remain `INVALID` and unapprovable. | Re-evaluate duration adherence: the live Nursery correction still produced only 35 seconds. |
| Semantic AI review/fallback | In Progress | Groq reviewer instructions now require `NEEDS_REVISION` for unsuitable vocabulary, sentence length, concept depth or plan length. The live Nursery case returned `NEEDS_REVISION`; the Class 2 case did not reach a completed review because both allowed attempts ended in `NETWORK_ERROR`. | Diagnose provider/network reliability before further live quota use. |
| Illustration assets | In Progress | Original layered rabbit, carrot, basket, and story-world vector artwork has been rendered and visually inspected in the short prototype. | Expand the accepted style into the complete deterministic 3 × 2 teaching sequence only after founder review. |
| Hindi/English TTS | In Progress | ElevenLabs SDK/provider integration works. Temporary Eleven v4 voices are English/George and Hindi/Bella; timestamped narration is embedded in the POC renders. | Refine voices, pronunciation, pacing, and delivery before production. Production/commercial use remains unapproved. |
| Animation | In Progress | The deterministic rabbit-and-carrots sequence now follows real narration-derived scene boundaries while preserving three baskets, six carrots, repeated addition, and multiplication. | Founder reviews synchronized pacing and visual quality; current art remains POC quality. |
| Video rendering | Completed | Synchronized English and Hindi H.264/AAC MP4s validated at 1920×1080 and 30 FPS: 15.367 s/5.01 MiB and 15.133 s/4.94 MiB. | Retain the verified pipeline; do not treat temporary voices or current visuals as production quality. |
| Synchronization | In Progress | ElevenLabs character timing was normalized to words and used to set five real narration scene boundaries in each language. Both rendered outputs contain audio streams and matching durations. | Human watch-through remains required for subjective lip/action/caption timing; representative-frame extraction was not run because permission was declined. |
| Media storage | Pending Approval | R2 is the approved hosted direction, but no bucket/configuration exists; retention and access details remain open. | Define signed playback, CORS, lifecycle, deletion, backup, limits, and pricing. |
| Automated testing | In Progress | Web/root TypeScript checks, production build and 44/44 focused tests pass. Live Nursery evidence: 4 scenes, 35 seconds, `EXPLANATION`, Groq `NEEDS_REVISION`, correctly `INVALID`. Class 2 creation failed with `NETWORK_ERROR` on the initial call and its single allowed retry. | Add provider mocks for the correction-call orchestration and resolve live Cloudflare transport reliability before another live run. |
| Deployment | Not Started | No hosting, CI/CD, domain, environment, or deployment configuration exists. | Defer until POC evidence and architecture approval. |

## 8. Development log

Only repository-verifiable milestones are recorded. No commit identifiers are listed because the repository has no commits.

| Date | Milestone | Evidence |
|---|---|---|
| 10 November 2026 | Product requirements draft prepared for the child-focused educational story-video direction. | `docs/PRD.md` |
| 10 November 2026 | Central product and technical decision register created, including approval inconsistencies. | `docs/DECISIONS.md` |
| 10 November 2026 | Repository-wide Codex operating, safety, budget, and approval guardrails created. | `AGENTS.md` |
| 10 November 2026 | Repository inspected and factual project baseline recorded. | `PROJECT_STATUS.md`; repository contains documentation only, no commits or implementation |
| 10 November 2026 | Founder authorized Phase 0 Stage 1 offline rendering proof only. | Fixed `3 × 2 = 6` scope and test-only 1920×1080/30 FPS profile |
| 10 November 2026 | Minimal Stage 1 source, assets, tests, composition, and scripts created; pinned npm dependencies installed. | `src/`, `public/assets/`, `scripts/`, `tests/`, `package.json`, `package-lock.json` |
| 10 November 2026 | Stage 1 stopped at FFmpeg installation blocker. | `Gyan.FFmpeg` 9.0.2 download stalled at zero bytes; package is not installed; no render or verification completed |
| 11 November 2026 | Stage 1 static checks completed successfully. | TypeScript type-check passed; 4/4 deterministic tests passed; English 32.0 s and Hindi 33.6 s synthetic timelines validated |
| 11 November 2026 | Founder-authorized retry of the same FFmpeg package reproduced the installation blocker. | Winget download again remained at zero bytes and was terminated; no alternate source was used |
| 11 November 2026 | A reviewed npm-registry-bundled FFmpeg/FFprobe alternative enabled local evaluation. | Evaluation binaries installed at ₹0; build is GPL-enabled and remains evaluation-only pending distribution review |
| 11 November 2026 | Stage 1 English and Hindi MP4s rendered and validated. | H.264, 1920×1080, 30 FPS; English 32.0 s/1.07 MiB and Hindi 33.6 s/1.28 MiB |
| 11 November 2026 | Stage 1 feasibility recorded with a visual rejection. | Rendering and deterministic maths passed; founder rejected the presentation-like visual direction |
| 11 November 2026 | Short visual-style prototype rendered and inspected. | Silent H.264 clip, 1920×1080, 30 FPS, 10.0 s, 4,352,104 bytes; richer background, camera motion, expressive layered rabbit, and physical carrot movement verified in representative frames; complete 3 × 2 lesson and real narration remain outside this prototype |
| 11 November 2026 | Stage 1B complete silent visual lesson rendered and inspected. | H.264, 1920×1080, 30 FPS, 20.0 s, 5,799,931 bytes; three groups with two carrots each, `2 + 2 + 2 = 6`, and `3 × 2 = 6` verified across representative frames; type-check and 4/4 deterministic tests passed |
| 11 November 2026 | Static-camera cinematic draft rejected and removed. | The draft used camera movement over one 3D frame rather than genuine character animation. Its English MP4 was deleted and the Remotion integration reverted; the Ria 3D reference frame remains solely as direction for a true motion-generation test. |
| 11 November 2026 | Founder confirmed the ₹0-first V1 visual direction and documentation was reconciled. | Canonical PRD and decision register now specify premium cinematic 2.5D animation using reusable layered 3D-style artwork, with visible character/object motion required and static pan/zoom rejected. System, technical, database, API, pipeline, security, testing and roadmap documents were aligned; paid provider-generated true 3D remains deferred. |
| 11 November 2026 | Redundant generated documentation was consolidated and removed. | Canonical document ownership is recorded in `docs/SYSTEM_DESIGN.md`; unique database/storage and architecture guidance was retained. `PRODUCT_SCOPE.md`, `TECHNICAL_ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `ASSET_STORAGE.md`, and `DOCUMENTATION_REVIEW.md` were permanently removed after consolidation. |
| 11 November 2026 | First application domain-foundation batch implemented and verified. | Added provider/persistence-neutral records, runtime validators, guarded project/storyboard/job transitions, and owner-scoped repository interfaces under `web/lib/domain/`; `web` type-check passed and 9/9 root tests passed; no database, auth, API, page, provider, or Remotion changes |
| 11 November 2026 | Gemini creator and Groq reviewer/fallback foundations implemented and mock-verified. | Added native-fetch structured-output adapters, JSON schemas, safe prompts, normalizers and sanitized provider errors under `web/lib/ai/`; `web` type-check passed and 13/13 tests passed; no live provider request, key access, paid usage, database, API, page or Remotion change |
| 12 November 2026 | Founder-authorized MongoDB metadata foundation implemented from the canonical database design. | Added the documented six Mongoose models, constraints, owner/idempotency indexes, safe configuration validation, and index synchronization entry point; web type-check and 18/18 tests passed. Live Atlas ping safely failed before writes because the password contains an unescaped `@`; remote collections were not created. |
| 12 November 2026 | MongoDB Atlas connection and metadata structure verified. | Secure ping succeeded; six documented collections were created; index counts verified as users 3, lessonRequests 3, videoPlans 3, generationJobs 6, assets 3, and videos 3. No application data was inserted and the final web type-check passed. |
| 12 November 2026 | Database startup gate added and verified. | `web` now runs a sanitized Atlas ping before both development and production server startup; a failed check prevents Next.js from starting. The check printed a successful `edupilo` connection and the web type-check passed. |
| 12 November 2026 | Founder-approved bcrypt + JWT adult authentication implemented and verified. | Added local signup/login/logout/session routes, secure cookie/JWT helpers, bcrypt password storage, CSRF origin checks, rate limiting, user repository, branded login/signup pages, protected account route, homepage CTA wiring, and startup secret validation. Production build passed, 21/21 focused tests passed, and real Atlas-backed signup/duplicate/login/wrong-password/session/protection/logout behavior passed; the temporary test account was removed. |
| 12 November 2026 | Authenticated dashboard and lesson-draft milestone implemented and verified. | Added `/dashboard`, `/stories/new`, dashboard components, approved level-filtered taxonomy, client/server validation, owner-scoped lesson repository and REST routes; login/signup and `/account` now resolve to the dashboard. Production build and type-check passed, 24/24 tests passed, and Atlas-backed E2E checks verified persistence, ownership isolation and protected access. All temporary test users and drafts were removed. |
| 12 November 2026 | AI planning and adult-review application milestone implemented; live provider configuration remains incomplete. | Added server-only Gemini/Groq orchestration, mode selection without forced storytelling, deterministic explicit-math checks, versioned plan and validation persistence, idempotent bounded planning jobs, usage tracking, safe provider errors, revision/approval APIs and responsive plan review UI. Production build and type-check passed, 38/38 tests passed, and database/auth checks passed. `ai:check` reports missing `GEMINI_MODEL`, `GROQ_API_KEY`, and `GROQ_MODEL`, so no live provider call was claimed. |
| 12 November 2026 | Navigation, bug-fix and readability pass on the web app. | Web source reformatted (formatting only); `proxy.ts` route guard with safe `?next=` return paths and no-store protected responses; session-aware homepage header; full-page navigation on sign-in/out so Back never shows stale signed-in/out views; accessible account menu; read-only owner-scoped draft page `/stories/[projectId]` and styled 404; safe API error parsing; failed-attempt-only login lockout; shared style/colour tokens and error helpers. Production build passed, 29/29 tests passed, and headless-browser checks passed for protection redirects, homepage session state, account menu, draft open/Back, and Back-after-sign-out. |
| 12 November 2026 | `/stories/new` redesigned as an open-ended creative studio per founder direction. | Subject/topic dropdowns removed from the UX; `POST /api/lesson-projects` now accepts an idea with level, language and optional allowlisted `creativePreferences`, infers catalog metadata or stores `OPEN`, and still validates explicit legacy subject/topic pairs. Optional `taxonomySource` and `creativePreferences` fields were added to `lessonRequests` (existing drafts stay valid). Dashboard, nav, cards and draft page copy aligned. Web type-check passed, 35/35 tests passed, a live Atlas-backed save persisted level `CLASS_3`, language `hi-IN` and `OPEN` metadata, and desktop/mobile screenshots showed no overflow or console errors. The production build was not re-run for this change. The two new fields were proven by a model test; the already-running dev server still had the old schema cached and needs a restart to persist them. |
| 12 November 2026 | Cloudflare planning preview baseline committed and quality gates added. | Cloudflare Workers AI is the active creator with Groq review; topic-themed concept preview, owner-scoped delete, stale-job recovery and idempotent approval are present. Added level-specific prompt rules, pure scene/duration/sentence/vocabulary checks and one bounded creator correction. Live Nursery plan remained safely invalid at 4 scenes/35 seconds with Groq `NEEDS_REVISION`; Class 2 returned `NETWORK_ERROR` twice and no further retry was made. All temporary QA data was removed. |

## 9. Status maintenance rules

- Update this file only when repository evidence, verification results, blockers, or approved decisions materially change project progress.
| 12 November 2026 | Pre-commit review, hygiene fixes and full verification. | Fixed root TypeScript errors in two test files (type-only: `FetchLike` import path and index-tuple typing). Replaced a secret-shaped commented `JWT_SECRET` and the real Atlas username/host in `.env.example` with placeholders. Extended `.gitignore` to exclude `.tmp/`, generated `output/` media, generated narration audio, prototype styleframes, a desktop screenshot and an accidentally saved web page under `public/`. Verified: root and `web` type-checks passed, 38/38 tests passed, storyboard validation passed (3 × 2 = 6), and the production build passed with all routes. Atlas `db:check` failures were traced to a changing public IP not on the Atlas Network Access list, not to code. |
- Keep planned work separate from implemented work.
- Do not mark a system Completed until implementation exists and its relevant acceptance checks pass.
- Record failed or partial verification honestly.
- Do not convert Pending Approval or Proposed items into approved decisions here; update `docs/DECISIONS.md` only after explicit approval, then reflect the result here.
- Preserve chronological development-log entries; add new milestones rather than rewriting history without cause.
