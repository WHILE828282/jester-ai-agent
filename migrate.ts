import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const MEM_PATH = path.join(DATA_DIR, "memory.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(MEM_PATH)) fs.writeFileSync(MEM_PATH, JSON.stringify({ posts: [], patterns: [], state: {} }, null, 2), "utf-8");

console.log("Memory file initialized successfully.");
