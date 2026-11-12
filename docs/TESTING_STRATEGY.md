# Testing & Quality Strategy — Edupilo / AI Educational Story Video Platform V1

> **Confirmed animation quality boundary:** V1 targets free-first cinematic 2.5D motion using layered 3D-style artwork. Human and visual checks must reject static pan/zoom-only output and verify visible pose/expression or educational-object changes, depth/parallax, synchronization, and deterministic counts.

**Status:** Proposed quality strategy for review; **not evidence of implementation, tested results, or release approval**  
**Prepared:** 11 November 2026  
**Primary authority:** `docs/PRD.md` (requirements), `docs/DECISIONS.md` (approval status), root `AGENTS.md` (engineering rules).  
**Design inputs:** `docs/TECHNICAL_DESIGN.md`, `docs/SYSTEM_DESIGN.md`, `docs/DATABASE_DESIGN.md`, `docs/API_DESIGN.md`, `docs/GENERATION_PIPELINE.md`, and `docs/SECURITY_AND_SAFETY.md`.

> **Scope reconciliation:** The current decision register approves Gemini planning and Groq semantic review as Phase 0 directions, and **ElevenLabs only for internal Phase 0 TTS evaluation**; Azure is superseded. Next.js/TypeScript, MongoDB/Mongoose, worker, Remotion, and FFmpeg are proposed/candidate production technologies. Adult approval before rendering is an agreed requirement with an unresolved final safety-checklist signoff. User-facing MP4 download, arbitrary uploads, child accounts, quizzes, and external cinematic/3D video generation are **not approved V1 features**. Do not write tests that imply their implementation is authorized.
>
> **Evidence caveat:** The supplied dated `PROJECT_STATUS.md` describes a docs-only repository, but subsequent conversation shows a `web/` Next.js development server and Remotion POC scripts. Those observations do not verify integrated production features. Inspect the live repository and update status with actual results before executing this strategy.

## 1. Goals, scope, and risk priorities

The purpose of testing is to prove that an adult can request, review, and approve a developmentally appropriate English/Hindi lesson, and receive an **educationally correct, visually coherent, synchronized, playable** animated video—without unauthorized media generation, unsafe child-data handling, hidden charges, or broken recovery.

| Priority | Failure to prevent | Required evidence |
|---|---|---|
| Critical | Wrong counts, equations, or misleading narration | Deterministic assertions; adult educational review; frame/video inspection |
| Critical | Video generated from unapproved/changed plan | Immutable hash/version checks, API authorization, idempotent job-creation tests |
| Critical | User sees another adult's content or private media | Owner-scoped API/database tests; signed-playback tests |
| High | Hindi/English voice, captions, and actions disagree | Locale, pronunciation, alignment, typography, synchronized playback review |
| High | Inconsistent cartoon style or static slideshow masquerading as animation | Scene/pose/movement human rubric and controlled visual evidence |
| High | Provider, render, or worker failure loses work | Retry/checkpoint/lease/cancel tests; preserved prior output |
| High | Unexpected provider spend or licensing violation | Usage accounting and caps; license/provenance review |
| Medium | Performance, accessibility, mobile layout defects | Build/browser checks, accessibility review, timed POC measurements |

**Testing principle:** Passing schema, unit, typecheck, FFprobe, or successful MP4 export does **not** establish that a video teaches well. Automated checks and human evaluation are complementary release requirements.

## 2. Environments, fixtures, and evidence

### 2.1 Environments (proposed)

- **Unit/contract:** Local, deterministic fixtures and mocked adapters; no provider API required.
- **Media POC:** Windows machine with approximately 8 GB RAM and Intel Iris Xe; one heavy render at a time. Record actual Node/npm/OS/Remotion/FFmpeg versions and available RAM/disk.
- **Provider sandbox:** Separate development credentials with usage tracking; only explicit, approved free-tier experiments. Never place secrets in fixture snapshots or logs.
- **Integration environment:** Isolated test metadata and private media paths; production MongoDB, R2 and authentication components only after stack and policy approvals.
- **Invited beta:** Not authorized until architecture, privacy, child-safety, retention, licensing, and spend approvals are resolved.

### 2.2 Canonical fixtures

