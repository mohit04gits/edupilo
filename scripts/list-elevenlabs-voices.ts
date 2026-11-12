import { listPremadeVoices } from "../src/providers/elevenlabs";

async function main() {
  const voices = await listPremadeVoices();

  if (voices.length === 0) {
    throw new Error("No premade voices are available to this ElevenLabs account");
  }

  console.table(
    voices.map((voice) => ({
      name: voice.name,
      voiceId: voice.id,
      language: voice.labels.language ?? "multilingual",
      accent: voice.labels.accent ?? "unspecified",
      gender: voice.labels.gender ?? "unspecified",
      useCase: voice.labels.use_case ?? "unspecified",
    })),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "ElevenLabs voice lookup failed");
  process.exitCode = 1;
});
