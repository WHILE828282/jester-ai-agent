import { groq } from "./groqClient.js";
import { CONFIG } from "./config.js";
import { buildSystemPrompt } from "./guardrails.js";

export async function generateText(prompt: string, kind: "tweet" | "reply" = "tweet") {
  const system = buildSystemPrompt(kind);

  const resp = await groq.chat.completions.create({
    model: CONFIG.groq.model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ],
    temperature: CONFIG.groq.temperature,
    max_tokens: CONFIG.groq.maxTokens
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

  const prompt = `
Write ONE short rude clever meme-style joke tweet.
Topic: ${topic}
Context: ${context}

Avoid patterns:
${failPatterns.map((p) => `- ${p.text}`).join("\n")}

Prefer patterns:
${successPatterns.map((p) => `- ${p.text}`).join("\n")}

Do not repeat:
${recentPosts.slice(0, 10).join(" || ")}

Return ONLY the tweet text.
  `.trim();

  return generateText(prompt, "tweet");
}

export async function generateReply(args: {
  userText: string;
  lastPost: string;
  successPatterns: any[];
  failPatterns: any[];
}) {
  const { userText, lastPost, successPatterns, failPatterns } = args;

  const prompt = `
Reply to this user on X in the same voice.
User: "${userText}"
Last post: "${lastPost}"

Avoid patterns:
${failPatterns.map((p) => `- ${p.text}`).join("\n")}

Prefer patterns:
${successPatterns.map((p) => `- ${p.text}`).join("\n")}

Return ONLY the reply text.
  `.trim();

  return generateText(prompt, "reply");
}
