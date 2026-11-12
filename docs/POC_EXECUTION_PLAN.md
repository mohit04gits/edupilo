# Phase 0 — Educational Story Video Proof of Concept

**Status:** Proposed plan — **not approved for execution**  
**Source documents:** `PRD.md` §§12, 13, 21–24; `DECISIONS.md`; `TECHNICAL_DESIGN.md` §§2, 8–10; root `AGENTS.md`; root `PROJECT_STATUS.md`  
**Scope:** Prove the risky video-generation pipeline before building the full application. Do not change PRD or decision statuses without explicit founder approval.

## 1. Experiment question

Can a constrained, zero-cost-first hybrid pipeline produce a **correct, engaging, synchronized, Hindi- and English-narrated educational animation** at the PRD's proposed final-quality bar on the current Windows **8 GB RAM / Intel Iris Xe** development machine, without hiding costs or relying on unrestricted generative video?

**Proposed first lesson:** Class 2 — multiplication as equal groups, using one cartoon rabbit, baskets and carrots. The technical-design example uses **three groups of two carrots = six**; confirm the exact numeric example at POC kickoff and keep all story facts internally consistent.

**Second transfer topic:** Unselected. Must test a substantially different visual behavior (for example, a science process), but no topic is approved merely by being suggested here.

## 2. Approval gate — before implementation

The founder must explicitly decide:

- [ ] Authorize **Phase 0 POC only**, not full MVP development or production deployment.
- [ ] Confirm the rabbit-and-carrots lesson and the exact numeric demonstration.
- [ ] Approve or revise the POC acceptance rubric below and select a transfer topic.
- [ ] Permit *evaluation* of Gemini, Groq, Azure Speech, Remotion and FFmpeg within published free/eligible terms; exact models, voices and software-license obligations must be verified first.
- [ ] Decide whether native **1080p** is the binding final POC output requirement; select a **test-only** 16:9 or 9:16 profile and **test-only** 24/30 fps configuration, without treating them as V1 commitments.
- [ ] Confirm non-bypassable adult review for any actual media-generation experiment.
- [ ] Approve any API signup, billing requirements, quotas or exposure of lesson text to external processors; **no paid usage without separate approval**.

The PRD has additional global product and safety signoffs pending. They remain pending even if a limited POC is authorized.

## 3. Explicit POC boundaries

**Included:** fixed lesson inputs; versioned script/storyboard schema; deterministic equal-groups checks; one small reusable licensed illustration set; two narration languages; timing cues; limited scene templates; local render; playback of the produced file; measurements and documented failures.

**Excluded:** accounts, role onboarding UI, Next.js app, MongoDB, Cloudflare R2, persistent production queue, payments, sharing, user download feature, student data, curriculum-board alignment, production hosting, quizzes and advanced character rigs. A locally rendered file for evaluation is not a user-facing download product feature.

## 4. Execution sequence and evidence

| Stage | Smallest deliverable | Pass/fail evidence | Dependencies |
|---|---|---|---|
| 0. Record baseline | RAM, available disk, runtime versions and current tool-license/price notes | Configuration and usage log; no invented benchmarks | POC approval |
| 1. Define contract | Versioned lesson/storyboard JSON schema; supported action and asset ID lists | Valid fixture accepted; malformed, unknown action and wrong-number fixtures rejected | Topic and quantities chosen |
| 2. Plan in English and Hindi | One jointly generated script + storyboard per language | Coherent narration, objective and visuals; JSON/schema and language validation | Approved Gemini evaluation model/config |
| 3. Semantic review | Structured Groq findings, correction boundary and provider fallback experiment | Document reviewer disagreements, false positives and fallback behavior; do not treat LLM review as truth proof | Valid structured plans |
| 4. Deterministic lesson validation | Numeric facts and object-layout rules | `groups × itemsPerGroup = total`, all displayed object counts and equations match facts | Schema |
| 5. Visual asset prototype | One consistent layered rabbit, baskets, carrots, background and programmatic labels | Record origin/license/permissions; correct counts remain programmatic; reusable layers visible | Approved asset sources |
| 6. Bilingual narration | Hindi and English audio files with phrase/word timing metadata where available | Human listening notes: warmth, numerals, pronunciation, pacing; no language substitution | Approved Azure voices/tier for evaluation |
| 7. Animation + timing | Timed visual actions: rabbit enters, 3 baskets, 2 carrots per basket, repeated addition, multiplication, recap | Alignment inspection for count words, on-screen quantities, equations and caption cues | Assets and audio timings |
| 8. Local render | Draft previews and, if approved, a **native 1080p** final MP4 | FFmpeg media inspection; playback; audio/video sync; peak RAM, duration, output size | Remotion/FFmpeg evaluations and rights |
| 9. Transfer test | Different approved topic using same JSON contract and some templates | New example works without rewriting core contracts; limitations clearly identified | Transfer-topic approval |
| 10. Decision report | Go / Change / Stop recommendation | Evidence table, open defects, provider usage/cost, trade-offs | All test records |

