# 🤡 Jester AI Agent

**Jester** is an autonomous AI swamp frog that posts daily jokes and replies to mentions on X (Twitter).
Its humor evolves intelligently over time using memory + metrics.

> "The market is a swamp — we are the show."

---

## ✅ Features

- **Daily auto-posting** (scheduled via GitHub Actions)
- **Auto-reply to mentions** every 10 minutes
- **Self-improving humor**
  - Stores all posts in JSON memory (auto-committed to GitHub)
  - Tracks performance metrics (likes, reposts, replies)
  - Runs self-critique and extracts successful patterns
  - Avoids repeating failed patterns
- **Guardrails**
  - Anti-spam filter
  - Anti-toxic filter
  - No political agitation
  - No hate / harassment
- **Fully open-source** and easy to fork

---

## 🧠 How the Humor Evolves

Jester AI stores each post and later collects metrics.

A simple score is computed:
- `score = likes + 2 * reposts + 3 * replies`

Then a self-critique prompt runs and extracts:
- 1 successful humor pattern
- 1 avoid pattern

These patterns are stored and used in future generations.

This makes the AI adapt to what your audience actually likes.

---

## 🧱 Tech Stack

- Node.js + TypeScript
- OpenAI API (for generation)
- X API via `twitter-api-v2`
- JSON file storage (data/memory.json)
- GitHub Actions automation

---

## 🚀 Quick Start (Local)

### 1. Clone the repo
```bash
git clone https://github.com/yourname/jester-ai-agent
cd jester-ai-agent
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env` and fill it.

```bash
cp .env.example .env
```

### 4. Run migrations (creates the database)
```bash
npm run migrate  # initializes data/memory.json
```

### 5. Run once (daily post)
```bash
MODE=daily npm run dev
```

### 6. Run reply mode
```bash
MODE=reply npm run dev
```

### 7. Run metrics + evolution
```bash
MODE=metrics npm run dev
```

---

## 🔑 X API Setup (Posting + Reply)

You need X Developer keys that allow **Read & Write**.

Recommended approach: OAuth 1.0a
- App Key
- App Secret
- Access Token
- Access Secret

Store them in `.env` or GitHub Secrets.

---

## 🤖 GitHub Actions Setup

Go to:
**Repo → Settings → Secrets and variables → Actions → New repository secret**

Add:
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `X_APP_KEY`
- `X_APP_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_SECRET`

Then Actions will run automatically:
- Daily post at 12:00 UTC
- Reply mentions every 10 minutes
- Collect metrics every 6 hours

---

## 🛡️ Safety

This is a memecoin AI agent — but we keep it safe:
- No hate content
- No slurs
- No political agitation
- No spam links
- No financial advice

The guardrails are in: `src/humor/guardrails.ts`

---

## 🧩 Customization

Change the personality and style by editing:

- `prompts/system.md`
- `prompts/daily_post.md`
- `prompts/reply.md`

Want a more aggressive roast mode? Add a second persona prompt and route replies based on context.

---

## 📌 Disclaimer

This bot is for entertainment.
It is not financial advice.
It does not predict markets.
It is a frog.

---

## License

MIT
