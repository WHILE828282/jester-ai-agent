import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  OPENAI_API_KEY: z.string().min(10),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),

  X_APP_KEY: z.string().min(5),
  X_APP_SECRET: z.string().min(5),
  X_ACCESS_TOKEN: z.string().min(5),
  X_ACCESS_SECRET: z.string().min(5),

  BOT_NAME: z.string().default("JESTER_AI"),
  BOT_PERSONA: z.string().default("AI clown that turns market charts into jokes"),
  BOT_HANDLE: z.string().default("@JesterAI"),

  DAILY_POST_HOUR_UTC: z.coerce.number().int().min(0).max(23).default(12),
  MAX_DAILY_POSTS: z.coerce.number().int().min(1).max(5).default(1),
  MAX_REPLIES_PER_RUN: z.coerce.number().int().min(1).max(25).default(8),
  REPLY_LOOKBACK_MINUTES: z.coerce.number().int().min(5).max(1440).default(90),

  ENABLE_TOXIC_FILTER: z.coerce.boolean().default(true),
  ENABLE_POLITICS_FILTER: z.coerce.boolean().default(true),
  ENABLE_SPAM_FILTER: z.coerce.boolean().default(true),

  X_POST_LANGUAGE: z.string().default("en"),
  X_REPLY_LANGUAGE: z.string().default("en")
});

export const CONFIG = schema.parse(process.env);
