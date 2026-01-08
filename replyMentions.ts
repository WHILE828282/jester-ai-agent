import { MemoryStore } from "../memory/memoryStore.js";
import { fetchMentionsSince } from "../x/mentions.js";
import { generateReply } from "../llm/generator.js";
import { validateOutput } from "../humor/guardrails.js";
import { replyToTweet } from "../x/replier.js";
import { log } from "../logger.js";
import { normalizeWhitespace } from "../utils/text.js";
import { CONFIG } from "../config.js";

export async function runReplyMentions() {
  const store = new MemoryStore();
  const sinceId = store.getState("last_mention_id") || undefined;

  const { mentions, newestId } = await fetchMentionsSince(sinceId, CONFIG.MAX_REPLIES_PER_RUN);

  if (mentions.length === 0) {
    log("INFO", "No new mentions to reply to");
    return;
  }

  const lastPost = store.getLastPost()?.content || "No posts yet.";
  const successPatterns = store.getPatterns("success", 10);
  const failPatterns = store.getPatterns("avoid", 10);

  let replied = 0;

  for (const mention of mentions) {
    if (replied >= CONFIG.MAX_REPLIES_PER_RUN) break;

    const raw = await generateReply({
      userText: mention.text,
      lastPost,
      successPatterns,
      failPatterns
    });

    const reply = normalizeWhitespace(raw);
    const check = validateOutput(reply);

    if (!check.ok) {
      log("WARN", "Reply rejected by guardrails", { mention_id: mention.id, reason: check.reason, reply });
      continue;
    }

    await replyToTweet(mention.id, reply);
    replied++;
  }

  if (newestId) store.setState("last_mention_id", newestId);

  log("INFO", "Reply job finished", { replied });
}
