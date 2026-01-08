import { log } from "./logger.js";
import { runDailyPost } from "./jobs/dailyPost.js";
import { runReplyMentions } from "./jobs/replyMentions.js";
import { runCollectMetrics } from "./jobs/collectMetrics.js";

async function main() {
  const mode = process.env.MODE || "daily";

  log("INFO", "Starting Jester AI Agent", { mode });

  if (mode === "daily") await runDailyPost();
  else if (mode === "reply") await runReplyMentions();
  else if (mode === "metrics") await runCollectMetrics();
  else throw new Error(`Unknown MODE: ${mode}`);

  log("INFO", "Job finished", { mode });
}

main().catch((e) => {
  log("ERROR", "Fatal error", { error: String(e) });
  process.exit(1);
});
