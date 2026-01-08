import fs from "fs";
import { PATHS, CONFIG } from "./config.js";

type Post = { tweet_id: string; content: string; topic?: string; context?: string; created_at?: string };
type Pattern = { kind: "success" | "avoid"; text: string; score?: number; ts?: string };

type Memory = {
  version: number;
  history: any[];
  posts: Post[];
  patterns: Pattern[];
  state: Record<string, any>;
};

export class MemoryStore {
  private mem: Memory;

  constructor() {
    this.mem = this.load();
  }

  private load(): Memory {
    if (!fs.existsSync(PATHS.MEMORY)) {
      const fresh: Memory = { version: 1, history: [], posts: [], patterns: [], state: {} };
      fs.mkdirSync("data", { recursive: true });
      fs.writeFileSync(PATHS.MEMORY, JSON.stringify(fresh, null, 2));
      return fresh;
    }
    const raw = fs.readFileSync(PATHS.MEMORY, "utf8");
    const parsed = JSON.parse(raw);
    return {
      version: parsed.version ?? 1,
      history: parsed.history ?? [],
      posts: parsed.posts ?? [],
      patterns: parsed.patterns ?? [],
      state: parsed.state ?? {},
    };
  }

  private save() {
    fs.writeFileSync(PATHS.MEMORY, JSON.stringify(this.mem, null, 2));
  }

  addPost(p: Post) {
    this.mem.posts.unshift({ ...p, created_at: p.created_at ?? new Date().toISOString() });
    this.mem.posts = this.mem.posts.slice(0, CONFIG.MAX_POSTS_IN_MEMORY);
    this.save();
  }

  getLastPost() {
    return this.mem.posts[0];
  }

  getRecentPosts(n: number) {
    return this.mem.posts.slice(0, n);
  }

  getPatterns(kind: "success" | "avoid", n: number) {
    return this.mem.patterns.filter(p => p.kind === kind).slice(0, n);
  }

  addPattern(kind: "success" | "avoid", text: string, score: number = 1) {
    this.mem.patterns.unshift({ kind, text, score, ts: new Date().toISOString() });
    this.save();
  }

  getState(key: string) {
    return this.mem.state[key];
  }

  setState(key: string, value: any) {
    this.mem.state[key] = value;
    this.save();
  }
}
