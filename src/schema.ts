export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  tweet_id TEXT,
  content TEXT NOT NULL,
  topic TEXT NOT NULL,
  context TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS patterns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  type TEXT NOT NULL, -- "success" | "avoid"
  pattern TEXT NOT NULL,
  weight INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
