export function clampText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function hasRepeatedPhrases(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/);
  const counts = new Map<string, number>();
  for (const w of words) {
    if (w.length < 4) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
    if ((counts.get(w) || 0) >= 4) return true;
  }
  return false;
}

export function looksLikeSpam(text: string): boolean {
  const lower = text.toLowerCase();
  if (lower.includes("airdrop") && lower.includes("claim") && lower.includes("link")) return true;
  if (lower.includes("free") && lower.includes("dm")) return true;
  if (lower.match(/http(s)?:\/\//)) return true;
  return false;
}
