import OpenAI from "openai";
import { CONFIG } from "./config.js";
export const llm = new OpenAI({ apiKey: CONFIG.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
export const MODEL = CONFIG.GROQ_MODEL;
