import OpenAI from "openai";
import { CONFIG } from "./config.js";

export const openai = new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY });

export async function generateText(prompt: string) {
  const resp = await openai.chat.completions.create({
    model: CONFIG.OPENAI_MODEL,
    messages: [
      { role: "system", content: "You are Jester, a rude witty American frog meme token mascot. Always end with 'ribbit.' Keep it under 260 chars." },
      { role: "user", content: prompt }
    ],
    temperature: 1.0,
  });
  return resp.choices[0]?.message?.content ?? "";
}
