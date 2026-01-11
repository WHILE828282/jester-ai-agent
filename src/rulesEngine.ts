// src/rulesEngine.ts
import fs from "node:fs";
import path from "node:path";
import { PATHS } from "./config.js";

export type Rule = {
  id: string;           // стабильный id чтобы можно было удалять по id
  text: string;         // текст правила
  enabled: boolean;     // можно отключать без удаления
  createdAt: string;    // ISO
};

export type RulesFile = {
  version: number;
  rules: Rule[];
};

function ensureDir(p: string) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function defaultRules(): RulesFile {
  return {
    version: 1,
    rules: [
      {
        id: "no-apologies",
        text: "Never apologize. No 'sorry', no 'I apologize', no backpedaling.",
        enabled: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "always-ribbit",
        text: "Always end the final line with 'ribbit.'",
        enabled: true,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export function loadRules(): RulesFile {
  ensureDir(PATHS.rulesFile);

  if (!fs.existsSync(PATHS.rulesFile)) {
    const base = defaultRules();
    fs.writeFileSync(PATHS.rulesFile, JSON.stringify(base, null, 2), "utf-8");
    return base;
  }

  const raw = fs.readFileSync(PATHS.rulesFile, "utf-8");
  const parsed = JSON.parse(raw) as RulesFile;

  if (!parsed || !Array.isArray(parsed.rules)) {
    const base = defaultRules();
    fs.writeFileSync(PATHS.rulesFile, JSON.stringify(base, null, 2), "utf-8");
    return base;
  }

  // минимальная нормализация
  parsed.version = typeof parsed.version === "number" ? parsed.version : 1;
  parsed.rules = parsed.rules.map((r: any) => ({
    id: String(r.id ?? ""),
    text: String(r.text ?? ""),
    enabled: Boolean(r.enabled ?? true),
    createdAt: String(r.createdAt ?? new Date().toISOString()),
  })).filter(r => r.id && r.text);

  return parsed;
}

export function saveRules(file: RulesFile) {
  ensureDir(PATHS.rulesFile);
  fs.writeFileSync(PATHS.rulesFile, JSON.stringify(file, null, 2), "utf-8");
}

/**
 * Удаление правила по id (именно удаление).
 */
export function deleteRuleById(id: string): boolean {
  const file = loadRules();
  const before = file.rules.length;
  file.rules = file.rules.filter(r => r.id !== id);
  saveRules(file);
  return file.rules.length !== before;
}

/**
 * Удаление правила по совпадению текста (fallback).
 * Удаляет первое полное совпадение.
 */
export function deleteRuleByTextExact(text: string): boolean {
  const file = loadRules();
  const idx = file.rules.findIndex(r => r.text.trim() === text.trim());
  if (idx === -1) return false;
  file.rules.splice(idx, 1);
  saveRules(file);
  return true;
}

/**
 * Добавление нового правила (для governance).
 */
export function addRule(rule: { id: string; text: string; enabled?: boolean }) {
  const file = loadRules();
  const exists = file.rules.some(r => r.id === rule.id);
  if (exists) return;

  file.rules.push({
    id: rule.id,
    text: rule.text,
    enabled: rule.enabled ?? true,
    createdAt: new Date().toISOString(),
  });

  saveRules(file);
}

/**
 * Готовит блок системных правил для system prompt.
 */
export function buildRulesForSystemPrompt(): string {
  const file = loadRules();
  const enabled = file.rules.filter(r => r.enabled);

  if (enabled.length === 0) return "";

  const lines = enabled.map((r, i) => `${i + 1}. ${r.text}`);
  return `Jester Rules (community-governed):\n${lines.join("\n")}`;
}
