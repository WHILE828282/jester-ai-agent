import { llm, MODEL } from "./openaiClient.js";
export async function generateText(prompt: string) {
  const resp = await llm.chat.completions.create({
    model: MODEL,
    messages: [
      { role:"system", content:"You are Jester, a rude witty American frog meme token mascot. Always end with 'ribbit.' Keep it under 260 chars." },
      { role:"user", content: prompt }
    ],
    temperature: 1.0
  });
  return resp.choices[0]?.message?.content ?? "";
}
export async function generateTweet(args:{ topic:string; context:string; successPatterns:any[]; failPatterns:any[]; recentPosts:string[]; }) {
  const { topic, context, successPatterns, failPatterns, recentPosts } = args;
  const prompt = `Write ONE short rude clever meme-style joke tweet as an American frog mascot for a memecoin.
Topic: ${topic}
Context: ${context}
Avoid: ${failPatterns.map(p=>p.text).join(" | ")}
Prefer: ${successPatterns.map(p=>p.text).join(" | ")}
Don't repeat: ${recentPosts.join(" || ")}
End with "ribbit." Max 240 chars.`;
  return generateText(prompt);
}
export async function generateReply(args:{ userText:string; lastPost:string; successPatterns:any[]; failPatterns:any[]; }) {
  const { userText, lastPost, successPatterns, failPatterns } = args;
  const prompt = `You are replying on X as a rude witty American frog called Jester.
User: "${userText}"
Last post: "${lastPost}"
Avoid: ${failPatterns.map(p=>p.text).join(" | ")}
Prefer: ${successPatterns.map(p=>p.text).join(" | ")}
Reply 1-2 sentences, under 200 chars. End with "ribbit."`;
  return generateText(prompt);
}
