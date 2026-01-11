// src/generator.ts
import { llm, MODEL } from "./openaiClient.js";
import { CONFIG } from "./config.js";
import { buildSystemPrompt } from "./rulesEngine.js";

export async function generateText(prompt: string) {
  const system = buildSystemPrompt();

  const resp = await llm.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    temperature: CONFIG.TEMPERATURE,
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
    `Avoid patterns: ${failPatterns.map((p) => p.text).join(" | ")}\n` +
    `Prefer patterns: ${successPatterns.map((p) => p.text).join(" | ")}\n` +
    `Don't repeat: ${recentPosts.join(" || ")}\n` +
    `Constraints: max ${CONFIG.MAX_TWEET_CHARS} chars. End with "ribbit."`;

  return generateText(prompt);
}

export async function generateReply(args: {
  userText: string;
  lastPost: string;
  successPatterns: any[];
  failPatterns: any[];
}) {
  const { userText, lastPost, successPatterns, failPatterns } = args;

  const prompt =
    `Reply on X as Jester (rude witty American frog).\n` +
    `User: "${userText}"\n` +
    `Last post: "${lastPost}"\n` +
    `Avoid patterns: ${failPatterns.map((p) => p.text).join(" | ")}\n` +
    `Prefer patterns: ${successPatterns.map((p) => p.text).join(" | ")}\n` +
    `Constraints: 1-2 sentences, under ${CONFIG.MAX_REPLY_CHARS} chars. End with "ribbit."`;

  return generateText(prompt);
}
