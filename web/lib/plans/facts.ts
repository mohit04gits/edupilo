import type { EducationalFact } from "../domain";

/** Extract only explicit equal-group arithmetic; all other facts remain for adult review. */
export function deterministicFactsFromInstruction(instruction: string): {
  promptFacts: Readonly<Record<string, string | number | readonly number[]>>;
  expectedFacts: readonly EducationalFact[];
} {
  const normalized = instruction.normalize("NFKC");
  const match = normalized.match(/(?:([1-9]\d?)\s*(?:groups?\s*(?:of|with)|[×x*])\s*([1-9]\d?))|(?:([1-9]\d?)\s*[×x*]\s*([1-9]\d?))/i);
  if (!match) return { promptFacts: {}, expectedFacts: [] };
  const groups = Number(match[1] ?? match[3]);
  const itemsPerGroup = Number(match[2] ?? match[4]);
  const total = groups * itemsPerGroup;
  const itemLabel = "items";
  const fact: EducationalFact = {
    kind: "EQUAL_GROUPS", groups, itemsPerGroup, total, itemLabel,
    additionEquation: `${Array.from({ length: groups }, () => itemsPerGroup).join(" + ")} = ${total}`,
    multiplicationEquation: `${groups} × ${itemsPerGroup} = ${total}`,
  };
  return { promptFacts: { groups, itemsPerGroup, total, additionEquation: fact.additionEquation, multiplicationEquation: fact.multiplicationEquation }, expectedFacts: [fact] };
}

export function planMatchesExpectedFacts(expected: readonly EducationalFact[], actual: readonly EducationalFact[]): boolean {
  if (!expected.length) return true;
  return expected.every((wanted) => actual.some((found) =>
    wanted.kind === "EQUAL_GROUPS" && found.kind === "EQUAL_GROUPS" &&
    wanted.groups === found.groups && wanted.itemsPerGroup === found.itemsPerGroup &&
    wanted.total === found.total && wanted.additionEquation === found.additionEquation &&
    wanted.multiplicationEquation === found.multiplicationEquation));
}
