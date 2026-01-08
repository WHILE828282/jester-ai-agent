import { MemoryStore } from "../src/memory/memoryStore.js";

const store = new MemoryStore();

store.addPattern("success", "Use short punchlines + one swamp reference", 5);
store.addPattern("success", "Use market pain + irony + American slang", 3);
store.addPattern("avoid", "Overly long jokes", 1);
store.addPattern("avoid", "Too many emojis", 1);

console.log("Seed complete.");