| ID | Fixture | Required assertion |
|---|---|---|
| `MATH-EN-001` | Class 2, `en-IN`, rabbit, three baskets, two carrots per basket | Exactly 3 groups; 2/group; total 6; `2 + 2 + 2 = 6`; `3 × 2 = 6` |
| `MATH-HI-001` | Same facts, `hi-IN`, natural Hindi narration and captions | Same quantities; Hindi voice/captions; Hindi font renders without missing glyphs |
| `MATH-BAD-COUNT` | Three baskets with a stated total of seven | Reject before review/render |
| `MATH-BAD-ACTION` | Unknown/unapproved storyboard animation action | Reject by allowlist |
| `PLAN-CHANGED` | Approved plan content edited after hash/version approval | Render blocked; fresh approval required |
| `PLAN-UNAPPROVED` | Valid draft/review-ready plan lacking explicit adult approval | TTS and rendering blocked |
| `TTS-HI-FAIL` | Empty audio, wrong language, missing/invalid timing or truncated speech | Fail clearly; never silently substitute English |
| `PROVIDER-429` | Rate limit, retry-after, timeout, transient 5xx | Bounded retry/backoff; no uncontrolled usage |
| `WORKER-CRASH` | Process exits during `NARRATION` or `RENDERING` | Safe checkpoint recovery; no corrupt ready video |
| `AUTH-OTHER-OWNER` | Adult A attempts access to adult B's lesson/video | No unauthorized data or playback URL disclosure |

Fixtures should be versioned, small, nonpersonal, license-safe, and stable. They must not contain actual child identities or live API credentials. The second **transfer topic** is still unselected: create its fixture only after approval.

## 3. Automated test matrix

### 3.1 Domain and schema unit tests

- Require supported learner level, subject/topic taxonomy, `en-IN`/`hi-IN`, bounded instruction, stable `schemaVersion`, unique `sceneId`, learning purpose, narration, visual intent, supported assets/actions, and numeric fact types.
- Reject malformed JSON, absent fields, unknown enums/actions, impossible/negative group counts, broken references, duplicate scene IDs, excessive text, and unsafe HTML/SVG strings.
- Keep script **and storyboard together** in one validated plan version; do not accept independent narration/storyboard states with conflicting facts.
- Check plan content hashing, immutability after approval, approval metadata, safe revision/version increment, and retention of the previous valid plan.
- Validate phrase/word timing normalization: ascending starts, nonnegative duration, no invalid overlaps where disallowed, timestamps bounded by audio duration.

### 3.2 Deterministic educational correctness

For the rabbit lesson, unit tests must verify:

```text
groups = 3
itemsPerGroup = 2
calculatedTotal = groups * itemsPerGroup = 6
assert renderedBasketCount == 3
assert carrotsPerBasket == [2, 2, 2]
assert visibleCarrotTotal == 6
assert repeatedAddition == "2 + 2 + 2 = 6"
assert multiplication == "3 × 2 = 6"
```

- Build object counts, layouts, label values, and equations from **structured numeric facts**, not image-model guesses or regex extraction from narration.
- Exercise reveal ordering, duplicate/missing carrots, wrong basket grouping, correct equation paired with incorrect visual, late visual reveals, and non-integer/unsupported values.
- Assert every stage and frame checkpoint that changes quantities preserves the approved invariant; an intermediate step may reveal fewer items intentionally, but must never silently display an incorrect completed fact.
- Add transfer-topic deterministic rules only after the topic and relevant facts are approved.

### 3.3 Database and repository integration tests (after stack approval)

Use an isolated database and the proposed six-collection model (`users`, `lessonRequests`, `videoPlans`, `generationJobs`, `assets`, `videos`). Verify:

- `ownerId`-scoped reads and writes, cross-owner join consistency, and no ID-enumeration leaks.
- Unique `authSubject`, plan `(lessonRequestId, version)`, job `idempotencyKey`, video `generationJobId`, and versioned asset `logicalKey` indexes.
- Transaction/atomicity: approving the plan creates **exactly one** video job or neither action commits.
- Immutable approved plan content and integrity hash checks.
- Atomic lease claim, heartbeat, stale lease recovery, attempt count, and independent worker restart.
- Media bytes are **not** stored in MongoDB; only private object keys/checksums and bounded metadata are stored.
- Deletion and retention behavior are **not** tested as decided policy until founder/privacy approval; test only non-destructive proposed semantics meanwhile.

