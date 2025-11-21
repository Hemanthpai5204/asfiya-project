"use client";

import { useState } from "react";

type EvaluationResult = {
  transcription: string;
  accuracy: number;
  phoneme_score: string;
};

export default function UploadBox() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEvaluate() {
    if (!file) {
      setError("Please choose an audio file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = (await res.json()) as EvaluationResult;
      setResult(data);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-slate-200">Upload audio</label>
        <input
          type="file"
          accept="audio/mp3,audio/mpeg,audio/wav"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="file:mr-4 file:rounded-md file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-cyan-400 cursor-pointer bg-slate-800/70 text-sm text-slate-200 rounded-lg border border-slate-700 px-4 py-3"
        />
      </div>

      <button
        onClick={handleEvaluate}
        disabled={!file || loading}
        className="w-full rounded-lg bg-cyan-500 text-white py-3 font-semibold transition hover:bg-cyan-400 disabled:opacity-40"
      >
        {loading ? "Evaluating…" : "Evaluate Audio"}
      </button>

      {loading && (
        <div className="animate-pulse text-center text-slate-400 text-sm">
          Processing on server…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Transcription</p>
          <p className="text-base text-slate-100">{result.transcription || "—"}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400 mt-4">Accuracy</p>
          <p className="text-2xl font-semibold text-cyan-400">{result.accuracy}%</p>
          <p className="text-xs uppercase tracking-wide text-slate-400 mt-4">Phoneme Similarity</p>
          <p className="text-sm text-slate-200 whitespace-pre-line">{result.phoneme_score}</p>
        </div>
      )}
    </section>
  );
}

