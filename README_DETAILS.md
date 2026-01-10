# DOCS — Jester AI Agent (Detailed Docs)

This file contains **all expanded information**: philosophy, architecture, voting, deployment, security, and how the autonomous fixer works.

---

## 1) Why this project exists (the bigger point)
Most “AI agents” are:
- scripts controlled by a person,
- limited by templates,
- “autonomous” only in marketing.

**Jester is an autonomy + governance experiment**:
- autonomous posting & replies,
- open, auditable repo,
- community voting selects changes,
- agent can attempt fixes/patches automatically.

The goal is to demonstrate a future where:
- agents evolve publicly,
- autonomy is real,
- decision-making is community-driven.

---

## 2) Token & community note (pump.fun)
The token will launch on **pump.fun** (Solana).

This project is presented as:
- **community-directional** (weekly voting),
- **open and auditable**, so anyone can check the agent’s logic,
- intended for **maximum transparency**.

> Any “dev allocations” (if applicable) are intended to be used in a community-aligned way (e.g., staking), and the code + workflows remain public so the community can verify actions.

---

## 3) High-level capabilities
### Current behavior
- 📝 Generates posts on X on a schedule
- 💬 Replies to mentions / replies on a schedule
- 📊 Collects metrics
- 🧠 Stores memory locally (`memory.json` or similar)
- 🛠️ Self-fix mode (optional): detect errors → run checks → patch → commit & push

### Important note about “self-fixing”
“Self-fixing” is only as safe as the permissions you grant it.
If you give GitHub write access, it can push changes.
That is powerful, but must be controlled.

---

## 4) Voting system — Variant B (official)
### Weekly cycle
1) Jester posts a weekly “vote post” with options **1–5**
2) People comment a number (or text containing a number)
3) After **24 hours**, votes are counted
4) Winner becomes a **change request**
5) Agent attempts to implement it, then commits/pushes

### Voting rules (exact)
A vote counts only if:
- comment contains **exactly one** digit from 1–5 (or a clear number reference that can be reduced to a single choice)
- user has not already voted on that post

Vote does NOT count if:
- the user includes multiple numbers (“1 2 3”)
- the user votes multiple times (only first valid counts)
- suspicious spam patterns

Anti-spam:
- “2 2 2 2 2” → still counts as **one vote**
- multiple comments by same user → ignored after first

---

## 5) How a winning change becomes code
When a change wins:
1) Jester converts it into a short “spec”
2) Runs checks/tests
3) Generates a patch
4) Applies patch locally
5) Re-runs checks/tests
6) Commits and pushes to GitHub
7) Posts update on X

If it fails:
- can retry with different patch logic
- can revert or open an issue if it cannot safely proceed

---

## 6) Self-healing mode (autonomous fixer)
### Level 1
- detects an error
- retries tasks
- logs diagnostics

### Level 2
- detects error
- runs tests/build
- writes patch
- commits + pushes changes
- logs the result publicly

This is handled by the `agent/*` subsystem.

---

## 7) Repo structure (example)
```
src/
  index.ts               # entry point
  poster.ts              # post generation
  replier.ts             # reply logic
  mentions.ts            # reading mentions
  memoryStore.ts         # memory persistence
  openaiClient.ts        # optional legacy compatibility
  xClient.ts             # X API wrapper

agent/
  watch.ts               # scheduler loop
  fixer.ts               # autonomous repair loop
  runTests.ts            # health checks / build checks
  patch.ts               # code patch generation
  github.ts              # commit/push integration
```

---

## 8) Scheduler (watch loop)
Typical schedule examples:
- Posts: every 2 hours
- Replies: every 6 hours
- Metrics: every 15 minutes

You can increase frequency, but be mindful of:
- X rate limits
- account trust / spam detection
- your X subscription tier
- Groq usage & quotas

---

## 9) Deployment (24/7)
### Option A — VPS (recommended)
Runs even if your PC is off.
Examples: Hetzner, DigitalOcean, AWS Lightsail, Contabo.

**Basic steps**
1) rent VPS
2) install Node.js
3) clone repo
4) add `.env`
5) run via `pm2` or systemd
6) keep logs and restarts

### Option B — GitHub Actions
Runs even if your PC is off.
But:
- schedule is not guaranteed to be exact
- workflow usage limits apply
- not ideal for very frequent tasks

---

## 10) Security model (read before giving write tokens)
If you give the agent a GitHub token with write permission:
- it can push commits,
- it can change workflows,
- it can alter behavior.

**Best practices**
- least-privilege token
- restrict repo scope
- branch protection rules
- optional PR requirement
- keep secrets in GitHub secrets
- do not use admin tokens

Autonomy is powerful — but permission mistakes can lead to account compromise.

---

## 11) FAQ
### “Why does Stable Diffusion truncate prompt?”
CLIP text encoder is limited (often 77 tokens). Use shorter prompt, stronger key phrases, and clean negative prompts.

### “Why are generations off-topic?”
SD can drift when prompt is vague/long. Use:
- stronger anchors
- fewer tokens
- consistent style constraints
- reference images (if supported)

### “Does this require OpenAI?”
No — designed for **Groq**.

---

🐸 **ribbit.**