### 3.4 API contract tests (after route/auth implementation approval)

Use the proposed `/api/v1` API, preserving contracts from `API_DESIGN.md`. Cover:

| Workflow | Success and negative-contract checks |
|---|---|
| Create/list/read draft lessons | Validated payload and pagination; `400/422` for invalid input; `401` unauthenticated; no cross-owner reads |
| Generate/list/read plans | `202` for durable planning; immutable plan versions; schema errors and rate limits surfaced safely |
| Request revision | Scoped changes create a new version; old approved/review-ready version stays intact |
| Approve exact plan | Hash/version match, explicit authenticated adult action; one durable job; duplicate click returns same logical result |
| Read/cancel/retry jobs | Correct named stage/state; bounded retries; owner checks; safe cancellation |
| Read video / playback session | Only `READY` authorized media; short-lived URL or controlled stream; no permanent public URLs or download endpoint |

Check stable `{data, requestId}` / `{error: {code, message, retryable, details}, requestId}` envelopes, correct HTTP codes (`201/202/400/401/403/404/409/422/429/503` as relevant), sanitized errors, cursor bounds and state conflicts. Do **not** create new generic `/render`, arbitrary user-upload, public sharing, or MP4 download APIs merely to satisfy an imagined test.

### 3.5 Job state-machine and recovery tests

Allowed machine flow: `QUEUED → CLAIMED → RUNNING → SUCCEEDED`; retryable failures pass through `WAITING_RETRY → QUEUED`; terminal failures move to `FAILED`; cancellation via the documented safe checkpoints. Test:

- Legal/illegal state transitions, double worker claim, lease expiration, heartbeat failure, crash/restart and stale-claim recovery.
- Repeated user click, HTTP retry, provider retry, worker restart, and duplicate callback cannot create multiple billable jobs from one approved plan.
- Preserve successful narration/assets/checkpoints; retry only affected stage when safe; keep previous valid final video until replacement passes validation.
- Cancellation before media work and while rendering; never publish partial MP4 or pretend the provider was cancelled if it finished externally.
- Named progress stages, not fabricated percentages; status survives browser reload and API restart when persisted implementation is approved.

### 3.6 Provider adapter tests

| Adapter | Fixture/mocked check | Human/live check, only after evaluation approval |
|---|---|---|
| Gemini planner | Parse one combined script/storyboard JSON; reject invalid schema, wrong facts, unsupported actions; record model/latency/usage | Try small approved English/Hindi cases; record schema pass rate, cost and privacy terms |
| Groq reviewer/fallback | Structured findings; no silent rewrite; bounded correction; fallback uses identical contract | Record false positives, missed errors, and fallback quality; do not treat reviewer as fact verifier |
| ElevenLabs TTS | Wrong locale, empty audio, timing gaps, provider 429/5xx, voice mismatch, caching and usage | Compare Hindi/English voices, numbers/equations, warmth, pronunciation and timestamp quality using approved free evaluation |
| Asset catalogue | Missing asset, wrong pose, unsupported action, corrupt hash, absent license/provenance | Inspect consistency and rights evidence |
| Remotion/FFmpeg candidates | Renderer failure, malformed scene manifest, bad codec/probe, unexpected frame count | Assess feasibility, actual RAM/time/quality and licensing |
| Storage adapter | Expired signed access, wrong content type/checksum, failed upload, forbidden cross-owner reference | R2 behavior only after approved configuration |

Do not send real child information to test providers. Keep request/response fixtures sanitized, without secrets, expiring signed URLs, or raw sensitive content. Live tests must have fixed quotas and explicit approval; mock tests must never be labeled as proof of real provider reliability.

## 4. Audio, visuals, and finished-media checks

### 4.1 Hindi/English language, caption, and timing checks

**Automated:** locale consistency from request to plan to voice to media metadata; Unicode preservation; Devanagari glyph coverage in chosen licensed font; captions inside safe areas; no blank/clipped caption data; caption start/end bounds; alignment cues anchored to measured narration rather than estimated storyboard duration; equation glyphs display correctly.

