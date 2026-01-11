export const CONFIG = {
  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
    model: process.env.GROQ_MODEL || "llama-3.1-70b-versatile",
    temperature: Number(process.env.GROQ_TEMPERATURE ?? 1.0),
    maxTokens: Number(process.env.GROQ_MAX_TOKENS ?? 250)
  },

  x: {
    appKey: process.env.X_APP_KEY || "",
    appSecret: process.env.X_APP_SECRET || "",
    accessToken: process.env.X_ACCESS_TOKEN || "",
    accessSecret: process.env.X_ACCESS_SECRET || ""
  },

  text: {
    maxTweetChars: 260,
    maxReplyChars: 200
  },

  poll: {
    voteWindowHours: Number(process.env.POLL_WINDOW_HOURS ?? 24)
  },

  paths: {
    memoryFile: "data/memory.json",
    rulesFile: "data/rules.json",
    pollStateFile: "data/poll_state.json",
    pollSpecFile: "data/poll_spec.json",
    governanceDir: "governance"
  }
};
