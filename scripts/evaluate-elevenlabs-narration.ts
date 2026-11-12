import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generateTimedNarration, type NarrationLanguage } from "../src/providers/elevenlabs";

const samples: Array<{
  language: NarrationLanguage;
  voice: string;
  voiceId: string;
  text: string;
}> = [
  {
    language: "en",
    voice: "George",
    voiceId: "JBFqnCBsd6RMkjVDRZzb",
    text: "Ria Rabbit has six crunchy carrots! She places three baskets in a row. Two carrots go into each basket. Two plus two plus two makes six. Three groups of two make six. That's multiplication!",
  },
  {
    language: "hi",
    voice: "Bella",
    voiceId: "hpp4J3VqNfWAUOO0d1Us",
    text: "रिया खरगोश के पास छह कुरकुरी गाजरें हैं! वह तीन टोकरियाँ एक पंक्ति में रखती है। हर टोकरी में दो गाजरें जाती हैं। दो जोड़ दो जोड़ दो बराबर छह। दो के तीन समूह छह होते हैं। यही गुणा है!",
  },
];

async function main() {
  const outputDir = join(process.cwd(), "output", "elevenlabs");
  await mkdir(outputDir, { recursive: true });

  for (const sample of samples) {
    const startedAt = performance.now();
    const result = await generateTimedNarration(sample);
    const latencyMs = Math.round(performance.now() - startedAt);
    const baseName = `rabbit-carrots-${sample.language}-${sample.voice.toLowerCase()}`;

    await writeFile(join(outputDir, `${baseName}.mp3`), result.audio);
    await writeFile(join(outputDir, `${baseName}.timing.json`), JSON.stringify({
      language: sample.language,
      voice: sample.voice,
      voiceId: sample.voiceId,
      modelId: "eleven_v4",
      text: sample.text,
      characterCount: sample.text.length,
      durationMs: result.durationMs,
      latencyMs,
      words: result.words,
    }, null, 2));

    console.log(`${sample.language.toUpperCase()} · ${sample.voice}: ${result.durationMs} ms audio, ${latencyMs} ms request, ${result.words.length} timed words`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Narration evaluation failed");
  process.exitCode = 1;
});