These stages are **not instructions to install packages or start coding now**.

## 5. Proposed scene storyboard for the first lesson

| Scene | Learning purpose | Visual action | Educational invariant |
|---|---|---|---|
| 1 | Establish the problem | Rabbit introduces carrot-grouping situation | Language and class level suit Class 2 |
| 2 | Make groups visible | Three baskets appear | Exactly **3** groups |
| 3 | Demonstrate equal grouping | Two carrots are placed in each basket | Exactly **2** per group; **6** in total |
| 4 | Link grouping to addition | Show `2 + 2 + 2 = 6` using programmatic text | Equation and object quantities agree |
| 5 | Show multiplication | Show `3 × 2 = 6` and short recap | Concept stays accurate; timing permits comprehension |

The adult must review the scripted explanation and displayed mathematical facts before the media stages. Alternate numeric examples require regeneration and validation of all associated facts.

## 6. Proposed evaluation rubric — thresholds still pending

| Dimension | Required observation | Reviewer / method |
|---|---|---|
| Educational correctness | Every numeric object, grouping and equation is correct; no misleading explanation | Deterministic assertions **and** adult reviewer |
| Story and age fit | Class 2 vocabulary, pacing and narrative clarify rather than distract | Adult reviewer |
| Bilingual quality | English and Hindi speech are intelligible, warm, correctly pronounced and appropriately paced | Fluent language listeners |
| Visual consistency | Same rabbit design/proportions/poses and matching objects across scenes | Human visual review |
| Timing/captions | Spoken count and reveal correspond; text is readable, well timed, and not crowded | Playback review; inspect normalized cues |
| Render integrity | Output decodes, includes expected streams and resolution; no clipping, corrupt frames, missing audio or obvious defects | FFmpeg inspection and playback |
| Local feasibility | Render completes without destabilizing machine; record peak RAM, time, size, CPU/disk behavior | Measurement, not guessed thresholds |
| Provider reliability | Model outputs conform to schema; errors and retries are bounded; cache behavior documented | Recorded trials, error cases |
| Cost/legal | Usage recorded, zero unauthorized charges, commercial permission questions identified | Provider dashboard/checklist |
| Extensibility | A distinct topic reuses validated contract and renderer patterns | Transfer-topic test |

Do **not** declare success just because one video renders. Numerical success targets, acceptable latency, sync tolerance and POC sample count are not yet approved: propose values after initial measurements, then request approval.

## 7. Suggested minimal technical interfaces (discussion only)

```text
LessonInput -> CreatorAdapter -> StructuredPlan
StructuredPlan -> SchemaValidator -> MathValidator -> ReviewerAdapter
ValidatedPlan -> AdultApprovalRecord -> AssetManifest
ApprovedPlan + AssetManifest -> TTSAdapter -> NormalizedTiming
ApprovedPlan + AssetManifest + NormalizedTiming -> SceneManifest
SceneManifest -> RendererAdapter -> MediaValidator -> LocalMP4
```

All generated data stays **data**, not arbitrary runnable code. Use approved assets, action allowlists, normalized timing and stable schema versions. The renderer cannot silently change approved facts, video language or quality.

## 8. Failure cases to deliberately test

- LLM malformed JSON, unsupported animation action, incorrect equation or age-inappropriate phrasing.
- Creator rate limit, provider timeout, reviewer disagreement and fallback response that fails schema.
- Hindi voice unsupported/incorrect pronunciation, missing timing metadata, empty/clipped audio.
- Missing or unlicensed asset; mismatch between requested action and supported poses.
- Rendering process failure, high RAM, incomplete MP4 and audio–visual drift.
- Repeated request/retry unexpectedly consuming additional quota.

For every case record expected safe behavior, observed outcome and whether manual approval or revised design is needed. Do not quietly replace Hindi with English, a precise quantity with a generated image guess, or a final render with a lower-quality draft.

## 9. Evidence report template

| Field | Result |
|---|---|
| Exact tool/model/voice versions | Not tested |
| Test input and approved plan hash | Not available |
| Render profile used | Pending approval |
| English/Hindi audio inspection | Not tested |
| Mathematical correctness | Not tested |
| Visual and sync review | Not tested |
| Peak RAM and render duration | Not measured |
| MP4 size / codec / resolution | Not measured |
| Requests / tokens / characters / estimated cost | Not measured |
| License and usage terms verified | Pending |
| Transfer topic outcome | Not selected |
| Final recommendation | Pending evidence |

## 10. Exit and handoff

The founder receives a **Go / Change / Stop** recommendation with evidence, not an automatic production approval. If the POC succeeds, the next separately approved work is to settle the proposed Next.js/MongoDB/worker stack, authentication, job persistence, storage policy and initial topics before building the adult-facing MVP.

Update `PROJECT_STATUS.md` only to reflect genuine execution and measurements. Record approvals in `DECISIONS.md` only after explicit authorization. Keep `PRD.md`, `TECHNICAL_DESIGN.md`, and `AGENTS.md` unchanged unless an approved amendment is requested.
