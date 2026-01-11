// src/config.ts
import "dotenv/config";
import path from "node:path";

const ROOT = process.cwd();

function env(name: string, fallback = ""): string {
  const v = process.env[name];
  return (v && v.trim().length > 0) ? v.trim() : fallback;
}

function envInt(name: string, fallback: number): number {
  const v = env(name, "");
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export const PATHS = {
  ROOT,
  DATA_DIR: path.join(ROOT, "data"),
  MEMORY: path.join(ROOT, "data", "memory.json"),
  RULES: path.join(ROOT, "data", "rules.json"),
  GOVERNANCE_DIR: path.join(ROOT, "data", "governance"),
};

export const CONFIG = {
  MODE: env("MODE", "daily"),

  // Groq via OpenAI-compatible SDK (у тебя так и было)
  GROQ_API_KEY: env("GROQ_API_KEY"),
  GROQ_MODEL: env("GROQ_MODEL", "llama-3.3-70b-versatile"),

  // X keys
  X_APP_KEY: env("X_APP_KEY"),
  X_APP_SECRET: env("X_APP_SECRET"),
  X_ACCESS_TOKEN: env("X_ACCESS_TOKEN"),
  X_ACCESS_SECRET: env("X_ACCESS_SECRET"),

  // generation limits
  MAX_TWEET_CHARS: envInt("MAX_TWEET_CHARS", 260),
  MAX_REPLY_CHARS: envInt("MAX_REPLY_CHARS", 200),
  TEMPERATURE: Number(env("TEMPERATURE", "1.0")),

  // memory tuning
  MAX_POSTS_IN_MEMORY: envInt("MAX_POSTS_IN_MEMORY", 200),
  MAX_PATTERNS_IN_MEMORY: envInt("MAX_PATTERNS_IN_MEMORY", 300),

  // rules
  RULES_MAX_ACTIVE: envInt("RULES_MAX_ACTIVE", 40),
};
