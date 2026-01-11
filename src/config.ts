import path from "node:path";

export type Mode = "daily" | "reply" | "metrics" | "poll" | "agent_fix";

function env(name: string, fallback = ""): string {
  return String(process.env[name] ?? fallback).trim();
}

const ROOT = process.cwd();

// ✅ Все пути централизованы здесь
export const PATHS = {
  root: ROOT,
  dataDir: path.join(ROOT, "data"),
  memoryFile: path.join(ROOT, "data", "memory.json"),
  rulesFile: path.join(ROOT, "data", "rules.json"),
  pollsDir: path.join(ROOT, "data", "polls"),
  governanceDir: path.join(ROOT, "data", "governance"),
};

// ✅ Все настройки централизованы здесь
export const CONFIG = {
  MODE: (env("MODE", "daily") as Mode),

  // LLM (Groq через OpenAI-compatible endpoint)
  GROQ_API_KEY: env("GROQ_API_KEY"),
  GROQ_MODEL: env("GROQ_MODEL", "llama-3.1-8b-instant"),
  GROQ_BASE_URL: env("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),

  // X tokens
  X_APP_KEY: env("X_APP_KEY"),
  X_APP_SECRET: env("X_APP_SECRET"),
  X_ACCESS_TOKEN: env("X_ACCESS_TOKEN"),
  X_ACCESS_SECRET: env("X_ACCESS_SECRET"),

  // Metrics flags
  METRICS_USE_X: env("METRICS_USE_X", "0") === "1",

  // Git (если агент пушит)
  GH_PAT: env("GH_PAT"),
  GITHUB_REPO: env("GITHUB_REPO"), // например "user/repo"
  GITHUB_BRANCH: env("GITHUB_BRANCH", "main"),
} as const;
