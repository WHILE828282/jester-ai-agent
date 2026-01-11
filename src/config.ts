// src/config.ts
import "dotenv/config";
import { join } from "node:path";

export type Mode = "daily" | "reply" | "metrics" | "poll" | "agent_fix";

const ROOT = process.cwd();
const DATA_DIR = join(ROOT, "data");

// ✅ Единый источник правды для путей
export const PATHS = {
  ROOT,
  DATA_DIR,

  MEMORY_FILE: join(DATA_DIR, "memory.json"),

  // ✅ правила теперь строго лежат в data/rules.json
  RULES_FILE: join(DATA_DIR, "rules.json"),

  // ✅ сюда можно складывать poll состояние/результаты
  POLL_SPEC_FILE: join(DATA_DIR, "pollSpec.json"),

  // ✅ лог победителя/результатов (если хочешь)
  GOVERNANCE_DIR: join(DATA_DIR, "governance"),
};

// helpers
function env(name: string, fallback?: string) {
  const v = process.env[name];
  if (v === undefined || v === null || v === "") return fallback;
  return v;
}

function envInt(name: string, fallback: number) {
  const v = env(name);
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

// ✅ Центральный конфиг (импортируется везде)
export const CONFIG = {
  mode: (env("MODE", "daily") as Mode),

  llm: {
    provider: (env("LLM_PROVIDER", "groq") as "groq" | "openai"),
    baseURL: env("LLM_BASE_URL", "https://api.groq.com/openai/v1")!,
    apiKey: env("GROQ_API_KEY") || env("LLM_API_KEY") || "",
    model: env("GROQ_MODEL", "llama-3.1-8b-instant")!,
    temperature: Number(env("LLM_TEMPERATURE", "1.0")),
  },

  x: {
    appKey: env("X_APP_KEY", "")!,
    appSecret: env("X_APP_SECRET", "")!,
    accessToken: env("X_ACCESS_TOKEN", "")!,
    accessSecret: env("X_ACCESS_SECRET", "")!,
  },

  paths: {
    memoryFile: env("MEMORY_FILE", PATHS.MEMORY_FILE)!,
    rulesFile: env("RULES_FILE", PATHS.RULES_FILE)!,
    pollSpecFile: env("POLL_SPEC_FILE", PATHS.POLL_SPEC_FILE)!,
    governanceDir: env("GOVERNANCE_DIR", PATHS.GOVERNANCE_DIR)!,
  },

  rules: {
    // ✅ вот это поле у тебя и падало как undefined
    rulesFile: env("RULES_FILE", PATHS.RULES_FILE)!,

    // на будущее — если захочешь добавить лимиты/режимы правил
    maxRules: envInt("RULES_MAX", 200),
  },

  poll: {
    // окно голосования (у тебя 24 часа)
    windowHours: envInt("POLL_WINDOW_HOURS", 24),

    // варианты 1..5
    minOption: envInt("POLL_MIN_OPTION", 1),
    maxOption: envInt("POLL_MAX_OPTION", 5),
  },
};
