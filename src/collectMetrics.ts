import { MemoryStore } from "./memoryStore.js";
import { log } from "./logger.js";

export async function runCollectMetrics() {
  const store = new MemoryStore();

  const recent = store.getRecentPosts(10);
  if (!recent.length) {
    log("INFO", "No posts to analyze for metrics");
    return;
  }

  for (const p of recent.slice(0, 5)) {
    if (p.content.length < 180) store.addPattern("success", "Short punchy jokes perform better", 1);
    else store.addPattern("avoid", "Overly long tweets reduce engagement", 1);
  }

  store.setState("last_metrics_run", new Date().toISOString());
  log("INFO", "Metrics job finished");
}
