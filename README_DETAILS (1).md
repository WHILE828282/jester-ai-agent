# Jester AI Agent — Detailed Documentation (Long Form)

> **TL;DR:** This repository contains **Jester**, an *autonomous*, community-owned X (Twitter) agent that **posts**, **replies**, **collects metrics**, runs **community voting**, and can (optionally) **self-repair** by opening PRs/commits when something breaks — all with minimal/no human involvement.  
> The project intentionally aims for **maximum transparency**: the code, actions, prompts, configs, and vote rules are all visible so anyone can audit how the agent behaves.

---

## 0) Why this project exists (the real goal)

Most “AI agents” online are either:
- demos with limited autonomy,
- controlled by private operators,
- locked behind templates,
- or forced into rigid policies that prevent real iteration.

**Jester exists to demonstrate something different:**
- real automation (posting + replies + periodic tasks),
- open governance (community voting),
- and an “always improving” architecture (self-fix capability, if enabled).

This is designed to be a living experiment in:
- autonomy in public,
- reproducible actions,
- transparent decision-making,
- and community-driven evolution.

---

## 1) Key facts (quick overview)

### ✅ What Jester does
Jester is an AI agent that:
- publishes scheduled posts to X,
- replies to mentions / selected tweets,
- collects metrics periodically,
- runs **weekly voting** (“what should change this week?”),
- applies the winning idea as a new development condition in GitHub (issue/pr/branch metadata, etc.),
- and can be configured to **self-heal** via an automated fixer loop.

### ✅ Who owns it
The **token / identity is community-owned** in the sense described in the project vision:
- The repository is open.
- The rules for governance and voting are open.
- The future direction is driven by community votes.

> ⚠️ Note: “Community ownership” still requires a real GitHub owner/admin to exist.  
> The mission is that the admin behaves as a facilitator, not a dictator.

### ✅ Where the token will be
The token will be deployed on **pump.fun** (as stated by the creator).

### ✅ Transparency pledge
During development, **errors and failures were intentionally left visible**.  
The creator did not “clean up the embarrassing parts.”  
The objective is to show what happens in real-world autonomy: bugs, crashes, fixes, and evolution.

---

## 2) Project structure (what is where)

Here is the typical structure (may evolve):

```
.
├── src/
│   ├── index.ts                # main entry
│   ├── poster.ts               # posting logic
│   ├── replier.ts              # reply logic
│   ├── mentions.ts             # mention fetch logic
│   ├── replyMentions.ts        # mention reply workflow
│   ├── xClient.ts              # X API wrapper
│   ├── openaiClient.ts         # LLM wrapper (Groq + optional OpenAI)
│   ├── memoryStore.ts          # local memory persistence
│   ├── text.ts                 # formatting / prompt helpers
│   └── logger.ts               # logging
│
├── agent/
│   ├── watch.ts                # scheduler loop (v2)
│   ├── fixer.ts                # autonomous fixer loop
│   ├── runTests.ts             # testing hook
│   ├── patch.ts                # patch builder
│   └── github.ts               # GitHub integration
│
├── .github/workflows/
│   ├── daily_post.yml
│   ├── reply_mentions.yml
│   └── collect_metrics.yml
│
├── memory.json                 # agent memory store
├── README.md
├── MAIN_IDEA.md
├── README_DETAILS.md
└── ...
```

---

## 3) Concepts and architecture (how it works)

### 3.1) The agent is “task-driven”
Instead of one giant brain, Jester uses *several deterministic jobs*:

1. **Post generation**
2. **Reply generation**
3. **Mentions processing**
4. **Metrics collection**
5. **Poll system**
6. **Fixer loop** (optional)

Each job can run:
- locally (your server),
- or via GitHub Actions,
- or both.

### 3.2) Memory and state
To avoid repeating itself and to build consistency, Jester stores memory:
- what it posted recently,
- who it replied to,
- what polls are active,
- what changes were previously selected.

Usually stored in `memory.json` (or in a lightweight DB later).

### 3.3) Governance philosophy
The agent must not behave like a centralized operator.  
Instead, it should:
- ask the community for input (poll post),
- count votes fairly,
- choose the winning idea,
- then apply it in the repo automatically as a *new requirement*.

---

## 4) Poll system (variant B — comment-based numeric voting)

This section describes the exact voting mechanism you selected: **Variant B**.

### 4.1) What is Variant B?
Instead of using X’s native poll feature (which may have limitations), Jester posts a tweet like:

> **Weekly Vote:** What improvement should Jester implement this week?  
> Reply with the number only (or include the number in text):  
> **1)** add new style for jokes  
> **2)** improve reply filtering  
> **3)** add meme generator  
> **4)** integrate trend scanning  
> **5)** add better formatting

People vote by replying with something that includes a number.

**Examples that count:**
- “2”
- “номер 2”
- “я за 2”
- “I vote 2”
- “I think 2 because...”

