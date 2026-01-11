import fs from "fs";
import path from "path";

const RULES_PATH = path.join(process.cwd(), "src/governance/rules.json");

export type Rule = {
  id: string;
  text: string;
  enabled: boolean;
};

export function loadRules(): Rule[] {
  if (!fs.existsSync(RULES_PATH)) return [];
  const raw = fs.readFileSync(RULES_PATH, "utf-8");
  const json = JSON.parse(raw);
  return json.rules ?? [];
}

export function saveRules(rules: Rule[]) {
  fs.writeFileSync(RULES_PATH, JSON.stringify({ rules }, null, 2), "utf-8");
}

export function getEnabledRules(): Rule[] {
  return loadRules().filter(r => r.enabled);
}

export function addRule(id: string, text: string) {
  const rules = loadRules();

  // если уже есть правило с таким id — просто включаем + обновляем текст
  const existing = rules.find(r => r.id === id);
  if (existing) {
    existing.text = text;
    existing.enabled = true;
    saveRules(rules);
    return;
  }

  rules.push({ id, text, enabled: true });
  saveRules(rules);
}

export function disableRule(id: string) {
  const rules = loadRules();
  const rule = rules.find(r => r.id === id);
  if (!rule) return false;
  rule.enabled = false;
  saveRules(rules);
  return true;
}

export function enableRule(id: string) {
  const rules = loadRules();
  const rule = rules.find(r => r.id === id);
  if (!rule) return false;
  rule.enabled = true;
  saveRules(rules);
  return true;
}

export function removeRule(id: string) {
  const rules = loadRules();
  const before = rules.length;
  const filtered = rules.filter(r => r.id !== id);
  saveRules(filtered);
  return filtered.length !== before;
}
