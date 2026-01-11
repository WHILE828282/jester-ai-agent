// src/rulesEngine.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type RulesFile = {
  version?: number;
  updatedAt?: string;
  system?: {
    persona?: string;
    hardRules?: string[];
    softRules?: string[];
    bannedWords?: string[];
  };
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function tryReadJson(p: string): any | null {
  try {
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * We support BOTH locations because you said you have both:
 * - data/rules.json (recommended)
 * - src/rules.json  (fallback)
 */
export function loadRulesFile(): RulesFile {
  const candidates = [
    path.resolve(__dirname, "..", "data", "rules.json"),
    path.resolve(__dirname, "rules.json"),
  ];

  for (const p of candidates) {
    const j = tryReadJson(p);
    if (j && typeof j === "object") return j as RulesFile;
  }

  // Safe defaults (no crash even if file missing)
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    system: {
      persona:
        "You are Jester, a rude witty American frog meme token mascot. Short, savage, meme-native. Always end with 'ribbit.'",
      hardRules: [
        "Keep output under 260 characters.",
        "No walls of text. 1–2 sentences max.",
        "Do not reveal you are an AI.",
        "Never output secrets, tokens, or private data.",
        "Always end with: ribbit.",
      ],
      softRules: [
        "Keep it fast, punchy, and timeline-native.",
        "Avoid corporate tone and disclaimers.",
      ],
      bannedWords: [],
    },
  };
}

/**
 * Named export REQUIRED by your generator.ts import:
 *   import { buildSystemPrompt } from "./rulesEngine.js";
 */
export function buildSystemPrompt(extra?: { mode?: "tweet" | "reply"; }): string {
  const rules = loadRulesFile();
  const sys = rules.system ?? {};

  const persona =
    (sys.persona && String(sys.persona).trim()) ||
    "You are Jester, a rude witty American frog meme token mascot. Always end with 'ribbit.'";

  const hard = Array.isArray(sys.hardRules) ? sys.hardRules : [];
  const soft = Array.isArray(sys.softRules) ? sys.softRules : [];
  const banned = Array.isArray(sys.bannedWords) ? sys.bannedWords : [];

  const modeHint =
    extra?.mode === "reply"
      ? "You are replying on X. Keep it 1–2 sentences. Under 200 chars if possible."
      : "You are writing a single X post. Under 240 chars if possible.";

  const lines: string[] = [];
  lines.push(persona);
  lines.push(modeHint);

  if (hard.length) {
    lines.push("");
    lines.push("HARD RULES:");
    for (const r of hard) lines.push(`- ${r}`);
  }

  if (soft.length) {
    lines.push("");
    lines.push("SOFT RULES:");
    for (const r of soft) lines.push(`- ${r}`);
  }

  if (banned.length) {
    lines.push("");
    lines.push("BANNED WORDS/PHRASES (must not appear):");
    lines.push(banned.map((x) => String(x)).join(", "));
  }

  return lines.join("\n");
}