**Human bilingual listeners:** natural pronunciation of “three groups of two,” `2 + 2 + 2`, `3 × 2`, “टोकरी”, “गाजर”, and key number terms; warm and age-appropriate pacing; no English fallback in a Hindi lesson; understandable pauses before recap. Use real listening notes per voice/model/version. Do not claim a timing error threshold until measured and approved.

### 4.2 Remotion render smoke and FFprobe checks

For an approved test profile, check:

- Composition loads without missing fonts/assets; one scene and a full five-scene render complete without crash.
- Native dimensions, fps, duration, stream presence, audio codecs, frame count, file size, checksums and playable MP4 are measured via FFprobe/FFmpeg.
- Nonzero audio, no silent unexpected gaps, truncated last word, out-of-bounds text, missing object reveals, corrupt frames or unfinished ending.
- A lower-resolution draft is labeled **preview only**; a final-quality candidate must meet **native 1080p** if/when the founder approves that bar. Aspect ratio and 24/30fps remain test-profile decisions, not settled V1 choices.
- Record actual peak RAM, CPU/elapsed render time, output size, process exits and operator observations on the Windows 8 GB machine. Do not invent performance targets or convert one successful render into a production SLA.

**Example inspection (only after a file exists):**

```powershell
ffprobe -v error -show_entries format=duration,size:stream=index,codec_type,codec_name,width,height,r_frame_rate,sample_rate -of json output/rabbit-carrots-complete-visual.mp4
```

A command passing does not establish that a child can understand the lesson.

### 4.3 Visual regression and animation correctness

- Use fixed storyboard, asset revision, font, renderer version, render profile and frame timestamps to produce reproducible screenshots or short representative clips.
- Compare beginning/middle/end, basket reveal, carrot distribution, addition equation, multiplication equation, and language-specific captions.
- Automated pixel/image-diff flags can detect unexpected changes, but **font rasterization, antialiasing, machine variation, motion blur and intentional creative revisions require human adjudication**; thresholds must be established from actual baselines.
- Flag pose discontinuities, character changes between scenes, broken limbs, wrong object layering, overlaps, clipped labels, illegible captions, and visually empty “slides.”

### 4.4 Human character-consistency and motion-quality rubric

Score each category **1–5** in the POC, recording timecoded evidence. This rubric is **proposed for evaluation**, not an approved release threshold.

| Dimension | 1 — fails | 3 — needs refinement | 5 — strong |
|---|---|---|---|
| Character consistency | Rabbit changes design, color, scale, or proportions | Minor style/pose shifts | Recognizably same rabbit across all shots |
| Genuine action | Mostly static slides/zoom effects | Some object and pose changes | Rabbit/objects move purposefully and clearly demonstrate concept |
| Educational visual alignment | Wrong count or unrelated visuals | Correct but late/unclear reveals | Exact quantities/action synchronized with explanation |
| Scene composition | Crowded, clipped, distracting | Some readability/pacing issues | Strong hierarchy, readable objects, clear focal point |
| Timing and pacing | Rushed, dead space, or misleading transitions | Understandable with awkward holds | Action, speech, captions and comprehension holds feel natural |
| Child appropriateness | Overstimulating or confusing | Suitable but inconsistent | Warm, engaging, age-fitting without distracting from concept |

At least one adult reviewer should inspect the whole video; Hindi should be reviewed by a proficient Hindi speaker. A parent/teacher pilot is desirable after permission, but **learning improvement claims require a separate study**. For mathematically incorrect output, a high overall aesthetic score cannot override a fail.

## 5. Failure injection and security tests

### 5.1 Failure matrix

