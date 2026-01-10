import { z } from "zod";

const EnvSchema = z.object({
  GROQ_API_KEY: z.string().min(1),

  // ✅ Обновили дефолтную модель на актуальную 70B
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),

  X_APP_KEY: z.string().min(1),
  X_APP_SECRET: z.string().min(1),
  X_ACCESS_TOKEN: z.string().min(1),
  X_ACCESS_SECRET: z.string().min(1),

  BOT_NAME: z.string().default("Jester"),
  BOT_HANDLE: z.string().default("@jester"),

  MAX_REPLIES_PER_RUN: z.coerce.number().default(5),
  MAX_POSTS_IN_MEMORY: z.coerce.number().default(50),
});

export const CONFIG = EnvSchema.parse({
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL, // ✅ можно переопределить через env
  X_APP_KEY: process.env.X_APP_KEY,
  X_APP_SECRET: process.env.X_APP_SECRET,
  X_ACCESS_TOKEN: process.env.X_ACCESS_TOKEN,
  X_ACCESS_SECRET: process.env.X_ACCESS_SECRET,
  BOT_NAME: process.env.BOT_NAME,
  BOT_HANDLE: process.env.BOT_HANDLE,
  MAX_REPLIES_PER_RUN: process.env.MAX_REPLIES_PER_RUN,
  MAX_POSTS_IN_MEMORY: process.env.MAX_POSTS_IN_MEMORY,
});

export const PATHS = {
  MEMORY: "data/memory.json",
};
