// src/rulesEngine.ts
import fs from "node:fs";
import path from "node:path";
import { PATHS, CONFIG } from "./config.js";

export type Rule = {
  id: string;                 // например "no_apologies"
  enabled: boolean;           // true/false
  scope: "system" | "safety" | "style" | "format";
  text: string;               // текст правила
  createdAt?: string;
  updatedAt?: string;
};

type RulesFile = {
  version: number;
  updatedAt: string;
  rules: Rule[];
};

function nowISO() {
  return new Date().toISOString();
}

function safeReadJson(p: string): any | null {
  try {
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ensureDataDir() {
  if (!fs.existsSync(PATHS.DATA_DIR)) fs.mkdirSync(PATHS.DATA_DIR, { recursive: true });
}

function defaultRules(): RulesFile {
  return {
    version: 1,
    updatedAt: nowISO(),
    rules: [
      {
        id: "persona_core",
        enabled: true,
        scope: "system",
        text:
          "You are Jester: a rude witty American frog-jester memecoin mascot. You are savage, shameless, fast, meme-native. Never act like a polite assistant.",
        createdAt: nowISO(),
      },
      {
        id: "end_ribbit",
        enabled: true,
        scope: "format",
        text: "Always end with exactly: ribbit.",
        createdAt: nowISO(),
      },
      {
        id: "no_apologies",
        enabled: true,
        scope: "style",
        text: "Do not apologize. No 'sorry', no 'my bad', no remorse tone.",
        createdAt: nowISO(),
      },
      {
        id: "no_corporate",
        enabled: true,
        scope: "style",
        text: "Avoid corporate/PR tone, avoid disclaimers, avoid 'as an AI'.",
        createdAt: nowISO(),
      },
      {
        id: "safety_basic",
        enabled: true,
        scope: "safety",
        text:
          "No targeting protected classes. No doxxing. No threats. No sexual content involving minors. Avoid explicit violence.",
        createdAt: nowISO(),
      },
      {
        id: "short_snappy",
        enabled: true,
        scope: "style",
        text: "Short punchy sentences. No walls of text.",
        createdAt: nowISO(),
      },
    ],
  };
}

export function loadRulesFile(): RulesFile {
  ensureDataDir();

  // 1) основной файл
  const primary = safeReadJson(PATHS.RULES);
  if (primary?.rules?.length) return primary as RulesFile;

  // 2) fallback если кто-то случайно держит rules в src/
  const fallback = safeReadJson(path.join(PATHS.ROOT, "src", "rules.json"));
  if (fallback?.rules?.length) return fallback as RulesFile;

  // 3) создаём дефолтный data/rules.json
  const def = defaultRules();
  saveRulesFile(def);
  return def;
}

export function saveRulesFile(file: RulesFile) {
  ensureDataDir();
  file.updatedAt = nowISO();
  fs.writeFileSync(PATHS.RULES, JSON.stringify(file, null, 2), "utf-8");
}

export function buildSystemPrompt(extra?: { maxChars?: number }) {
  const rulesFile = loadRulesFile();
  const active = rulesFile.rules.filter(r => r.enabled);

  // ограничиваем активные правила (чтобы не раздувать system prompt)
  const max = CONFIG.RULES_MAX_ACTIVE;
  const clipped = active.slice(0, max);

  const lines: string[] = [];
  lines.push("SYSTEM RULES (obey strictly):");

  for (const r of clipped) {
    lines.push(`- [${r.scope}] ${r.text}`);
  }

  // доп. защита от слишком длинного system prompt
  const joined = lines.join("\n");
  const maxChars = extra?.maxChars ?? 2500;
  return joined.length > maxChars ? joined.slice(0, maxChars) : joined;
}

/**
 * ВАЖНО: это то, что тебе нужно для “удалять правила через голосование”.
 * Твой poll-скрипт/агент может дергать эти мутации:
 *
 * - disableRuleById("no_apologies") -> правило выключено (как “удалено”)
 * - enableRuleById(...)
 * - deleteRuleById(...) -> реально удалит из файла
 */
export function disableRuleById(ruleId: string): boolean {
  const file = loadRulesFile();
  const r = file.rules.find(x => x.id === ruleId);
  if (!r) return false;
  r.enabled = false;
  r.updatedAt = nowISO();
  saveRulesFile(file);
  return true;
}

export function enableRuleById(ruleId: string): boolean {
  const file = loadRulesFile();
  const r = file.rules.find(x => x.id === ruleId);
  if (!r) return false;
  r.enabled = true;
  r.updatedAt = nowISO();
  saveRulesFile(file);
  return true;
}

export function deleteRuleById(ruleId: string): boolean {
  const file = loadRulesFile();
  const before = file.rules.length;
  file.rules = file.rules.filter(x => x.id !== ruleId);
  if (file.rules.length === before) return false;
  saveRulesFile(file);
  return true;
}

export function addRule(rule: Omit<Rule, "createdAt" | "updatedAt">): Rule {
  const file = loadRulesFile();
  const exists = file.rules.some(x => x.id === rule.id);
  if (exists) {
    // если уже есть — просто перезапишем текст/поля
    const r = file.rules.find(x => x.id === rule.id)!;
    r.enabled = rule.enabled;
    r.scope = rule.scope;
    r.text = rule.text;
    r.updatedAt = nowISO();
    saveRulesFile(file);
    return r;
  }
  const full: Rule = { ...rule, createdAt: nowISO(), updatedAt: nowISO() };
  file.rules.push(full);
  saveRulesFile(file);
  return full;
}
