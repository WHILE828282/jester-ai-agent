import fs from "node:fs";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { log } from "../logger.js";

const DATA_DIR = path.join(process.cwd(), "data");
const MEM_PATH = path.join(DATA_DIR, "memory.json");

export type PostRecord = {
  id: string;
  created_at: string;
  tweet_id?: string | null;
  content: string;
  topic: string;
  context: string;
  score: number;
  likes: number;
  reposts: number;
  replies: number;
};

export type MemoryFile = {
  posts: PostRecord[];
  patterns: { type: "success" | "avoid"; pattern: string; weight: number; created_at: string }[];
  state: Record<string, string>;
};

function defaultMemory(): MemoryFile {
  return { posts: [], patterns: [], state: {} };
}

function loadMemory(): MemoryFile {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(MEM_PATH)) {
    fs.writeFileSync(MEM_PATH, JSON.stringify(defaultMemory(), null, 2), "utf-8");
  }
  try {
    const raw = fs.readFileSync(MEM_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      posts: Array.isArray(parsed.posts) ? parsed.posts : [],
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
      state: parsed.state && typeof parsed.state === "object" ? parsed.state : {}
    };
  } catch {
    return defaultMemory();
  }
}

function saveMemory(mem: MemoryFile) {
  fs.writeFileSync(MEM_PATH, JSON.stringify(mem, null, 2), "utf-8");
}

export class MemoryStore {
  private mem: MemoryFile;

  constructor() {
    this.mem = loadMemory();
  }

  flush() {
    saveMemory(this.mem);
  }

  addPost(input: Omit<PostRecord, "id" | "created_at" | "score" | "likes" | "reposts" | "replies">) {
    const id = uuid();
    const created_at = new Date().toISOString();
    const rec: PostRecord = {
      id,
      created_at,
      tweet_id: input.tweet_id || null,
      content: input.content,
      topic: input.topic,
      context: input.context,
      score: 0,
      likes: 0,
      reposts: 0,
      replies: 0
    };
    this.mem.posts.unshift(rec);
    this.mem.posts = this.mem.posts.slice(0, 500); // cap
    this.flush();
    log("INFO", "Stored new post in memory.json", { id });
    return id;
  }

  updatePostMetrics(tweet_id: string, metrics: { likes: number; reposts: number; replies: number; score: number }) {
    const p = this.mem.posts.find((x) => x.tweet_id === tweet_id);
    if (!p) return;
    p.likes = metrics.likes;
    p.reposts = metrics.reposts;
    p.replies = metrics.replies;
    p.score = metrics.score;
    this.flush();
  }

  getRecentPosts(limit = 25): PostRecord[] {
    return this.mem.posts.slice(0, limit);
  }

  getLastPost(): PostRecord | null {
    return this.mem.posts[0] || null;
  }

  addPattern(type: "success" | "avoid", pattern: string, weight = 1) {
    this.mem.patterns.push({
      type,
      pattern,
      weight,
      created_at: new Date().toISOString()
    });
    // merge duplicates
    const merged: Record<string, any> = {};
    for (const p of this.mem.patterns) {
      const key = p.type + "::" + p.pattern.toLowerCase();
      if (!merged[key]) merged[key] = { ...p };
      else merged[key].weight += p.weight;
    }
    this.mem.patterns = Object.values(merged);
    this.flush();
  }

  getPatterns(type: "success" | "avoid", limit = 25): string[] {
    return this.mem.patterns
      .filter((p) => p.type === type)
      .sort((a, b) => (b.weight - a.weight) || (b.created_at.localeCompare(a.created_at)))
      .slice(0, limit)
      .map((p) => p.pattern);
  }

  setState(key: string, value: string) {
    this.mem.state[key] = value;
    this.flush();
  }

  getState(key: string): string | null {
    return this.mem.state[key] || null;
  }
}
