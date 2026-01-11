import { llm, MODEL } from "./openaiClient.js";
import { buildSystemPrompt } from "./rulesEngine.js";

export async function generateText(prompt: string, mode: "tweet" | "reply") {
  const system = buildSystemPrompt(mode);

  const resp = await llm.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ],
    temperature: 1.0
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
${failPatterns.map((p) => p.text).join(" | ")}

Prefer patterns:
${successPatterns.map((p) => p.text).join(" | ")}

Do not repeat:
${recentPosts.join(" || ")}
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
Reply to the user on X.

User text:
"${userText}"

Last post:
"${lastPost}"

Avoid patterns:
${failPatterns.map((p) => p.text).join(" | ")}

Prefer patterns:
${successPatterns.map((p) => p.text).join(" | ")}
`.trim();

  return generateText(prompt, "reply");
}
