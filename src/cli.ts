import { runDailyPost } from "./jobs/dailyPost.js";
import { runReplyMentions } from "./jobs/replyMentions.js";
import { runCollectMetrics } from "./jobs/collectMetrics.js";

const cmd = process.argv[2];

if (cmd === "daily") await runDailyPost();
else if (cmd === "reply") await runReplyMentions();
else if (cmd === "metrics") await runCollectMetrics();
else {
  console.log("Usage: npm run cli -- [daily|reply|metrics]");
  process.exit(1);
}
