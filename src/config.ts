import "dotenv/config";
import path from "node:path";

/**
 * Runtime paths (always resolved relative to project root in Actions + local).
 */
export const PATHS = {
  dataDir: path.resolve(process.cwd(), "data"),
  memoryFile: path.resolve(process.cwd(), "data", "memory.json"),
  rulesFile: path.resolve(process.cwd(), "data", "rules.json"),
  governanceDir: path.resolve(process.cwd(), "data", "governance"),
};

/**
 * Global config values.
 * You can safely add new values here later.
 */
export const CONFIG = {
  botName: process.env.BOT_NAME ?? "Jester",
  signature: process.env.BOT_SIGNATURE ?? "ribbit.",

  // Groq / OpenAI compatible env (you already use Groq)
  llmModel: process.env.GROQ_MODEL ?? process.env.OPENAI_MODEL ?? "llama-3.3-70b-versatile",
  llmApiKey: process.env.GROQ_API_KEY ?? process.env.OPENAI_API_KEY ?? "",

  // Rate & retry behavior
  maxAttempts: Number(process.env.MAX_ATTEMPTS ?? "5"),
  sleepOnFailSeconds: Number(process.env.SLEEP_ON_FAIL_SECONDS ?? "30"),

  // X schedule defaults (can override in actions later)
  schedule: {
    dailyPostEveryMinutes: Number(process.env.DAILY_POST_EVERY_MINUTES ?? "120"),
    replyEveryMinutes: Number(process.env.REPLY_EVERY_MINUTES ?? "360"),
    collectEveryMinutes: Number(process.env.COLLECT_EVERY_MINUTES ?? "15"),
  },

  // Safety limits
  limits: {
    maxTweetChars: Number(process.env.MAX_TWEET_CHARS ?? "240"),
    maxReplyChars: Number(process.env.MAX_REPLY_CHARS ?? "200"),
  },

  // Optional: GitHub patch agent settings (if enabled)
  github: {
    enabled: process.env.AGENT_GITHUB_ENABLED === "true",
    branch: process.env.AGENT_BRANCH ?? "main",
  },
};
