# 🤡Jester (Ribbit) — Autonomous Mascot Engine

A **high-tempo memecoin mascot system** built for X.  
Jester is a red frog jester with a savage voice: crude, shameless, disrespectful, and relentlessly entertaining — optimized for the style that actually performs on meme timelines.

This repository contains the full automation stack for:
- **Daily posts** (scheduled)
- **Mention replies** (scheduled)
- **Humor evolution** (pattern learning + memory)
- **Persistent memory** (committed back into the repo)

> Jester ends its lines with: **ribbit.**

---

## Table of Contents
- [1. Concept](#1-concept)
- [2. What You’re Getting](#2-what-youre-getting)
- [3. Character Spec (Voice & Rules)](#3-character-spec-voice--rules)
- [4. Token Narrative](#4-token-narrative)
- [5. Utility & Flywheel](#5-utility--flywheel)
- [6. How This Differs From Other “AI Tokens”](#6-how-this-differs-from-other-ai-tokens)
- [7. System Architecture](#7-system-architecture)
- [8. Job Modes](#8-job-modes)
- [9. Memory & Evolution](#9-memory--evolution)
- [10. Prompt Strategy](#10-prompt-strategy)
- [11. Safety, Constraints & Ban-Risk](#11-safety-constraints--ban-risk)
- [12. Setup (Local)](#12-setup-local)
- [13. Automation (GitHub Actions)](#13-automation-github-actions)
- [14. Required Secrets](#14-required-secrets)
- [15. Configuration](#15-configuration)
- [16. Observability & Debugging](#16-observability--debugging)
- [17. Common Errors](#17-common-errors)
- [18. Deployment Patterns](#18-deployment-patterns)
- [19. Roadmap](#19-roadmap)
- [20. Branding Assets](#20-branding-assets)
- [21. Community Operations](#21-community-operations)
- [22. Contribution Guide](#22-contribution-guide)
- [23. Licensing & Disclaimer](#23-licensing--disclaimer)

---

## 1. Concept

Jester is built around a simple premise:

**A token mascot must behave like a real personality — not a generic content bot.**

That means:
- consistent tone
- consistent cadence
- memory of what worked
- aggressive engagement loops
- ability to reply on demand
- the same “voice” every day

Jester is meant to be the *permanent face* of a memecoin narrative and the *daily engine* that keeps the timeline alive.

---

## 2. What You’re Getting

This repo is a fully working starter kit, not a “concept doc”:

✅ **TypeScript codebase**  
✅ **Three GitHub Actions workflows**  
✅ **Memory persistence via `data/memory.json`**  
✅ **Daily posts + replies**  
✅ **A stable character system**  
✅ **A modular structure that can be extended**  

You can run it:
- locally (testing / iteration)
- entirely in GitHub Actions (hands-free)

---

## 3. Character Spec (Voice & Rules)

Jester is not neutral. It is intentionally designed to be:
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

### Why This Matters
Most meme bots fail because:
- they sound like GPT
- they write long paragraphs
- they repeat content
- they have no consistent identity

Jester is engineered to sound like a character — not like a tool.

---

## 4. Token Narrative

This repository is **not a blockchain contract**.  
It is the **mascot infrastructure** behind a token narrative.

Think of the token as:
- a social object
- an identity container
- a distribution meme

Think of Jester as:
- the voice
- the attention engine
- the daily engagement driver

### Core Narrative
Jester is the red frog jester who:
- roasts everyone
- mocks every chart move
- humiliates weak hands
- celebrates chaos
- turns attention into culture

---

## 5. Utility & Flywheel

A token without a flywheel dies.  
Jester provides a **permanent engagement flywheel**:

### Flywheel Loop
1. Daily post hits timeline  
2. People reply/quote  
3. Jester replies back (combat style)  
4. Screenshots + reposts  
5. New mentions increase  
6. More replies  
7. Brand becomes recognizable  

### Utility (Social Utility)
- daily entertainment
- daily conversation starters
- community roleplay magnet
- “identity layer” that keeps the token alive
- consistent tone, consistent meme output

This is utility that *actually matters* in memecoins: attention.

---

## 6. How This Differs From Other “AI Tokens”

Most “AI tokens” are:
- generic posting loops
- no persistence
- no real product
- no character lock

### What Jester has:
✅ **Persistent memory**  
✅ **Pattern library (success/avoid)**  
✅ **Three job types**  
✅ **Automation workflows included**  
✅ **Structure designed for extension**  

This is closer to a real mascot engine than a one-off script.

---

## 7. System Architecture

At a high level:

```
GitHub Actions (scheduler)
        |
        v
Node runtime (npm run dev)
        |
        v
MODE switch (daily / reply / metrics)
        |
        v
LLM -> generates text
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
Git commit -> pushes updated memory back into repo
```

---

## 8. Job Modes

Jester runs in one of three modes depending on the `MODE` environment variable.

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

---

## 9. Memory & Evolution

Memory is stored in:
- `data/memory.json`

This file keeps:
- recent posts
- pattern library (success vs avoid)
- state flags (last mention id, last run time)

### Why JSON Memory?
- easy to inspect
- easy to reset
- easy to extend
- commits cleanly via Actions

---

## 10. Prompt Strategy

Prompts are designed to enforce:
- personality
- short output
- timeline-native language
- “no assistant voice”
- ribbit ending

The generator uses:
- topic/context engine
- recent post avoidance
- success patterns
- avoid patterns

---

## 11. Safety, Constraints & Ban-Risk

Jester is designed to be vulgar and insulting, but:
- it should not target protected classes
- it should avoid extreme violence content
- it should avoid explicit sexual content involving minors (obvious)
- it should avoid personal harassment or doxxing

This repo includes minimal guardrails to reduce risk:
- max length limits
- banned words list
- general filters

---

## 12. Setup (Local)

```bash
npm install
cp .env.example .env
MODE=daily npm run dev
```

---

## 13. Automation (GitHub Actions)

Workflows:
- `.github/workflows/daily_post.yml`
- `.github/workflows/reply_mentions.yml`
- `.github/workflows/collect_metrics.yml`

---

## 14. Required Secrets

Add in: **Settings → Secrets and variables → Actions**

- `GROQ_API_KEY`
- `GROQ_MODEL`
- `X_APP_KEY`
- `X_APP_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_SECRET`

---

## 15. Configuration

Main config is in `src/config.ts`.

---

## 16. Observability & Debugging

Logs are structured JSON.  
Check them in GitHub Actions.

---

## 17. Common Errors

- **404 model** → fix `GROQ_MODEL`
- **401** → missing/invalid key
- **X errors** → account/app restrictions

---

## 18. Deployment Patterns

- GitHub Actions
- VPS
- Serverless

---

## 19. Roadmap

- better topic engine
- better reply strategy
- image memes
- persona seasons

---

## 20. Branding Assets

- pixel PFP
- black banner
- glitch text

---

## 21. Community Operations

- daily roast threads
- weekly leaderboards

---

## 22. Contribution Guide

Keep tone consistent. Keep dependencies light.

---

## 23. Licensing & Disclaimer

Experimental automation system.  
Do not commit secrets.  
You are responsible for compliance.

---

**Jester does not ask permission. Jester posts. ribbit.**
