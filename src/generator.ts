import { generateText } from "./openaiClient.js";

export async function generateTweet(args: {
  topic: string;
  context: string;
  successPatterns: any[];
  failPatterns: any[];
  recentPosts: string[];
}) {
  const { topic, context, successPatterns, failPatterns, recentPosts } = args;
  const prompt = `
Write ONE short rude clever meme-style joke tweet as an American frog mascot for a memecoin.
Topic: ${topic}
Context: ${context}

Avoid these patterns: ${failPatterns.map(p => p.text).join(" | ")}
Prefer these patterns: ${successPatterns.map(p => p.text).join(" | ")}

Don't repeat recent posts: ${recentPosts.join(" || ")}

End with "ribbit."
Max 240 chars.
`;
  return generateText(prompt);
}

export async function generateReply(args: {
  userText: string;
  lastPost: string;
  successPatterns: any[];
  failPatterns: any[];
}) {
  const { userText, lastPost, successPatterns, failPatterns } = args;
  const prompt = `
You are replying on X as a rude witty American frog called Jester.
User said: "${userText}"
Your last post: "${lastPost}"

Avoid: ${failPatterns.map(p => p.text).join(" | ")}
Prefer: ${successPatterns.map(p => p.text).join(" | ")}

Reply with 1-2 sentences, edgy, funny, under 200 chars. End with "ribbit."
`;
  return generateText(prompt);
}
