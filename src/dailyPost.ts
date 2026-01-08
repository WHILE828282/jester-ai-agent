import { MemoryStore } from "./memoryStore.js";
import { generateTweet } from "./generator.js";
import { validateOutput, finalizeTweet } from "./guardrails.js";
import { postTweet } from "./poster.js";
import { log } from "./logger.js";
import { normalizeWhitespace } from "./text.js";

function pickTopic(): { topic: string; context: string } {
  const topics = [
    { topic: "crypto market mood", context: "Write a joke about traders overreacting to small price moves." },
    { topic: "pump.fun chaos", context: "Write a joke about memecoin launches and the circus vibe." },
    { topic: "chart addiction", context: "Write a joke about people staring at charts 24/7 like it’s their job." },
    { topic: "diamond hands pain", context: "Write a joke about holding through dips and calling it 'strategy'." }
  ];
  return topics[Math.floor(Math.random() * topics.length)];
}

export async function runDailyPost() {
  const store = new MemoryStore();
  const recent = store.getRecentPosts(15).map((p) => p.content);

  const successPatterns = store.getPatterns("success", 10);
  const failPatterns = store.getPatterns("avoid", 10);

  const { topic, context } = pickTopic();

  log("INFO", "Generating daily post", { topic });

  for (let attempt = 1; attempt <= 4; attempt++) {
    const raw = await generateTweet({
      topic,
      context,
      successPatterns,
      failPatterns,
      recentPosts: recent
    });

    const tweet = finalizeTweet(normalizeWhitespace(raw));
    const check = validateOutput(tweet);

    if (!check.ok) {
      log("WARN", "Generated tweet rejected by guardrails", { attempt, reason: check.reason, tweet });
      continue;
    }

    const tweetId = await postTweet(tweet);

    store.addPost({
      tweet_id: tweetId,
      content: tweet,
      topic,
      context
    });

    return;
  }

  log("ERROR", "Failed to generate a safe tweet after multiple attempts");
}
