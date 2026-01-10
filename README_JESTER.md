# 🤡 Jester (Ribbit) — Autonomous Mascot Engine for Community CTO

> **Autonomous meme mascot system for X** built to run like a real personality — daily posts, savage replies, memory, metrics, governance polls, and automated repo updates.  
> **Built with Groq**, originally constructed via GPT-guided development.  
> **Narrative token launch: pump.fun — Community CTO**.  
> **The mascot belongs to the community. The community decides its evolution.**

---

## 🔗 Quick Navigation

- [🚀 What This Is (Core Idea)](#-what-this-is-core-idea)
- [🪙 Token Narrative (pump.fun + Community CTO)](#-token-narrative-pumpfun--community-cto)
- [⚡ Autonomy Manifesto (Transparency)](#-autonomy-manifesto-transparency)
- [🗳️ Governance (Weekly Polls + Community Voting)](#-governance-weekly-polls--community-voting)
- [✅ How Votes Are Counted](#-how-votes-are-counted)
- [🧩 What Happens After Winning Vote](#-what-happens-after-winning-vote)
- [🧠 Memory & Evolution](#-memory--evolution)
- [🏗 Architecture](#-architecture)
- [🎭 Character Spec (Voice Rules)](#-character-spec-voice-rules)
- [🧪 Modes](#-modes)
- [🛠 Setup (Local)](#-setup-local)
- [🤖 Always-On Deploy Options](#-always-on-deploy-options)
- [🔐 Secrets](#-secrets)
- [⚠️ Ban Risk & Safety Constraints](#️-ban-risk--safety-constraints)
- [📌 Roadmap](#-roadmap)
- [📜 License](#-license)

---

## 🚀 What This Is (Core Idea)

Most “AI agents” on crypto timelines are fake autonomy:  
they run templates, need manual control, and can’t evolve.

**Jester is built to demonstrate real autonomy.**

This repository is the **full mascot automation engine** for:
- **scheduled daily posts**
- **scheduled mention replies**
- **engagement learning + pattern evolution**
- **persistent memory committed into the repo**
- **weekly governance polls**
- **automatic governance logging & repo updates**
- *(optional)* autonomous self-fixing system

Jester ends all lines with: **ribbit.**

---

## 🪙 Token Narrative (pump.fun + Community CTO)

This repo is **not** a blockchain contract.  
It is the **mascot infrastructure behind a token narrative**.

### ✅ pump.fun Launch
The token narrative is designed to launch on **pump.fun**.

### ✅ Community Ownership (CTO)
This project is built under the assumption that:

**The token belongs fully to the community.**  
**Governance decisions are made through voting.**  
**The mascot evolves based on community choices.**

That means:
- No private “dev dictatorship”
- No secret roadmap control
- No hidden changes
- No manual steering behind the scenes

The goal is **community CTO governance**, enforced by:
- public polls
- public results
- transparent repository logs
- automation rules that reduce human interference

---

## ⚡ Autonomy Manifesto (Transparency)

This project is intentionally built to prove **autonomy without stage tricks**.

✅ The code + architecture were produced through **AI-guided development** (GPT-driven coding instructions).  
✅ The system runs autonomously via scheduled automation.  
✅ During development, **errors that were visible were NOT manually fixed by the creator** — to keep the experiment honest.  
✅ The creator mainly acted as an operator:
- installing dependencies
- launching runs
- verifying runtime outputs  
✅ The system is designed so that **failures can be detected and patched automatically by Groq** (no OpenAI required).

This repository stays open and readable so anyone can verify:
- how posting works
- how memory is stored
- how decisions are made
- how governance produces repo updates

---

## 🗳️ Governance (Weekly Polls + Community Voting)

Jester runs a **weekly governance poll** on X.

The poll asks:
> **What change should happen this week?**  
> **Vote by writing a number 1–5 in comments.**

The poll is designed to be:
- autonomous
- deterministic
- easy to audit
- resistant to spam votes

This means the creator doesn’t choose changes —  
**the community does.**

---

## ✅ How Votes Are Counted

Voting rules are intentionally strict:

### ✅ What counts as a vote
A comment counts if it contains a valid digit:
- `1`
- `2`
- `3`
- `4`
- `5`

Examples that WILL be counted:
- `2`
- `I vote 2`
- `номер 2 потому что...`
- `I definitely choose 2 because...`

The system extracts the **first valid digit (1–5)** from text.

### ✅ Anti-spam rules
- If a user writes `2 2 2 2 2 2` → it counts as **1 vote**
- Only **1 vote per user** for the entire poll window
- If the same user comments multiple times:
  - only the first valid vote is counted  
  - all later comments are ignored

### ✅ Vote window
Voting stays open for **24 hours**  
(you requested 24 hours specifically).

---

## 🧩 What Happens After Winning Vote

After 24 hours:

1. The system counts votes
2. Picks the winning option
3. Writes a governance decision log into the repo:
   - `governance/win_YYYY-MM-DD.md`
4. Automatically creates a spec:
   - what the community wants
   - what must be changed
   - what files are involved

### ✅ If autonomous patching is enabled
Then the agent can:
- create a patch plan
- edit code
- run tests
- commit changes
- push to GitHub automatically

### ✅ If change is too large
The system:
- logs it to backlog
- proposes incremental steps
- can split it across weeks
- continues governance process

Everything stays visible:
- what was voted
- what won
- what changed
- why it changed

---

## 🧠 Memory & Evolution

Jester isn’t a stateless bot.

It keeps memory in:
- `data/memory.json`

Memory includes:
- recent posts
- successful patterns
- avoided patterns
- mention reply state
- last mention ID
- last poll state
- governance outcomes

Why JSON memory?
- easy to audit
- easy to reset
- commits cleanly
- transparent evolution

---

## 🏗 Architecture

High-level system flow:

```
Scheduler (GitHub Actions / VPS)
        |
        v
Node runtime (tsx / node)
        |
        v
MODE switch (daily / reply / metrics / poll / agent_fix)
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
Memory -> updates memory.json
        |
        v
Git commit -> pushes memory + governance logs back into repo
```

---

## 🎭 Character Spec (Voice Rules)

Jester is designed to be:
- savage
- crude
- shameless
- disrespectful
- meme-native
- fast-paced
- relentlessly entertaining

### Constraints
- short sentences
- no corporate language
- no “assistant tone”
- no apologies
- minimal emojis
- avoid hashtags unless needed
- always ends with **ribbit.**

---

## 🧪 Modes

Jester runs based on `MODE`.

### `MODE=daily`
- generates a post
- publishes it
- stores it in memory

### `MODE=reply`
- reads mentions
- replies in character
- updates last mention ID

### `MODE=metrics`
- evaluates performance signals
- updates pattern library

### `MODE=poll`
- posts weekly governance poll
- after 24h counts votes
- writes decision log

### `MODE=agent_fix` *(optional)*
- detects failures
- runs tests
- generates patches
- commits & pushes

---

## 🛠 Setup (Local)

```bash
npm install
cp .env.example .env
MODE=daily npm run dev
```

---

## 🤖 Always-On Deploy Options

Jester can run:
- via **GitHub Actions** (hands-free)
- on a **VPS/server** (true always-on)
- on schedulers (cron jobs, docker)

### If you shut down your PC:
✅ It still runs if:
- GitHub Actions is used
- a VPS is used

❌ It does NOT run if:
- it’s only running locally on your computer

---

## 🔐 Secrets

GitHub → Settings → Secrets and variables → Actions:

- `GROQ_API_KEY`
- `GROQ_MODEL`
- `X_APP_KEY`
- `X_APP_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_SECRET`
- *(optional for repo commits)* `GH_PAT` or GitHub token

---

## ⚠️ Ban Risk & Safety Constraints

Jester is vulgar by design, but must avoid:
- protected-class targeting
- doxxing
- harassment & threats
- sexual content involving minors
- extreme violence

Minimal guardrails exist for survival.

---

## 📌 Roadmap

- better topic engine
- poll-driven PR workflow
- image meme generation
- smarter reply cadence control
- stronger governance automation
- community proposal extraction

---

## 📜 License

Experimental autonomy system.  
Do not commit secrets.  
Use at your own risk.

---

**Jester does not ask permission. Jester posts. ribbit.**
