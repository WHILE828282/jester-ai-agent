import { openai } from "./openaiClient.js";
import { loadPrompt, render } from "./promptLoader.js";
import { CONFIG } from "../config.js";

export async function generateTweet(input: {
  topic: string;
  context: string;
  successPatterns: string[];
  failPatterns: string[];
  recentPosts: string[];
}): Promise<string> {
  const system = loadPrompt("system.md");
  const tpl = loadPrompt("daily_post.md");

  const prompt = render(tpl, {
    TOPIC: input.topic,
    CONTEXT: input.context,
    SUCCESS_PATTERNS: input.successPatterns.join(" | "),
    FAIL_PATTERNS: input.failPatterns.join(" | "),
    RECENT_POSTS: input.recentPosts.join(" || ")
  });

  const resp = await openai.chat.completions.create({
    model: CONFIG.OPENAI_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ],
    temperature: 0.9
  });

  return resp.choices[0]?.message?.content?.trim() || "";
}

export async function generateReply(input: {
  userText: string;
  lastPost: string;
  successPatterns: string[];
  failPatterns: string[];
}): Promise<string> {
  const system = loadPrompt("system.md");
  const tpl = loadPrompt("reply.md");

  const prompt = render(tpl, {
    USER_TEXT: input.userText,
    LAST_POST: input.lastPost,
    SUCCESS_PATTERNS: input.successPatterns.join(" | "),
    FAIL_PATTERNS: input.failPatterns.join(" | ")
  });

  const resp = await openai.chat.completions.create({
    model: CONFIG.OPENAI_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ],
    temperature: 0.9
  });

  return resp.choices[0]?.message?.content?.trim() || "";
}
