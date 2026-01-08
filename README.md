# Jester AI Agent (Frog • Ribbit)

Autonomous memecoin mascot agent that:
- Posts a daily joke to X
- Replies to mentions
- Evolves humor with a simple JSON memory (`data/memory.json`)
- Always ends with an American frog **"ribbit."**

## Quick Start (local)

1. Install deps:
```bash
npm install
```

2. Copy env template:
```bash
cp .env.example .env
```

3. Run daily post:
```bash
MODE=daily npm run dev
```

## GitHub Actions
Workflows live in `.github/workflows`:
- `daily_post.yml` (daily at 12:00 UTC + manual)
- `reply_mentions.yml` (every 10 min + manual)
- `collect_metrics.yml` (hourly + manual)

Secrets required: `OPENAI_API_KEY`, `OPENAI_MODEL`, `X_APP_KEY`, `X_APP_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`, `BOT_NAME`, `BOT_HANDLE`

