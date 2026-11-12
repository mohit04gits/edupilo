/**
 * Deterministic topic → illustration theme for the concept preview.
 * Uses project-owned reusable artwork only (PROD-006); no generated images.
 */
export const CONCEPT_THEMES = [
  "SPACE",
  "WEATHER",
  "HYGIENE",
  "PLANTS",
  "ANIMALS",
  "WATER",
  "LETTERS",
  "MATHS",
  "DEFAULT",
] as const;
export type ConceptTheme = (typeof CONCEPT_THEMES)[number];

// Order matters: the first match wins (e.g. "rain" is weather before water).
const RULES: readonly [Exclude<ConceptTheme, "DEFAULT">, RegExp][] = [
  ["SPACE", /\b(moon|stars?|planets?|space|astronaut|rocket|solar|night sky)\b|चाँद|चांद|चंद्र|तारे|ग्रह|अंतरिक्ष/i],
  ["WEATHER", /\b(rain|rainy|clouds?|weather|seasons?|wind|snow|thunder|lightning|rainbow)\b|बारिश|बादल|मौसम|ठंड|गर्मी|बिजली/i],
  ["HYGIENE", /\b(wash|washing|hands?|teeth|tooth|brush|clean|soap|germs?|healthy|bath)\b|हाथ|दाँत|दांत|साबुन|सफ़ाई|सफाई|नहा/i],
  ["PLANTS", /\b(plants?|trees?|seeds?|flowers?|leaf|leaves|grow|garden)\b|पौध|पेड़|बीज|फूल|पत्त/i],
  ["LETTERS", /\b(letters?|words?|rhym\w*|alphabet|phonics?|spell\w*|vowels?)\b|अक्षर|शब्द|कविता|वर्णमाला/i],
  ["ANIMALS", /\b(animals?|dogs?|cats?|birds?|cows?|lions?|elephants?|fish|insects?|butterfl\w*)\b|जानवर|पशु|पक्षी|कुत्त|बिल्ली|गाय|हाथी|तितली/i],
  ["WATER", /\b(water|ocean|sea|river|float|sink)\b|पानी|समुद्र|नदी/i],
  ["MATHS", /\d|[×÷+]|\b(add\w*|plus|subtract\w*|minus|multipl\w*|divid\w*|count\w*|numbers?|shapes?|fractions?|groups?|half|equal)\b|गिन|जोड़|घटा|गुणा|संख्या|आकार/i],
];

export function conceptTheme(...texts: (string | undefined | null)[]): ConceptTheme {
  const text = texts.filter(Boolean).join(" ");
  return RULES.find(([, pattern]) => pattern.test(text))?.[0] ?? "DEFAULT";
}
