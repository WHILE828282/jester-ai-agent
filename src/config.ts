import "dotenv/config";

function must(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`Missing env var: ${name}`);
  }
  return v.trim();
}

function opt(name: string, fallback: string): string {
  const v = process.env[name];
  return (v && v.trim() !== "") ? v.trim() : fallback;
}

export const CONFIG = {
  // --- Runtime ---
  mode: opt("MODE", "daily"),

  // --- Groq / LLM ---
  groq: {
    apiKey: must("GROQ_API_KEY"),
    model: opt("GROQ_MODEL", "llama-3.1-70b-versatile"),
    temperature: Number(opt("GROQ_TEMPERATURE", "1.0")),
    maxTokens: Number(opt("GROQ_MAX_TOKENS", "160")),
  },

  // --- X / Twitter ---
  x: {
    appKey: must("X_APP_KEY"),
    appSecret: must("X_APP_SECRET"),
    accessToken: must("X_ACCESS_TOKEN"),
    accessSecret: must("X_ACCESS_SECRET"),
  },

  // --- Content limits ---
  text: {
    maxTweetChars: Number(opt("MAX_TWEET_CHARS", "260")),
    maxReplyChars: Number(opt("MAX_REPLY_CHARS", "200")),
  },

  // --- Poll system ---
  poll: {
    enabled: opt("POLL_ENABLED", "true") === "true",
    durationHours: Number(opt("POLL_DURATION_HOURS", "24")),
    optionsCount: Number(opt("POLL_OPTIONS_COUNT", "5")),
    // сколько комментов читать за один запрос (обычно 100 max)
    pageSize: Number(opt("POLL_PAGE_SIZE", "100")),
  },

  // --- Agent / GitHub self-commit ---
  github: {
    // В GH Actions обычно хватает GITHUB_TOKEN, но для пуша удобнее PAT
    pat: opt("GH_PAT", ""),
    // default branch
    branch: opt("GIT_BRANCH", "main"),
    // owner/repo можно оставить пустым если repo уже клонирован
    owner: opt("GITHUB_OWNER", ""),
    repo: opt("GITHUB_REPO", ""),
  },

  // --- Memory / Files ---
  paths: {
    memoryFile: opt("MEMORY_FILE", "data/memory.json"),
    rulesFile: opt("RULES_FILE", "data/rules.json"),
    governanceDir: opt("GOVERNANCE_DIR", "governance"),
  },

  // --- Scheduling suggestions (watch.ts can use these) ---
  schedule: {
    dailyPostHours: Number(opt("SCHEDULE_DAILY_HOURS", "2")),
    replyHours: Number(opt("SCHEDULE_REPLY_HOURS", "6")),
    metricsMinutes: Number(opt("SCHEDULE_METRICS_MINUTES", "15")),
  },
};