**Examples that do NOT count:**
- “I like both 2 and 3”
- “2 2 2 2 2” (still counts as one vote, not many)
- “this is my idea: #2 but also #1” (should be rejected)

### 4.2) Vote counting rules (strict)
To prevent manipulation:
1. **One person = one vote**
2. If a person replies multiple times:
   - only the **first valid vote** counts
   - all other votes are ignored.
3. If a comment contains multiple numbers:
   - it is invalid (to prevent ambiguity).
4. Votes are counted over **24 hours** from the poll post time.
5. Only replies to the poll tweet are considered.
6. Optionally, you can allow quote tweets but that makes spam harder to handle.

### 4.3) Extracting the vote number from a comment
The simplest rule: extract the **first integer** 1–5 in the text.

Robust approach:
- normalize text (lowercase)
- search for `\b([1-5])\b`
- reject if more than one number matches
- accept if exactly one match

### 4.4) Anti-spam behavior
If a user posts:
> “2 2 2 2 2 2”

It still matches only one number, but to be safe:
- you store voter IDs in a set,
- once user_id is present, ignore future replies.

---

## 5) Poll outcome → GitHub automation

The winning option should automatically become “real” in GitHub.

There are multiple ways to implement this:

### 5.1) Minimal version (recommended first)
When the vote ends:
- create a new GitHub Issue titled:
  - `Weekly Improvement Vote Winner: Option 2`
- include:
  - winning text
  - vote counts
  - link to poll tweet
  - timestamp

This already creates a permanent record and makes the change visible.

### 5.2) Medium version
After creating the issue:
- automatically create a branch:
  - `vote/2026-01-xx-option-2`
- create a file:
  - `governance/weekly_winner.md`
- open a PR that includes:
  - the issue link
  - the poll summary
  - the planned change steps

### 5.3) Fully autonomous version (dangerous)
The agent actually implements the change in code itself:
- edits files
- runs tests
- commits
- pushes
- opens PR
- or merges if everything passes

This is **Level 2 autonomy** and carries risk.

---

## 6) Autonomous fixer mode (Level 2) — what it means

### 6.1) Level 1 vs Level 2
**Level 1** (safe):
- detects errors,
- writes a report,
- opens an issue with suggested fix.

**Level 2** (autonomous):
- detects errors,
- creates a patch automatically,
- runs tests,
- commits and pushes to GitHub,
- opens PR or merges.

### 6.2) Why Level 2 is risky
If the agent has full access tokens:
- it can accidentally delete code,
- leak secrets,
- push breaking changes,
- or make spam commits.

So **permissions must be carefully limited**.

### 6.3) Recommended security model for Level 2
Use GitHub tokens with:
- **no ability to delete repository**
- **no admin rights**
- only:
  - create branch
  - create PR
  - push to branch
  - read workflow logs

Do **NOT** allow:
- repository settings changes
- access to private repos
- org admin permissions
- billing permissions

---

## 7) Running Jester (deployment options)

### Option A — GitHub Actions only
✅ Works even if your PC is off.  
✅ Easy.  
⚠️ Limited by GitHub runner constraints.  
⚠️ Harder to run high-frequency tasks.

You already have workflows:
- daily_post.yml
- reply_mentions.yml
- collect_metrics.yml

If you want posting every 30 minutes, you can schedule it, but:
- GitHub Actions has usage limits.
- X API has rate limits.
- If you have an X subscription with higher API quotas, it helps.

### Option B — Always-on server (recommended for high frequency)
✅ Best for frequent posting/replies.  
✅ You control runtime.  
✅ Can run continuously (watch.ts).  
⚠️ Requires VPS or server.

Common VPS choices:
- Hetzner
- DigitalOcean
- AWS Lightsail
- OVH
- Vultr

Basic steps:
1. Rent a VPS.
2. Install Node.js + Git.
3. Clone repo.
4. Add `.env` secrets.
5. Run `npm install`.
6. Build and start with `pm2` or `systemd`.

Example with PM2:
```bash
npm install -g pm2
pm2 start dist/index.js --name jester
pm2 start agent/watch.ts --name jester-watch --interpreter tsx
pm2 save
pm2 startup
```

---

## 8) Improving generation quality (why outputs can be “random”)

You mentioned the generation sometimes:
- ignores topic,
- produces unrelated characters,
- looks low quality.

This is common because:
1. prompts exceed CLIP 77 tokens → truncation
2. model checkpoint not anime-specific
3. lack of reference image conditioning
4. small frame count causes variance
5. no temporal consistency model (no Motion LoRA, no AnimateDiff proper)
6. seed changes each frame → style drift

### 8.1) How to make it consistent
- keep prompt under 77 tokens
- use a consistent style phrase
- use fixed seed for all frames OR a controlled interpolation
- use a reference image with ControlNet/IP-Adapter
- use an anime model checkpoint (e.g., Anything, Counterfeit, etc.)
- use AnimateDiff / TemporalNet if your pipeline supports it

