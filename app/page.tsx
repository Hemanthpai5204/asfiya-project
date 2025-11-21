import UploadBox from "@/components/UploadBox";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Audio Accuracy Evaluator</h1>
          <p className="text-slate-300">
            Upload an MP3/WAV file. We transcribe it and estimate phoneme similarity.
          </p>
        </header>
        <UploadBox />
      </div>
    </main>
  );
}

