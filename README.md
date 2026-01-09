# Jester AI Agent (Frog • Ribbit)

A meme-coin **mascot + content agent** that posts daily jokes, replies to mentions, and evolves its humor over time.  
Built to run locally **or** fully automated via **GitHub Actions**.

---

## Table of Contents
- [What is this?](#what-is-this)
- [The Token (concept)](#the-token-concept)
- [How it’s different from other AI tokens](#how-its-different-from-other-ai-tokens)
- [What the agent can do](#what-the-agent-can-do)
- [Roadmap](#roadmap)
- [Quick Start (local)](#quick-start-local)
- [GitHub Actions (automation)](#github-actions-automation)
- [Configuration](#configuration)
- [Safety & Guardrails](#safety--guardrails)
- [Project Structure](#project-structure)
- [Disclaimer](#disclaimer)

---

## What is this?

**Jester AI Agent** is a lightweight TypeScript bot designed to feel like a *real meme personality* on X:
- It posts 1 daily joke (“daily post”)
- Replies to new mentions (“reply mentions”)
- Stores memory in a simple JSON file so it can **learn what works** over time

It’s a *starter kit* to build a token mascot that behaves like a consistent character.

---

## The Token (concept)

This repository is a **token mascot agent**, not a blockchain contract.  
The “token” is the *narrative + community object* around the mascot.

**Meaning / purpose**
- A fun identity (the frog jester)
- A consistent stream of memes and jokes
- A way for the community to interact with the mascot daily
- A “living character” that gets funnier over time based on real engagement

**What this unlocks**
- A recognizable brand voice for the token
- Automated community growth loops (mentions → replies → shares)
- Future integrations: leaderboards, quests, meme contests, etc.

---

## How it’s different from other AI tokens

Most “AI tokens” are:
- a static bot posting generic content
- an API wrapper with no personality or memory
- a token with “AI” branding but no working product

**Jester AI Agent is different because:**
✅ **Persistent memory** (learns from what people like)  
✅ **Character consistency** (jester frog style)  
✅ **Multiple job modes** (post / reply / metrics)  
✅ **Automatable** with GitHub Actions  
✅ **Guardrails** to avoid unsafe/bad content  

This is closer to a *real autonomous mascot* than a simple posting script.

---

## What the agent can do

### Daily Post
Generates a joke tweet based on rotating topics and stored “success/avoid” patterns.

### Reply Mentions
Fetches new mentions since last run and replies in-character.

### Collect Metrics
(Optional) collects engagement and stores signals to improve future output.

### Memory / Evolution
Stored in: `data/memory.json`  
Tracks:
- last mention ID
- previous posts
- successful patterns
- patterns to avoid

---

## Roadmap

**Short-term**
- Improve meme style variety
- Better “topic engine” and trend hooks
- Add rate limiting + retry logic

**Mid-term**
- Community prompts (let holders vote on topics)
- Meme templates & image generation
- Leaderboards and “XP” for funny interactions

**Long-term**
- Multiple personalities / seasons
- Multi-agent collaborations (duos / rival mascots)
- Plug-in ecosystem for new job modules

---

## Quick Start (local)

### 1) Install
```bash
npm install
```

### 2) Create `.env`
Copy from example:
```bash
cp .env.example .env
```

Fill in:
- `GROQ_API_KEY`
- X API credentials (if posting/replying)

### 3) Run a job
Daily post:
```bash
MODE=daily npm run dev
```

Reply mentions:
```bash
MODE=reply npm run dev
```

Collect metrics:
```bash
MODE=metrics npm run dev
```

---

## GitHub Actions (automation)

This repo includes workflows in:
`.github/workflows/`

- `daily_post.yml` — runs daily posting
- `reply_mentions.yml` — runs reply job
- `collect_metrics.yml` — metrics job

### Required GitHub Secrets
Go to: **Settings → Secrets and variables → Actions**

Set:
- `GROQ_API_KEY`
- `GROQ_MODEL` *(recommended, see below)*
- `X_ACCESS_TOKEN`
- `X_ACCESS_SECRET`
- `X_APP_KEY`
- `X_APP_SECRET`

> ⚠️ If you only want to generate text without posting to X, you can omit X keys.

---

## Configuration

Main settings are in `src/config.ts`.

Recommended Groq model:
- `llama-3.1-8b-instant` (fast + cheap)
- `llama-3.1-70b-versatile` (better quality)

Set via:
- `GROQ_MODEL` secret or `.env`

---

## Safety & Guardrails

Guardrails live in:
- `src/guardrails.ts`

They block:
- slurs / hate
- explicit sexual content
- “too long” tweets
- unsafe topics

This protects the character and reduces account risk.

---

## Project Structure

```
.github/workflows/      # GitHub Actions automation
data/memory.json        # persistent bot memory
src/
  index.ts              # entrypoint
  dailyPost.ts           # daily post job
  replyMentions.ts       # reply job
  collectMetrics.ts      # metrics job
  generator.ts           # LLM calls + prompts
  guardrails.ts          # content filters
  xClient.ts             # X API client
  poster.ts              # tweet posting
  replier.ts             # reply posting
  mentions.ts            # fetch mentions
  memoryStore.ts         # memory layer
```

---

## Disclaimer

This is an experimental mascot agent template.  
Use responsibly, follow platform rules, and never store secrets in the repository.

If you deploy publicly, you are responsible for:
- content moderation
- compliance with X policies
- API usage costs
