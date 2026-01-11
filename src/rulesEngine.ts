// src/rulesEngine.ts
import fs from "node:fs";
import path from "node:path";
import { PATHS, CONFIG } from "./config.js";

export type Rule = {
  id: string;          // стабильный id
  text: string;        // текст правила
  enabled: boolean;    // включено/выключено
  createdAt: string;   // ISO
};

export type RulesFile = {
  version: number;
  rules: Rule[];
};

function ensureDir(p: string) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function defaultRules(): RulesFile {
  const now = new Date().toISOString();
  return {
    version: 1,
    rules: [
      {
        id: "voice-core",
        enabled: true,
        createdAt: now,
        text:
          "You are Jester, a rude witty American frog meme token mascot. Crude, shameless, disrespectful, relentlessly entertaining.",
      },
      {
        id: "format-short",
        enabled: true,
        createdAt: now,
        text: "Keep it short. No walls of text. No corporate tone. No apologies.",
      },
      {
        id: "end-ribbit",
        enabled: true,
        createdAt: now,
        text: "Always end the final output with exactly: ribbit.",
      },
      {
        id: "safety-basic",
        enabled: true,
        createdAt: now,
        text:
          "Avoid targeting protected classes. Avoid doxxing. Avoid threats of violence. Avoid sexual content involving minors.",
      },
    ],
  };
}

export function loadRules(): RulesFile {
  try {
    if (!fs.existsSync(PATHS.rulesFile)) {
      ensureDir(PATHS.rulesFile);
      const base = defaultRules();
      fs.writeFileSync(PATHS.rulesFile, JSON.stringify(base, null, 2), "utf-8");
      return base;
    }
    const raw = fs.readFileSync(PATHS.rulesFile, "utf-8");
    const parsed = JSON.parse(raw) as RulesFile;
    if (!parsed.rules || !Array.isArray(parsed.rules)) throw new Error("Invalid rules.json structure");
    return parsed;
  } catch (e) {
    // если файл повреждён — восстановим безопасный дефолт, чтобы бот не умер
    ensureDir(PATHS.rulesFile);
    const base = defaultRules();
    fs.writeFileSync(PATHS.rulesFile, JSON.stringify(base, null, 2), "utf-8");
    return base;
  }
}

export function saveRules(file: RulesFile) {
  ensureDir(PATHS.rulesFile);
  // лимит на всякий случай
  if (file.rules.length > CONFIG.maxRules) {
    file.rules = file.rules.slice(0, CONFIG.maxRules);
  }
  fs.writeFileSync(PATHS.rulesFile, JSON.stringify(file, null, 2), "utf-8");
}

export function addRule(text: string, id?: string): Rule {
  const file = loadRules();
  const now = new Date().toISOString();
  const rule: Rule = {
    id: (id ?? `rule-${Math.random().toString(16).slice(2)}-${Date.now()}`),
    text: text.trim(),
    enabled: true,
    createdAt: now,
  };
  file.rules.unshift(rule);
  saveRules(file);
  return rule;
}

/**
 * УДАЛЕНИЕ правила = выключить (enabled=false).
 * Это лучше чем физически удалять, чтобы история была прозрачна.
 */
export function disableRule(ruleId: string): boolean {
  const file = loadRules();
  const r = file.rules.find(x => x.id === ruleId);
  if (!r) return false;
  r.enabled = false;
  saveRules(file);
  return true;
}

export function enableRule(ruleId: string): boolean {
  const file = loadRules();
  const r = file.rules.find(x => x.id === ruleId);
  if (!r) return false;
  r.enabled = true;
  saveRules(file);
  return true;
}

export function buildSystemPrompt(extra?: { maxChars?: number }) {
  const file = loadRules();
  const enabled = file.rules.filter(r => r.enabled).map(r => `- ${r.text}`);
  const maxChars = extra?.maxChars;

  const header = [
    "SYSTEM RULES (must follow):",
    ...enabled,
    maxChars ? `- Hard limit: ${maxChars} characters max.` : "",
  ].filter(Boolean);

  return header.join("\n");
}

/**
 * Для голосования: "сбросить правило" = выключить его по id.
 * Например победитель голосования: REMOVE_RULE:end-ribbit (или любой id)
 */
export function applyGovernanceWinner(winner: string): { ok: boolean; action?: string; details?: any } {
  const w = winner.trim();

  // Формат удаления
  // REMOVE_RULE:<id>
  if (w.toUpperCase().startsWith("REMOVE_RULE:")) {
    const id = w.split(":").slice(1).join(":").trim();
    const ok = disableRule(id);
    return { ok, action: "REMOVE_RULE", details: { id } };
  }

  // Формат добавления правила
  // ADD_RULE:<text>
  if (w.toUpperCase().startsWith("ADD_RULE:")) {
    const text = w.split(":").slice(1).join(":").trim();
    if (!text) return { ok: false };
    const rule = addRule(text);
    return { ok: true, action: "ADD_RULE", details: { rule } };
  }

  return { ok: false };
}
