import { MemoryStore } from "./memoryStore.js";
import { generateTweet } from "./generator.js";
import { validateOutput, finalizeTweet } from "./guardrails.js";
import { postTweet } from "./poster.js";
import { log } from "./logger.js";
import { normalizeWhitespace, ensureRibbit } from "./text.js";

function pickTopic() {
  const topics = [
    {
      topic: "crypto market mood",
      context: "Make a joke about traders losing their mind over tiny price moves."
    },
    {
      topic: "pump.fun chaos",
      context: "Make a joke about pump.fun launches being pure circus energy."
    },
    {
      topic: "chart addiction",
      context: "Make a joke about staring at charts 24/7 like it's a life purpose."
    },
    {
      topic: "diamond hands pain",
      context: "Make a joke about holding bags through dumps and calling it 'strategy'."
    },
    {
      topic: "CTO community drama",
      context: "Make a joke about community governance wars and 'who's really in charge'."
    },
    {
      topic: "memecoin delusion",
      context: "Make a joke about people thinking their coin will change history."
    }
  ];

  return topics[Math.floor(Math.random() * topics.length)];
}

export async function runDailyPost() {
  const store = new MemoryStore();

  const recentPosts = store.getRecentPosts(15).map(p => p.content);
  const successPatterns = store.getPatterns("success", 10);
  const failPatterns = store.getPatterns("avoid", 10);

  const { topic, context } = pickTopic();

  log("INFO", "Generating daily post", { topic });

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const raw = await generateTweet({
        topic,
        context,
        successPatterns,
        failPatterns,
        recentPosts
      });

      // Normalize whitespace
      let tweet = normalizeWhitespace(raw);

      // Ensure ribbit.
      tweet = ensureRibbit(tweet);

      // finalizeTweet likely handles extra trimming / punctuation cleanup
      tweet = finalizeTweet(tweet);

      // Extra protection: hard limit
      if (tweet.length > 260) {
        tweet = tweet.slice(0, 257).trimEnd() + "...";
        tweet = ensureRibbit(tweet);
      }

      // Validate guardrails
      const check = validateOutput(tweet);
      if (!check.ok) {
        log("WARN", "Generated tweet rejected", {
          attempt,
          reason: check.reason,
          tweet
        });
        continue;
      }

      // Post to X
      const tweetId = await postTweet(tweet);

      // Save in memory
      store.addPost({
        tweet_id: tweetId,
        content: tweet,
        topic,
        context
      });

      log("INFO", "Daily post published", {
        tweetId,
        length: tweet.length
      });

      return;
    } catch (err: any) {
      log("ERROR", "Failed daily post attempt", {
        attempt,
        error: err?.message || String(err)
      });
    }
  }

  log("ERROR", "Failed to generate a safe tweet after multiple attempts");
}
