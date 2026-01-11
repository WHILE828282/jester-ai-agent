import fs from "node:fs";
import path from "node:path";

export type Rule = {
  id: string;
  title: string;
  text: string;
  active: boolean;
};

export type RulesFile = {
  version: number;
  rules: Rule[];
};

const RULES_PATH = path.join(process.cwd(), "data", "rules.json");

export function loadRules(): RulesFile {
  if (!fs.existsSync(RULES_PATH)) {
    return { version: 1, rules: [] };
  }
  const raw = fs.readFileSync(RULES_PATH, "utf-8");
  return JSON.parse(raw);
}

export function saveRules(rulesFile: RulesFile) {
  fs.mkdirSync(path.dirname(RULES_PATH), { recursive: true });
  fs.writeFileSync(RULES_PATH, JSON.stringify(rulesFile, null, 2), "utf-8");
}

export function getActiveRulesText(): string {
  const rulesFile = loadRules();
  const active = rulesFile.rules.filter(r => r.active);

  if (active.length === 0) return "(no active rules)";

  return active
    .map(r => `- (${r.id}) ${r.title}: ${r.text}`)
    .join("\n");
}
