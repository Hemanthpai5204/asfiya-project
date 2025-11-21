import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";
import { parsePhonemes, comparePhonemes, getReferenceText } from "@/utils/phoneme";

export const maxDuration = 30;

type WhisperRunner = (file: string) => Promise<{ text?: string } | { text?: string }[]>;
let whisperPipelinePromise: Promise<WhisperRunner> | null = null;

async function loadWhisperPipeline() {
  if (!whisperPipelinePromise) {
    whisperPipelinePromise = (async () => {
      const { pipeline, env } = await import("@xenova/transformers");
      env.allowLocalModels = true;
      env.localModelPath = path.join(os.tmpdir(), "models");
      const whisper = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en");
      return async (file: string) => whisper(file, { chunk_length_s: 30 });
    })();
  }
  return whisperPipelinePromise;
}

async function transcribeWithWhisperTiny(filePath: string): Promise<string | null> {
  try {
    const pipeline = await loadWhisperPipeline();
    const result = await pipeline(filePath);
    if (Array.isArray(result)) {
      return (result[0]?.text ?? "").trim();
    }
    return (result?.text ?? "").trim();
  } catch (error) {
    console.warn("Whisper pipeline unavailable, using phoneme fallback:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempFilePath = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);
    await writeFile(tempFilePath, buffer);

    let transcription = await transcribeWithWhisperTiny(tempFilePath);
    if (!transcription || transcription.length === 0) {
      transcription = "Audio transcription unavailable; using phoneme-only fallback.";
    }

    await unlink(tempFilePath).catch(() => null);

    const referenceText = getReferenceText();
    const actualPhonemes = parsePhonemes(transcription);
    const comparison = comparePhonemes(actualPhonemes, referenceText);

    return NextResponse.json({
      transcription,
      accuracy: comparison.accuracy,
      phoneme_score: comparison.report,
    });
  } catch (error) {
    console.error("Evaluation API error:", error);
    return NextResponse.json({ error: "Failed to evaluate audio." }, { status: 500 });
  }
}

