const PHONEME_MAP: Record<string, string> = {
  a: "AH",
  b: "B",
  c: "K",
  d: "D",
  e: "EH",
  f: "F",
  g: "G",
  h: "HH",
  i: "IH",
  j: "JH",
  k: "K",
  l: "L",
  m: "M",
  n: "N",
  o: "OH",
  p: "P",
  q: "K",
  r: "R",
  s: "S",
  t: "T",
  u: "UH",
  v: "V",
  w: "W",
  x: "KS",
  y: "Y",
  z: "Z",
};

const DEFAULT_REFERENCE = "hello world";

export function getReferenceText(): string {
  return process.env.REFERENCE_TEXT?.trim() || DEFAULT_REFERENCE;
}

export function parsePhonemes(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word) => word.split("").map((char) => PHONEME_MAP[char] ?? char.toUpperCase()));
}

export function comparePhonemes(actual: string[], referenceText: string) {
  const reference = parsePhonemes(referenceText);
  if (reference.length === 0) {
    return { accuracy: 0, report: "No reference phonemes configured." };
  }

  const comparisons = Math.min(actual.length, reference.length);
  let matches = 0;

  for (let i = 0; i < comparisons; i += 1) {
    if (actual[i] === reference[i]) {
      matches += 1;
    }
  }

  const accuracy = Math.round((matches / reference.length) * 100);
  const reportLines = [
    `Reference phrase: "${referenceText}"`,
    `Detected phonemes: ${actual.length}`,
    `Reference phonemes: ${reference.length}`,
    `Matches: ${matches}/${reference.length}`,
  ];

  if (actual.length === 0) {
    reportLines.push("No phonemes detected in audio transcription.");
  } else if (comparisons < reference.length) {
    reportLines.push("Transcription is shorter than reference phrase.");
  }

  return {
    accuracy: Math.max(0, Math.min(100, accuracy)),
    report: reportLines.join("\n"),
  };
}