| Injected failure | Expected safe outcome |
|---|---|
| Gemini/Groq malformed output or disagreement | Invalid plan returned for bounded correction/review; no automatic media job |
| Unsupported action / asset without provenance | Block render, identify actionable missing input/asset |
| Wrong math despite reviewer “pass” | Deterministic validator blocks generation |
| ElevenLabs wrong voice/language, invalid timing, 429/5xx | Explicit failure or bounded retry; no silent language change |
| Worker crash, timeout, render OOM | Durable diagnostic; safe resume when possible; no corrupt `READY` video |
| FFmpeg invalid stream or media checksum mismatch | Mark output failed; keep previous valid version |
| Storage outage or expired signed URL | Safe retry/refresh after authorization; never expose permanent public object |
| Duplicate approval and network retry | Exactly one logical approved generation/job; no duplicated provider expense |
| Over-budget/provider cap reached | Stop with clear reason; never upgrade tier or initiate paid usage automatically |

### 5.2 Security/privacy negative tests

- Anonymous and cross-account requests to lessons, plans, jobs, videos, and playback must fail without resource enumeration.
- Verify plan-hash approval cannot be forged by modifying a client-supplied `ownerId` or calling an undocumented render route.
- Test XSS in lesson titles/captions and malicious SVG/HTML text; test JSON size/depth limits, unsafe filenames/path traversal, output-path escaping, SSRF-relevant asset references if any fetch capability is approved, and unsafe shell interpolation when invoking FFmpeg.
- Test session/CSRF protections once authentication implementation is selected; ensure authentication, generation, review, retry and playback routes are rate-limited as appropriate.
- Verify secrets, raw sensitive input, full provider payloads, signed playback URLs, and personally identifying child details are excluded from error responses, browser bundles and routine logs.
- **Upload-abuse:** The V1 API does **not** authorize user-supplied uploads. Assert that arbitrary upload routes are absent/blocked. If upload scope is later approved, introduce MIME/magic-byte checks, file-size and image-dimension limits, SVG sanitization, quotas and malware/content review **after** that approval.
- Retention/deletion security tests cannot have pass/fail policy values until a policy is explicitly approved; avoid speculative destructive cleanup.

## 6. Usage, cost, licensing and performance tests

- Record **provider, exact model/voice, request/attempt ID, token/character/audio count, cache hit, retries, latency and estimated cost** for each allowed external call.
- Simulate exhaustion/429 and a spend ceiling; verify no silent fallback to paid or unauthorized providers and no unlimited retry loops.
- Confirm duplicate attempts use stable idempotency/caching keys and that unsuccessful results do not masquerade as cache hits.
- Measure rendering wall-clock time, peak RAM, disk occupancy and output size; keep one heavy local render at a time unless measured evidence and approval permit more.
- Document current license/provenance for fonts, music, illustrations, voice output, model terms, Remotion and the chosen FFmpeg build/codecs. **Free-tier access is not commercial-use approval**, especially ElevenLabs Phase 0 output.
- Set latency, peak-RAM, cost-per-video, maximum requests/day, concurrency and acceptance thresholds only after POC measurements and founder signoff (`OPS-004`).

## 7. End-to-end acceptance scenarios

### E2E-1 — English rabbit-and-carrots lesson (target happy path)

1. An authenticated adult creates a Class 2 math request, `en-IN`, “Explain multiplication using a rabbit and carrots.”
2. Gemini returns a single script/storyboard; schema and deterministic equal-groups assertions run; Groq produces advisory findings.
3. Adult views narration **alongside** the scene descriptions, requests an optional supported revision, then explicitly approves an exact immutable plan/version/hash.
4. Exactly one durable video job is created; worker prepares approved rabbit/basket/carrot assets and ElevenLabs narration with normalized timing.
5. Remotion animates three baskets, places exactly two carrots in each, displays `2 + 2 + 2 = 6` and `3 × 2 = 6`, synchronized to narration.
6. FFprobe/media validation passes; media is stored privately; owner can play and seek the final video.
7. Another adult cannot access its lesson, job, object key, playback URL or video. No user-facing MP4 download is exposed.
8. Record all build/test evidence, human visual/language signoff, provider usage and local performance measurements.

### E2E-2 — Hindi equivalent

Repeat the same mathematical facts and approval workflow with `hi-IN`, Hindi narration, Devanagari font/captions and Hindi-speaker listening review. No silent language change.

### E2E-3 — Failure and recovery

Simulate one provider or worker-stage failure, recover an approved checkpoint without duplicating cost, keep the last valid video if a revision fails, and return an accurate named status rather than “100% complete.”

