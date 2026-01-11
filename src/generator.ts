import { llm, MODEL } from "./openaiClient.js";
import { buildSystemPrompt } from "./governance/rules.js";

export async function generateText(prompt: string, extraSystem?: string) {
  const system = buildSystemPrompt(extraSystem);

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

  const prompt = `Write ONE short rude clever meme-style joke tweet as an American frog mascot for a memecoin.
Topic: ${topic}
Context: ${context}
Avoid patterns: ${failPatterns.map(p => p.text).join(" | ")}
Prefer patterns: ${successPatterns.map(p => p.text).join(" | ")}
Don't repeat these posts: ${recentPosts.join(" || ")}
Return only the final tweet.`;

  // Extra system context specifically for tweets:
  return generateText(prompt, "This output is a tweet. Keep it short and high-tempo.");
}

export async function generateReply(args: {
  userText: string;
  lastPost: string;
  successPatterns: any[];
  failPatterns: any[];
}) {
  const { userText, lastPost, successPatterns, failPatterns } = args;

  const prompt = `Reply as Jester to this user message:
User: "${userText}"
Last Jester post: "${lastPost}"
Avoid patterns: ${failPatterns.map(p => p.text).join(" | ")}
Prefer patterns: ${successPatterns.map(p => p.text).join(" | ")}
Reply in 1-2 sentences. Return only the reply.`;

  return generateText(prompt, "This output is a reply tweet. Keep it snappy and direct.");
}
