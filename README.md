# 🤡Jester (Ribbit) — Autonomous Mascot Engine

A **high-tempo memecoin mascot system** built for X.  
Jester is a red frog jester with a savage voice: crude, shameless, disrespectful, and relentlessly entertaining — optimized for the style that actually performs on meme timelines.

This repository contains the full automation stack for:
- **Daily posts** (scheduled)
- **Mention replies** (scheduled)
- **Humor evolution** (pattern learning + memory)
- **Persistent memory** (committed back into the repo)
- **(Optional) Autonomous self-fixing agent** (Groq-based)

> Jester ends its lines with: **ribbit.**

---

## ⚡ Autonomy Manifesto (Transparency)

This project is intentionally built to demonstrate **real autonomy** in a world where most “AI agents” are still limited to templates and manual intervention.

✅ **Code + architecture were produced via AI (GPT instructions)**  
✅ **The mascot runs autonomously** (scheduled posts + replies + metrics loops)  
✅ **During development, visible errors were not “hand fixed” by the creator** — the goal was transparency  
✅ The creator’s role was **mostly operational**: launching runs / checking that the system executes  
✅ The system is designed so that **Groq can fix failures and patch code automatically** 

This repository is kept **open and readable** so anyone who understands code can verify:
- how the automation works
- how memory is stored
- what changes are made
- how governance works

---

## 🧠 Core Idea

**A token mascot must behave like a real personality — not a generic content bot.**

That means:
- consistent tone
- consistent cadence
- memory of what worked
- aggressive engagement loops
- replies on demand
- same “voice” every day

Jester is meant to be the *permanent face* of a memecoin narrative and the *daily engine* that keeps the timeline alive.

---

## 🔥 What You’re Getting

✅ **TypeScript codebase**  
✅ **Scheduled automation (GitHub Actions or server)**  
✅ **Memory persistence via `data/memory.json`**  
✅ **Daily posts + replies**  
✅ **A stable character system**  
✅ **A modular structure that can be extended**  
✅ **Optional self-fixing agent mode**  

You can run it:
- locally (testing / iteration)
- entirely on GitHub Actions (hands-free)
- on a VPS/server for always-on mode

---

## 🎭 Character Spec (Voice & Rules)

Jester is intentionally designed to be:
- **harsh**
- **vulgar**
- **provocative**
- **disrespectful**
- **fast-paced**
- **meme-native**
- **confident**

### Voice Constraints
- short sentences
- no walls of text
- no corporate language
- no apologizing
- no “assistant” behavior
- no disclaimers in posts
- every post should feel like a real account

### Style Rules
- avoid hashtags (unless explicitly needed)
- minimal emojis (optional)
- always ends with: **ribbit.**
- pushes conflict-style humor, but avoids protected-class targeting

---

## 🪙 Token Narrative (Community Ownership)

This repository is **not a blockchain contract**.  
It is the **mascot infrastructure** behind a token narrative.

The token is treated as:
- a social object
- an identity container
- a distribution meme

Jester is:
- the voice
- the attention engine
- the daily engagement driver

### Community Ownership Statement
The mascot engine and its governance logic are built with the intention that:

**The narrative belongs to the community.  
The community decides what changes happen next.**

All “dev” allocations (if any exist on-chain) are intended to be used transparently (e.g. staking / long-term alignment) rather than private extraction.

---

## 🗳️ Governance via Weekly Polls (Fully Autonomous)

Jester can run weekly governance polls on X **without human involvement**.

### How it works (Variant B — comments vote parsing)
1. Jester posts a poll tweet like:
   - “What change do you want this week? Write a number (1–5) in comments.”
2. Community votes by writing:
   - `2`
   - `I vote 2 because…`
   - `Number 2`
3. The system **extracts the first valid digit (1–5)** from each user’s text.
4. **Only ONE vote per account** is counted:
   - If the same user comments multiple times → only the first valid vote counts
   - If the user spams “2 2 2 2 2” → counts as a single vote
5. Voting window = **24 hours**
6. The winner becomes the “governance decision” for the week.

✅ This requires **NO OpenAI** (Groq only, unless you choose otherwise)  
✅ The vote counting can be done deterministically without any AI calls  

---

## 🧩 How weekly changes work after voting (Autonomous changes)

After the vote closes:

1. The agent picks the winning option
2. It creates an “issue-like” specification inside the repo (e.g. `governance/win_YYYY-MM-DD.md`)
3. If autonomous patching is enabled:
   - It runs tests / sanity checks
   - It attempts to implement the change automatically
   - It commits and pushes to GitHub
4. If the change is too large:
   - It logs a “TODO backlog”
   - It can either attempt incremental PRs or defer to next poll cycle

✅ This keeps everything transparent:
- the community sees what won
- the repo shows what was changed
- commits show exactly what happened

---

## 🏗 System Architecture

At a high level:

```
Scheduler (GitHub Actions / VPS)
        |
        v
Node runtime (tsx / node)
        |
        v
MODE switch (daily / reply / metrics / poll / agent-fix)
        |
        v
LLM -> generates text (Groq)
        |
        v
Guardrails -> validates output
        |
        v
X API -> posts or replies
        |
        v
Memory -> saved to data/memory.json
        |
        v
Git commit -> pushes memory + governance logs back into repo
```

---

## 🧪 Job Modes

Jester runs in one of multiple modes depending on `MODE`:

### `MODE=daily`
- generates a daily post
- publishes it
- stores it in memory

### `MODE=reply`
- fetches new mentions since last run
- replies in character
- updates last mention ID

### `MODE=metrics`
- reads recent posts
- updates pattern library
- stores “what to do more” vs “what to avoid”

### `MODE=poll`
- posts the weekly poll
- after 24h counts votes
- writes results into repo

### `MODE=agent_fix` (optional)
- detects failures
- runs tests
- generates patches
- commits fixes automatically

---

## 🧠 Memory & Evolution

Memory is stored in:
- `data/memory.json`

This file keeps:
- recent posts
- pattern library (success vs avoid)
- state flags (last mention id, last run time)
- optional poll metadata

### Why JSON Memory?
- easy to inspect
- easy to reset
- easy to extend
- commits cleanly via automation

---

## ⚠️ Safety, Constraints & Ban-Risk

Jester is designed to be vulgar and insulting, but:
- it should not target protected classes
- it should avoid extreme violence content
- it should avoid doxxing / harassment
- it should avoid sexual content involving minors (obvious)

This repo includes minimal guardrails to reduce risk:
- max length limits
- banned words list
- general filters

---

## 🛠 Setup (Local)

```bash
npm install
cp .env.example .env
MODE=daily npm run dev
```

---

## 🤖 Automation (GitHub Actions)

Workflows (if enabled):
- `.github/workflows/daily_post.yml`
- `.github/workflows/reply_mentions.yml`
- `.github/workflows/collect_metrics.yml`
- *(optional)* poll / agent workflows

---

## 🔐 Required Secrets

Add in: **Settings → Secrets and variables → Actions**

- `GROQ_API_KEY`
- `GROQ_MODEL`
- `X_APP_KEY`
- `X_APP_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_SECRET`
- *(optional for agent pushing commits)* `GITHUB_TOKEN` or `GH_PAT`

---

## 🧩 Deployment Patterns

- GitHub Actions
- VPS (always-on)
- serverless schedulers

---

## 🧭 Roadmap

- better topic engine
- better reply strategy
- image memes
- stronger governance automation
- poll-driven PR workflow

---

## 📜 Licensing & Disclaimer

Experimental automation system.  
Do not commit secrets.  
You are responsible for compliance.

---

**Jester does not ask permission. Jester posts. ribbit.**
