import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export type NarrationLanguage = "en" | "hi";

export interface WordCue {
  text: string;
  startMs: number;
  endMs: number;
}

export interface TimedNarration {
  audio: Buffer;
  words: WordCue[];
  durationMs: number;
}

function createClient(): ElevenLabsClient {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }
  return new ElevenLabsClient();
}

export async function listPremadeVoices() {
  const response = await createClient().voices.getAll();
  return response.voices
    .filter((voice) => voice.category === "premade")
    .flatMap((voice) => voice.voiceId ? [{
      id: voice.voiceId,
      name: voice.name ?? "Unnamed voice",
      labels: voice.labels ?? {},
    }] : [])
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function generateTimedNarration(input: {
  text: string;
  voiceId: string;
  language: NarrationLanguage;
  modelId?: string;
}): Promise<TimedNarration> {
  const response = await createClient().textToSpeech.convertWithTimestamps(input.voiceId, {
    text: input.text,
    modelId: input.modelId ?? "eleven_v4",
    languageCode: input.language,
    outputFormat: "mp3_44100_128",
    applyTextNormalization: "on",
    voiceSettings: {
      stability: 0.7,
      similarityBoost: 0.5,
    },
  });

  const alignment = response.normalizedAlignment ?? response.alignment;
  if (!alignment) {
    throw new Error("ElevenLabs returned narration without timestamp alignment");
  }

  const words = toWordCues(
    alignment.characters,
    alignment.characterStartTimesSeconds,
    alignment.characterEndTimesSeconds,
  );
  const durationMs = Math.round((alignment.characterEndTimesSeconds.at(-1) ?? 0) * 1000);

  return {
    audio: Buffer.from(response.audioBase64, "base64"),
    words,
    durationMs,
  };
}

function toWordCues(characters: string[], starts: number[], ends: number[]): WordCue[] {
  const cues: WordCue[] = [];
  let text = "";
  let startIndex = 0;

  const flush = (endIndex: number) => {
    const value = text.trim();
    if (value) {
      cues.push({
        text: value,
        startMs: Math.round((starts[startIndex] ?? 0) * 1000),
        endMs: Math.round((ends[endIndex] ?? starts[startIndex] ?? 0) * 1000),
      });
    }
    text = "";
  };

  characters.forEach((character, index) => {
    if (/\s/u.test(character)) {
      flush(Math.max(startIndex, index - 1));
      startIndex = index + 1;
      return;
    }
    if (!text) startIndex = index;
    text += character;
  });
  flush(Math.max(startIndex, characters.length - 1));
  return cues;
}
