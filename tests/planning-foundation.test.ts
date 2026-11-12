import assert from "node:assert/strict";
import test from "node:test";
import { deterministicFactsFromInstruction,planMatchesExpectedFacts } from "../web/lib/plans/facts";
import { validatePlanQuality } from "../web/lib/plans/quality";
import type { NormalizedPlanDraft } from "../web/lib/domain";

test("explicit multiplication becomes deterministic equal-group facts",()=>{const result=deterministicFactsFromInstruction("Explain 3 × 2 using carrots");assert.equal(result.promptFacts.total,6);assert.equal(result.expectedFacts[0]?.kind,"EQUAL_GROUPS");assert.equal(planMatchesExpectedFacts(result.expectedFacts,result.expectedFacts),true)});
test("open ideas do not invent deterministic quantities",()=>{const result=deterministicFactsFromInstruction("Why does the moon appear to change shape?");assert.deepEqual(result.promptFacts,{});assert.deepEqual(result.expectedFacts,[])});
test("mismatched explicit arithmetic is rejected",()=>{const result=deterministicFactsFromInstruction("Show 3 groups of 2 items");const wrong=result.expectedFacts.map(f=>f.kind==="EQUAL_GROUPS"?{...f,total:7}:f);assert.equal(planMatchesExpectedFacts(result.expectedFacts,wrong),false)});

const plan=(narration:string,sceneCount=4,duration=12_000):NormalizedPlanDraft=>({locale:"en-IN",title:"Moon shapes",learningObjective:"Notice why the Moon looks different",presentationMode:"VISUAL_EXPLORATION",explanationApproach:"Use a lamp and ball",scenes:Array.from({length:sceneCount},(_,index)=>({learningPurpose:`Step ${index+1}`,narration,visualIntent:"Show a concrete model",estimatedDurationMs:duration,facts:[],assets:[],actions:[]}))});
test("age quality accepts a paced Nursery plan with short concrete narration",()=>{const result=validatePlanQuality(plan("Look at our bright Moon tonight."),"NURSERY");assert.equal(result.valid,true);assert.equal(result.totalDurationMs,48_000)});
test("age quality rejects short plans, long sentences and advanced Nursery words",()=>{const result=validatePlanQuality(plan("The Moon orbits Earth through many lunar phases that change as sunlight reaches it.",2,4_500),"NURSERY");const codes=new Set(result.findings.map(f=>f.code));assert.equal(result.valid,false);assert.ok(codes.has("TOO_FEW_SCENES"));assert.ok(codes.has("PLAN_TOO_SHORT"));assert.ok(codes.has("SENTENCE_TOO_LONG"));assert.ok(codes.has("VOCABULARY_TOO_ADVANCED"))});
test("sentence limits become progressively wider by learner level",()=>{const narration="One two three four five six seven eight nine ten eleven twelve.";assert.equal(validatePlanQuality(plan(narration),"NURSERY").valid,false);assert.equal(validatePlanQuality(plan(narration),"CLASS_2").valid,true)});
