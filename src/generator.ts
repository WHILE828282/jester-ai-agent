// src/generator.ts
import { llm, MODEL } from "./openaiClient.js";
import { buildSystemPrompt } from "./rulesEngine.js";
import { CONFIG } from "./config.js";

export async function generateText(prompt: string, opts?: { maxChars?: number }) {
  const system = buildSystemPrompt({ maxChars: opts?.maxChars });

  const resp = await llm.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    temperature: CONFIG.temperature,
  });

  return resp.choices[0]?.message?.content ?? "";
}

export async function generateTweet(args: {
  topic: string;
  context: string;
  successPatterns: any[];
  failPatterns: any[];
  recentPosts: string[];
}) {
  const { topic, context, successPatterns, failPatterns, recentPosts } = args;

  const prompt =
    `Write ONE short rude clever meme-style joke tweet as an American frog mascot for a memecoin.\n` +
    `Topic: ${topic}\n` +
    `Context: ${context}\n` +
    `Avoid: ${failPatterns.map(p => p.text).join(" | ")}\n` +
    `Prefer: ${successPatterns.map(p => p.text).join(" | ")}\n` +
    `Don't repeat: ${recentPosts.join(" || ")}\n` +
    `Max ${CONFIG.maxTweetChars} chars.\n`;

  return generateText(prompt, { maxChars: CONFIG.maxTweetChars });
}

export async function generateReply(args: {
  userText: string;
  lastPost: string;
  successPatterns: any[];
  failPatterns: any[];
}) {
  const { userText, lastPost, successPatterns, failPatterns } = args;

  const prompt =
    `Reply on X as Jester.\n` +
    `User: "${userText}"\n` +
    `Last post: "${lastPost}"\n` +
    `Avoid: ${failPatterns.map(p => p.text).join(" | ")}\n` +
    `Prefer: ${successPatterns.map(p => p.text).join(" | ")}\n` +
    `Reply 1-2 sentences. Max ${CONFIG.maxReplyChars} chars.\n`;

  return generateText(prompt, { maxChars: CONFIG.maxReplyChars });
}
