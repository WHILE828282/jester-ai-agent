// src/config.ts
import path from "node:path";

export const CONFIG = {
  // Глобальные лимиты
  maxTweetChars: 240,
  maxReplyChars: 200,

  // Поведение генерации
  temperature: 1.0,

  // Правила: сколько правил максимум держим активными (на всякий)
  maxRules: 200,
} as const;

export const PATHS = {
  // ВАЖНО: правила только тут
  rulesFile: path.resolve("data", "rules.json"),

  // Память
  memoryFile: path.resolve("data", "memory.json"),

  // Логи голосований/решений (если захочешь)
  governanceDir: path.resolve("data", "governance"),
} as const;
