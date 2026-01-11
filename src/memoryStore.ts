import fs from "node:fs";
import path from "node:path";
import { PATHS } from "./config.js";

type PatternType = "success" | "avoid";

export type MemoryPost = {
  tweet_id: string;
  content: string;
  topic: string;
  context: string;
  ts?: number;
};

export type Pattern = {
  text: string;
  score?: number;
  ts?: number;
};

type MemoryShape = {
  posts: MemoryPost[];
  patterns: {
    success: Pattern[];
    avoid: Pattern[];
  };
  state: {
    lastMentionId?: string;
    lastRun?: number;
    lastMetricsRun?: number;
  };
};

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function safeReadJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson(file: string, data: any) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

const DEFAULT_MEMORY: MemoryShape = {
  posts: [],
  patterns: { success: [], avoid: [] },
  state: {},
};

export class MemoryStore {
  private mem: MemoryShape;

  constructor() {
    // ✅ гарантируем data/ существует
    ensureDir(PATHS.dataDir);

    // ✅ если memory.json нет — создаём
    this.mem = safeReadJson<MemoryShape>(PATHS.memoryFile, DEFAULT_MEMORY);
    if (!this.mem.posts) this.mem.posts = [];
    if (!this.mem.patterns) this.mem.patterns = { success: [], avoid: [] };
    if (!this.mem.patterns.success) this.mem.patterns.success = [];
    if (!this.mem.patterns.avoid) this.mem.patterns.avoid = [];
    if (!this.mem.state) this.mem.state = {};

    this.flush(); // закрепим корректную структуру на диске
  }

  flush() {
    safeWriteJson(PATHS.memoryFile, this.mem);
  }

  getRecentPosts(n = 10): MemoryPost[] {
    return [...this.mem.posts].slice(-n);
  }

  addPost(p: MemoryPost) {
    this.mem.posts.push({ ...p, ts: p.ts ?? Date.now() });
    // ограничим историю чтобы не разрасталась бесконечно
    if (this.mem.posts.length > 300) this.mem.posts = this.mem.posts.slice(-300);
    this.flush();
  }

  getPatterns(type: PatternType, n = 10): Pattern[] {
    const arr = this.mem.patterns[type] ?? [];
    return [...arr].slice(-n);
  }

  addPattern(type: PatternType, text: string, score = 1) {
    this.mem.patterns[type] = this.mem.patterns[type] ?? [];
    this.mem.patterns[type].push({ text, score, ts: Date.now() });
    if (this.mem.patterns[type].length > 500) {
      this.mem.patterns[type] = this.mem.patterns[type].slice(-500);
    }
    this.flush();
  }

  getLastMentionId(): string | undefined {
    return this.mem.state.lastMentionId;
  }

  setLastMentionId(id: string) {
    this.mem.state.lastMentionId = id;
    this.flush();
  }

  markMetricsRun() {
    this.mem.state.lastMetricsRun = Date.now();
    this.flush();
  }
}
