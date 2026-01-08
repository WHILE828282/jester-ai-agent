import { looksLikeSpam, hasRepeatedPhrases } from "../utils/text.js";
import { CONFIG } from "../config.js";

const politicalKeywords = [
  "election",
  "president",
  "prime minister",
  "democrat",
  "republican",
  "left wing",
  "right wing",
  "ukraine",
  "israel",
  "palestine",
  "war",
  "genocide"
];

const toxicKeywords = [
  "kill",
  "suicide",
  "terrorist"
];

export function validateOutput(text: string) {
  if (!text || text.length < 3) return { ok: false, reason: "empty" };

  if (CONFIG.ENABLE_SPAM_FILTER && looksLikeSpam(text)) {
    return { ok: false, reason: "spam-like content detected" };
  }

  if (hasRepeatedPhrases(text)) {
    return { ok: false, reason: "repetitive output" };
  }

  if (CONFIG.ENABLE_POLITICS_FILTER) {
    const lower = text.toLowerCase();
    for (const kw of politicalKeywords) {
      if (lower.includes(kw)) {
        return { ok: false, reason: `political keyword blocked: ${kw}` };
      }
    }
  }

  if (CONFIG.ENABLE_TOXIC_FILTER) {
    const lower = text.toLowerCase();
    for (const kw of toxicKeywords) {
      if (lower.includes(kw)) {
        return { ok: false, reason: `toxic keyword blocked: ${kw}` };
      }
    }
  }

  return { ok: true, reason: "ok" };
}
