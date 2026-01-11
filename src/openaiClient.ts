// src/openaiClient.ts
import OpenAI from "openai";
import { log } from "./logger.js";

function env(name: string, fallback?: string) {
  const v = process.env[name];
  if (v && v.trim().length > 0) return v.trim();
  if (fallback !== undefined) return fallback;
  return "";
}

// ВАЖНО: здесь больше НЕ используется OPENAI_API_KEY.
// Используем только GROQ_API_KEY.
const GROQ_API_KEY = env("GROQ_API_KEY");
if (!GROQ_API_KEY) {
  // Делаем понятную ошибку, чтобы не было “missing OPENAI_API_KEY”
  throw new Error("GROQ_API_KEY is missing. Add it to GitHub Secrets and workflow env.");
}

// Базовый URL Groq OpenAI-compatible API
const baseURL = env("GROQ_BASE_URL", "https://api.groq.com/openai/v1");

// Модель берём из env, иначе дефолт
export const MODEL = env("GROQ_MODEL", "llama-3.3-70b-versatile");

// Это “llm” как раньше — чтобы твой generator.ts НЕ трогать.
export const llm = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL,
});

// Лог для дебага (без ключа)
log("INFO", "LLM client initialized", { provider: "groq", baseURL, model: MODEL });
