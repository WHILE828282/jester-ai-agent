// src/pollApply.ts
import fs from "node:fs";
import path from "node:path";
import { PATHS } from "./config.js";
import { deleteRuleById, loadRulesFile, saveRulesFile } from "./rulesEngine.js";
import { log } from "./logger.js";

type PollResult = {
  pollId: string;
  createdAt: string;
  closedAt: string;
  winner: number;                 // 1..5
  winnerText: string;             // описание варианта
  winnerAction: string;           // например "DELETE_RULE:no_apologies"
  tally: Record<string, number>;  // "1": 10, "2": 5 ...
};

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function readJson<T>(p: string): T {
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJson(p: string, obj: any) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf-8");
}

function appendAuditLine(line: string) {
  ensureDir(PATHS.GOVERNANCE_DIR);
  const auditPath = path.join(PATHS.GOVERNANCE_DIR, "audit.log");
  fs.appendFileSync(auditPath, line + "\n", "utf-8");
}

export async function applyLatestPollResult() {
  const resultPath = path.join(PATHS.GOVERNANCE_DIR, "latest_poll_result.json");
  if (!fs.existsSync(resultPath)) {
    log("ERROR", "No latest_poll_result.json found", { resultPath });
    process.exitCode = 1;
    return;
  }

  const res = readJson<PollResult>(resultPath);

  log("INFO", "Applying poll result", {
    pollId: res.pollId,
    winner: res.winner,
    winnerAction: res.winnerAction,
  });

  const action = (res.winnerAction || "").trim();

  if (!action) {
    log("ERROR", "winnerAction is empty", { pollId: res.pollId });
    process.exitCode = 1;
    return;
  }

  // ✅ ТРЕБУЕМОЕ: физическое удаление правила
  if (action.startsWith("DELETE_RULE:")) {
    const ruleId = action.replace("DELETE_RULE:", "").trim();
    if (!ruleId) {
      log("ERROR", "DELETE_RULE missing ruleId", { pollId: res.pollId });
      process.exitCode = 1;
      return;
    }

    // проверим что оно реально есть перед удалением
    const before = loadRulesFile();
    const existed = before.rules.some(r => r.id === ruleId);

    const ok = deleteRuleById(ruleId);
    if (!ok) {
      log("ERROR", "Rule not deleted (not found?)", { ruleId });
      process.exitCode = 1;
      return;
    }

    const after = loadRulesFile();

    const auditLine =
      `[${new Date().toISOString()}] poll=${res.pollId} ACTION=DELETE_RULE id=${ruleId} existed=${existed} rules_before=${before.rules.length} rules_after=${after.rules.length}`;

    appendAuditLine(auditLine);

    // сохраним “применено”
    const appliedPath = path.join(PATHS.GOVERNANCE_DIR, `applied_${res.pollId}.json`);
    writeJson(appliedPath, {
      pollId: res.pollId,
      appliedAt: new Date().toISOString(),
      action,
      ruleId,
      winner: res.winner,
      winnerText: res.winnerText,
      tally: res.tally,
    });

    log("INFO", "✅ Rule deleted", { ruleId });
    return;
  }

  // если действие неизвестное
  log("ERROR", "Unknown winnerAction", { action });
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  applyLatestPollResult();
}
