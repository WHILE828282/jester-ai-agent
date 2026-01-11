// src/pollApply.ts
import fs from "node:fs";
import path from "node:path";
import { PATHS } from "./config.js";
import { applyGovernanceWinner } from "./rulesEngine.js";
import { log } from "./logger.js";

export type PollOption = {
  id: number;              // 1..5
  text: string;            // человеко-читаемый текст
  action?: string;         // например: "ADD_RULE:..." или "REMOVE_RULE:..."
};

export type PollSpec = {
  version: number;
  pollId: string;          // идентификатор (timestamp или uuid)
  tweetId?: string;        // id твита-опроса
  createdAt: string;       // ISO
  closesAt: string;        // ISO (через 24ч)
  options: PollOption[];   // 1..5
  status: "open" | "closed";
  winner?: {
    optionId: number;
    action?: string;
    decidedAt: string;
    details?: any;
  };
};

function ensureDir(p: string) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

const POLL_SPEC_FILE = path.resolve("data", "poll.json");

export function loadPollSpec(): PollSpec | null {
  try {
    if (!fs.existsSync(POLL_SPEC_FILE)) return null;
    const raw = fs.readFileSync(POLL_SPEC_FILE, "utf-8");
    return JSON.parse(raw) as PollSpec;
  } catch {
    return null;
  }
}

export function savePollSpec(spec: PollSpec) {
  ensureDir(POLL_SPEC_FILE);
  fs.writeFileSync(POLL_SPEC_FILE, JSON.stringify(spec, null, 2), "utf-8");
}

/**
 * Применяет победившую опцию:
 * - если action начинается с ADD_RULE: -> добавляет правило
 * - если action начинается с REMOVE_RULE: -> отключает правило (enabled=false)
 * Возвращает результат для логов/памяти.
 */
export function applyWinningOption(spec: PollSpec, winnerOptionId: number) {
  const opt = spec.options.find(o => o.id === winnerOptionId);
  if (!opt) {
    return { ok: false, reason: `Option ${winnerOptionId} not found` };
  }

  const action = (opt.action ?? "").trim();
  if (!action) {
    // если нет action — просто сохраняем как winner без изменений
    return { ok: true, action: "NO_ACTION", details: { optionId: winnerOptionId, text: opt.text } };
  }

  const res = applyGovernanceWinner(action);
  return { ok: res.ok, action: res.action ?? "UNKNOWN", details: res.details };
}

/**
 * Закрывает poll: записывает победителя и применяет действие.
 */
export function closeAndApply(spec: PollSpec, winnerOptionId: number) {
  const now = new Date().toISOString();
  const applied = applyWinningOption(spec, winnerOptionId);

  spec.status = "closed";
  spec.winner = {
    optionId: winnerOptionId,
    action: spec.options.find(o => o.id === winnerOptionId)?.action,
    decidedAt: now,
    details: applied,
  };

  savePollSpec(spec);

  log("INFO", "Poll closed & applied", {
    pollId: spec.pollId,
    winnerOptionId,
    applied,
  });

  return applied;
}
