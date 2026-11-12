import assert from "node:assert/strict";
import test from "node:test";
import { deterministicFactsFromInstruction,planMatchesExpectedFacts } from "../web/lib/plans/facts";

test("explicit multiplication becomes deterministic equal-group facts",()=>{const result=deterministicFactsFromInstruction("Explain 3 × 2 using carrots");assert.equal(result.promptFacts.total,6);assert.equal(result.expectedFacts[0]?.kind,"EQUAL_GROUPS");assert.equal(planMatchesExpectedFacts(result.expectedFacts,result.expectedFacts),true)});
test("open ideas do not invent deterministic quantities",()=>{const result=deterministicFactsFromInstruction("Why does the moon appear to change shape?");assert.deepEqual(result.promptFacts,{});assert.deepEqual(result.expectedFacts,[])});
test("mismatched explicit arithmetic is rejected",()=>{const result=deterministicFactsFromInstruction("Show 3 groups of 2 items");const wrong=result.expectedFacts.map(f=>f.kind==="EQUAL_GROUPS"?{...f,total:7}:f);assert.equal(planMatchesExpectedFacts(result.expectedFacts,wrong),false)});