**Important:** These scenarios are **future acceptance designs**, not claims that the current code implements them. Phase 0 may use fixed lesson fixtures and local files before the app, auth, database, worker and R2 are approved and implemented. The second transfer-topic E2E scenario requires a separate topic decision.

## 8. Execution sequencing and release gates

| Gate | Minimum evidence required | Decision |
|---|---|---|
| **G0 — Phase 0 authorization** | Explicit founder approval of POC scope/tools, approved test inputs, privacy/budget boundaries, asset rights | Start limited experiments only |
| **G1 — Structured educational proof** | Valid EN/HI fixture, schema rejects malformed plans, exact math assertions, supported action vocabulary, documented semantic-review results | Proceed to approved narration/visual experiment |
| **G2 — Media proof** | Human-reviewed EN/HI voices, visible character/object motion, synchronized cues, complete render, FFprobe results, captured RAM/time/cost | POC go/change/stop decision; **not a production release** |
| **G3 — Application integration** | Approved stack/auth/storage/job policies, owner-scoped DB/API tests, adult gate, recovery, protected playback, full E2E success | Candidate invited-beta readiness |
| **G4 — Invited-beta approval** | Signed-off child-safety/privacy/retention policies, license review, spend controls, accessibility, critical defect closure, accepted performance targets | Founder + accountable reviewer approval required |
| **G5 — Public/commercial release** | Production provider terms, commercial asset/voice rights, monitoring/incident plan, security and legal review, reproducible release evidence | Separate explicit public-release decision |

### 8.1 Defect severity (proposed)

- **Blocker:** Incorrect mathematical facts or rendered quantities; unauthorized access; media generated without adult approval; child-sensitive leakage; credential exposure; unauthorized paid usage; unsafe or unlicensed final assets.
- **High:** Wrong narration language, significant desynchronization, corrupt/unplayable final media, lost approved work, uncontrolled retries, pervasive inconsistent character appearance.
- **Medium:** Clearly perceptible but nonmisleading pacing, caption, responsiveness or visual defects; recoverable accessibility problems.
- **Low:** Cosmetic differences that do not affect understanding, privacy, functionality or accessibility.

Blockers must have **zero open issues** for any final release. Exact quantitative thresholds for other categories must be approved based on POC evidence.

### 8.2 Evidence record per executed run

```text
Run ID / date / operator:
Repository revision + working-tree changes:
Target stage (unit / POC / integration / beta):
Test fixture + schema version + approved plan hash:
Models/voices/tools/asset revisions and licenses:
Commands executed and exit codes:
Automated checks: pass/fail/not run, with logs:
Human educational reviewer and findings:
Hindi/English listener + visual rubric scores:
Media probe: duration, streams, width, height, fps, codec, bytes:
Resource metrics: peak RAM, elapsed time, disk:
Provider usage: tokens/characters/requests/retries/estimate:
Defects, reproduction steps, severity and owner:
Decision: pass / fail / blocked / needs approval:
```

Never mark a feature complete from a file's existence, a clean typecheck or one sample render. Maintain actual execution evidence in `PROJECT_STATUS.md` once tests run; do not modify decisions merely because a test passed.

## 9. Pending approvals and next practical step

1. Formal approval of target audience, V1 boundaries, first POC/transfer topic and adult approval gate.
2. Binding 1080p bar, initial test aspect ratio/FPS, and measurable quality, synchronization, performance and spend thresholds.
3. Exact Gemini/Groq models; ElevenLabs model/voices and permitted noncommercial evaluation; provider privacy/data handling.
4. Proposed Next.js/database/worker/auth stack and later R2 access, media retention/deletion and storage policies.
5. Remotion/FFmpeg/voice/assets/fonts/music/codecs licensing and public-use eligibility.
6. Sensitive-topic policy owner, child-data/consent rules and qualified legal review before public release.

**Recommended first test task:** Inspect the current POC source and available scripts; run local storyboard validation and deterministic `3 × 2 = 6` checks on the fixed rabbit-and-carrots fixture, capture the actual outcomes, then progress to authorized visual and bilingual narration reviews. Do **not** start unapproved paid provider requests, public-media publication or additional product features.
