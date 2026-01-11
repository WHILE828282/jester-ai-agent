import fs from "fs";
import path from "path";
import { loadRules, saveRules, deleteRuleById, disableRuleById } from "./rules.js";
import { CONFIG } from "./config.js";
import { log } from "./logger.js";

export type PollOptionAction =
  | { type: "add_rule"; payload: any }
  | { type: "disable_rule"; ruleId: string }
  | { type: "delete_rule"; ruleId: string }
  | { type: "set_value"; path: string; value: any }
  | { type: "noop" };

export type PollSpec = {
  pollId: string;
  createdAt: number;
  options: {
    num: number; // 1..5
    title: string;
    action: PollOptionAction;
  }[];
};

export function loadPollSpec(): PollSpec {
  const fp = path.resolve(CONFIG.paths.pollSpecFile);
  if (!fs.existsSync(fp)) throw new Error(`Poll spec not found: ${fp}`);
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
}

export function savePollSpec(spec: PollSpec) {
  const fp = path.resolve(CONFIG.paths.pollSpecFile);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(spec, null, 2), "utf-8");
  log("INFO", "Poll spec saved", { file: fp });
}

export function applyWinningOption(winner: number) {
  const spec = loadPollSpec();
  const opt = spec.options.find((o) => o.num === winner);
  if (!opt) throw new Error(`No option found for winner ${winner}`);

  log("INFO", "Applying poll winner", { winner, title: opt.title, action: opt.action });

  const rules = loadRules();

  if (opt.action.type === "add_rule") {
    // payload должен быть Rule-like объект и куда добавлять (required/banned/style/safety)
    const payload = opt.action.payload;
    const bucket = payload.bucket as "required" | "banned" | "style" | "safety";
    if (!bucket || !rules[bucket]) throw new Error("Invalid add_rule payload.bucket");
    const rule = payload.rule;
    if (!rule?.id) throw new Error("Invalid add_rule payload.rule");

    (rules as any)[bucket].push(rule);
    saveRules(rules);
    return { ok: true, applied: `added_rule_${rule.id}` };
  }

  if (opt.action.type === "disable_rule") {
    const ok = disableRuleById(rules, opt.action.ruleId);
    if (!ok) throw new Error(`Rule not found to disable: ${opt.action.ruleId}`);
    saveRules(rules);
    return { ok: true, applied: `disabled_rule_${opt.action.ruleId}` };
  }

  if (opt.action.type === "delete_rule") {
    const ok = deleteRuleById(rules, opt.action.ruleId);
    if (!ok) throw new Error(`Rule not found to delete: ${opt.action.ruleId}`);
    saveRules(rules);
    return { ok: true, applied: `deleted_rule_${opt.action.ruleId}` };
  }

  if (opt.action.type === "set_value") {
    // например maxTweetChars
    // path: "constraints.maxTweetChars"
    const p = opt.action.path.split(".");
    let obj: any = rules;
    for (let i = 0; i < p.length - 1; i++) {
      if (!(p[i] in obj)) obj[p[i]] = {};
      obj = obj[p[i]];
    }
    obj[p[p.length - 1]] = opt.action.value;
    saveRules(rules);
    return { ok: true, applied: `set_${opt.action.path}` };
  }

  return { ok: true, applied: "noop" };
}
