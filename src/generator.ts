import { llm, MODEL } from "./openaiClient.js";
import { buildSystemPrompt } from "./text.js";

export async function generateText(userPrompt: string, extraSystem?: string) {
  const system = buildSystemPrompt(extraSystem);

  const resp = await llm.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userPrompt }
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
Write ONE short rude clever meme-style joke tweet as Jester.
Topic: ${topic}
Context: ${context}

Avoid patterns:
${failPatterns.map(p => `- ${p.text}`).join("\n")}

Prefer patterns:
${successPatterns.map(p => `- ${p.text}`).join("\n")}

Don't repeat these recent posts:
${recentPosts.map(p => `- ${p}`).join("\n")}

Rules:
- Under 240 chars
- 1 tweet only
- End with "ribbit."
`.trim();

  return generateText(prompt, `Task: write a tweet. Topic=${topic}`);
}

export async function generateReply(args: {
  userText: string;
  lastPost: string;
  successPatterns: any[];
  failPatterns: any[];
}) {
  const { userText, lastPost, successPatterns, failPatterns } = args;

  const prompt = `
Reply on X as Jester.

User said: "${userText}"
Last Jester post: "${lastPost}"

Avoid patterns:
${failPatterns.map(p => `- ${p.text}`).join("\n")}

Prefer patterns:
${successPatterns.map(p => `- ${p.text}`).join("\n")}

Rules:
- 1-2 sentences max
- Under 200 chars
- End with "ribbit."
`.trim();

  return generateText(prompt, "Task: reply to a user mention.");
}
