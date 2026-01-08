import { ensureRibbit } from "./text.js";
export function validateOutput(text: string): { ok: true } | { ok: false; reason: string } {
  const t = text.trim();
  if (!t) return { ok: false, reason: "empty" };
  if (t.length > 280) return { ok: false, reason: "too_long" };
  if (/\b(kill|murder|rape)\b/i.test(t)) return { ok: false, reason: "disallowed_content" };
  return { ok: true };
}
export function finalizeTweet(text: string) { return ensureRibbit(text); }
