import "dotenv/config";
import { runDailyPost } from "./dailyPost.js";
import { runReplyMentions } from "./replyMentions.js";
import { runCollectMetrics } from "./collectMetrics.js";
import { runPollMode } from "./poll/pollRunner.js";
import { log } from "./logger.js";

async function main() {
  const mode = (process.env.MODE || "daily").toLowerCase();

  log("INFO","Starting", { mode });

  if (mode === "daily") {
    await runDailyPost();
    return;
  }

  if (mode === "reply") {
    await runReplyMentions();
    return;
  }

  if (mode === "metrics") {
    await runCollectMetrics();
    return;
  }

  if (mode === "poll") {
    await runPollMode();
    return;
  }

  log("ERROR","Unknown MODE", { mode });
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
