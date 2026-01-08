import { MemoryStore } from "../memory/memoryStore.js";
import { getXClient } from "../x/xClient.js";
import { log } from "../logger.js";
import { openai } from "../llm/openaiClient.js";
import { loadPrompt, render } from "../llm/promptLoader.js";

function computeScore(likes: number, reposts: number, replies: number): number {
  return likes + reposts * 2 + replies * 3;
}

export async function runCollectMetrics() {
  const store = new MemoryStore();
  const client = getXClient();
  const recent = store.getRecentPosts(10);

  for (const post of recent) {
    if (!post.tweet_id) continue;

    const tweet = await client.v2.singleTweet(post.tweet_id, { "tweet.fields": ["public_metrics"] });
    const metrics = tweet.data.public_metrics;

    if (!metrics) continue;

    const likes = metrics.like_count || 0;
    const reposts = metrics.retweet_count || 0;
    const replies = metrics.reply_count || 0;
    const score = computeScore(likes, reposts, replies);

    store.updatePostMetrics(post.tweet_id, { likes, reposts, replies, score });

    log("INFO", "Updated metrics", { tweet_id: post.tweet_id, likes, reposts, replies, score });

    const tpl = loadPrompt("self_critique.md");
    const prompt = render(tpl, {
      TWEET_TEXT: post.content,
      LIKES: String(likes),
      REPOSTS: String(reposts),
      REPLIES: String(replies)
    });

    const resp = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return valid JSON only. No extra text." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const raw = resp.choices[0]?.message?.content?.trim() || "{}";

    try {
      const parsed = JSON.parse(raw);
      const successPattern = parsed.success_pattern?.trim();
      const avoidPattern = parsed.avoid_pattern?.trim();

      if (successPattern) store.addPattern("success", successPattern, Math.max(1, Math.floor(score / 3)));
      if (avoidPattern) store.addPattern("avoid", avoidPattern, 1);

      log("INFO", "Updated humor patterns", { successPattern, avoidPattern });
    } catch {
      log("WARN", "Failed to parse self critique JSON", { raw });
    }
  }
}
