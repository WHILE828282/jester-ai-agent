import fs from "node:fs";
import path from "node:path";

export function loadPrompt(fileName: string): string {
  const p = path.join(process.cwd(), "prompts", fileName);
  return fs.readFileSync(p, "utf-8");
}

export function render(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, v);
  }
  return out;
}
