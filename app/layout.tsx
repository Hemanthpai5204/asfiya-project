import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Audio Accuracy Evaluator",
  description: "Upload audio, get transcription and phoneme accuracy instantly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