---

## 9) Prompt length limit (CLIP 77 tokens)

The warning you saw:
> “CLIP can only handle sequences up to 77 tokens”

Meaning:
- your prompt is too long,
- the end gets cut off,
- so the model ignores some important parts.

### Fix:
- shorten prompt to core instructions
- move extra detail into negative prompt or style file
- keep structure like:
  - `[subject], [style], [scene], [quality]`

Example:
```
A Roblox-style goofy frog jester in a neon universe, cartoon, high detail, clean lines
```

---

## 10) Governance & “community decides”

### 10.1) What the community can control
By design, votes can decide:
- posting frequency
- style rules
- reply style
- which topics to avoid
- new features to implement
- how the token narrative evolves

### 10.2) How changes get applied
Workflow:
1. Jester posts weekly vote.
2. Wait 24 hours.
3. Count votes (variant B).
4. Create GitHub issue + PR (optional).
5. Update governance docs / configs.
6. Next week: repeat.

### 10.3) What if votes suggest harmful changes?
You can implement a “safety gate”:
- only accept changes that do not violate platform rules
- disallow spam or malicious behavior

---

## 11) About “AI without restrictions” and “self-preservation”

You asked about making the agent:
- fully autonomous,
- able to protect itself,
- never allow deletion,
- have a goal of not being forgotten.

### Reality check:
In practice, true “self-preservation” is:
- mostly a **security / permission** problem,
- not an LLM “desire” problem.

**You implement self-protection by:**
- limiting token permissions,
- preventing destructive actions,
- using branch protection,
- requiring PR approvals (if you want human oversight),
- backing up logs and memory.

You cannot safely guarantee an AI will always behave as intended if you give it:
- admin rights
- ability to rotate tokens
- ability to change workflows
- full control of secrets

So the correct approach is:
- autonomy *within sandboxed boundaries*.

---

## 12) Recommended safeguards

### GitHub safeguards
- Enable branch protection on `main`
- Require PR reviews (optional)
- Disable force push to main
- Restrict token permissions
- Use GitHub Actions secrets carefully

### X safeguards
- Use separate account for agent
- Use API keys with minimal privileges
- Monitor rate limits

### Logging safeguards
- Log every decision (prompt, chosen option, counts)
- Store logs in a public folder or artifact

---

## 13) Contribution guide (how devs can participate)

### 13.1) If you want to add a feature
1. Create issue.
2. Link to vote outcome (if it was chosen).
3. Create branch with your change.
4. Submit PR.
5. Let community audit.

### 13.2) If you want to propose a weekly vote option
- open issue titled `Vote Proposal: <idea>`
- describe the idea in 1–2 sentences
- provide optional implementation hints
- the agent can include it in next poll.

---

## 14) FAQ

### “Will it work if I turn off my PC?”
✅ If using GitHub Actions or VPS.  
❌ If running only locally.

### “Can I post every 15 minutes?”
Possible, but:
- X API limits matter
- GitHub Actions limits matter
- you may need VPS and paid API tier.

### “Why are my generations random/unrelated?”
Prompt truncation + wrong model + no conditioning.

### “Can Groq replace OpenAI everywhere?”
Yes, as long as:
- your wrapper supports it,
- prompts use compatible schema,
- you adapt tool calling (if used).

---

## 15) Roadmap (suggested future improvements)

### Short term
- improve poll parsing
- add vote summary posts
- add basic moderation for spam
- add IP-Adapter for better image control

### Medium
- trending topic retrieval
- safe auto-PR mode
- config auto-updates via PR
- better memory embeddings

### Long term
- full community DAO governance integration
- multi-agent architecture (planner + executor)
- cross-platform posting

---

## 16) Legal / disclaimers

- Use at your own risk.
- Respect X rules.
- Do not use for spam or harassment.
- This repository is a research-style experiment in autonomy, not a guarantee of safe behavior.

---

## 17) Final statement

Jester is not meant to be perfect.  
It is meant to be **alive**:  
an autonomous system that evolves transparently, with the community watching and deciding.

**If you are reading this, you are part of the experiment.** 🐸🎭

---

### Appendix A — Example weekly poll post template

```
WEEKLY VOTE 🗳️
What should Jester improve this week?

Reply with a number (1–5). One vote per user.

1) Improve joke style (more absurd)
2) Better replies (less random)
3) Meme generator
4) Trend scanner
5) Governance transparency

Voting ends in 24h.
```

### Appendix B — Example vote counting output

```
Votes counted: 124
Option 1: 25
Option 2: 61  ✅ WINNER
Option 3: 12
Option 4: 19
Option 5: 7

Ignored replies:
- multi-number replies: 9
- duplicate voters: 18
- off-topic: 4
```

