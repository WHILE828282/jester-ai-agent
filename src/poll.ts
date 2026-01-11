import fs from "fs";
import path from "path";
import { xClient } from "./xClient.js";
import { log } from "./logger.js";
import { CONFIG } from "./config.js";
import { tallyVotes } from "./pollVote.js";
import { applyWinningOption, loadPollSpec, savePollSpec, PollSpec } from "./pollApply.js";
import { MemoryStore } from "./memoryStore.js";
import { normalizeWhitespace } from "./text.js";
import { gitCommitAndPush } from "./pollCommit.js";

type PollState = {
  pollId: string;
  tweetId: string;
  createdAt: number;
  closesAt: number;
  applied?: boolean;
  winner?: number;
  counts?: Record<number, number>;
  voters?: number;
};

function loadState(): PollState | null {
  const fp = path.resolve(CONFIG.paths.pollStateFile);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
}

function saveState(state: PollState) {
  const fp = path.resolve(CONFIG.paths.pollStateFile);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(state, null, 2), "utf-8");
}

function now() {
  return Date.now();
}

function ensureSpecExists() {
  const fp = path.resolve(CONFIG.paths.pollSpecFile);
  if (fs.existsSync(fp)) return;

  const spec: PollSpec = {
    pollId: `weekly_${new Date().toISOString().slice(0, 10)}`,
    createdAt: now(),
    options: [
      {
        num: 1,
        title: "Remove rule: No apologies",
        action: { type: "delete_rule", ruleId: "no_apology" }
      },
      {
        num: 2,
        title: "Disable rule: No disclaimers",
        action: { type: "disable_rule", ruleId: "no_disclaimer" }
      },
      {
        num: 3,
        title: "Add rule: Allow hashtags sometimes",
        action: {
          type: "add_rule",
          payload: {
            bucket: "style",
            rule: {
              id: "allow_hashtags",
              title: "Allow hashtags (soft)",
              enabled: true,
              type: "regex",
              value: "#",
              severity: "warn"
            }
          }
        }
      },
      {
        num: 4,
        title: "Increase max tweet length to 320",
        action: { type: "set_value", path: "constraints.maxTweetChars", value: 320 }
      },
      {
        num: 5,
        title: "No changes this week",
        action: { type: "noop" }
      }
    ]
  };

  savePollSpec(spec);
}

function buildPollTweet(spec: PollSpec) {
  const lines: string[] = [];
  lines.push("WEEKLY GOV VOTE.");
  lines.push("Pick ONE option. Comment a number (1-5).");
  lines.push("1 vote per account. Window: 24h.");
  lines.push("");
  for (const o of spec.options) lines.push(`${o.num}) ${o.title}`);
  lines.push("");
  lines.push("ribbit.");

  return normalizeWhitespace(lines.join("\n")).slice(0, 260);
}

async function postPollTweet(): Promise<PollState> {
  ensureSpecExists();
  const spec = loadPollSpec();
  const tweetText = buildPollTweet(spec);

  log("INFO", "Posting weekly poll tweet");
  const res = await xClient.v2.tweet(tweetText);
  const tweetId = res.data.id;

  const createdAt = now();
  const closesAt = createdAt + CONFIG.poll.voteWindowHours * 60 * 60 * 1000;

  const state: PollState = {
    pollId: spec.pollId,
    tweetId,
    createdAt,
    closesAt,
    applied: false
  };

  saveState(state);
  log("INFO", "Poll posted", { tweetId, closesAt });
  return state;
}

async function fetchRepliesForTweet(tweetId: string) {
  const q = `conversation_id:${tweetId} is:reply`;
  const max = 100;

  const replies: { user_id: string; text: string }[] = [];
  let nextToken: string | undefined = undefined;

  for (let page = 0; page < 5; page++) {
    const resp: any = await xClient.v2.search(q, {
      max_results: max,
      next_token: nextToken,
      "tweet.fields": ["author_id", "created_at"],
    } as any);

    const data = resp?.data?.data ?? resp?.data ?? [];
    for (const t of data) replies.push({ user_id: t.author_id, text: t.text });

    nextToken = resp?.meta?.next_token;
    if (!nextToken) break;
  }

  return replies;
}

function writeGovernanceLog(state: PollState) {
  const dir = path.resolve(CONFIG.paths.governanceDir);
  fs.mkdirSync(dir, { recursive: true });

  const fp = path.join(dir, `poll_${state.pollId}.md`);
  const lines: string[] = [];
  lines.push(`# Poll Result — ${state.pollId}`);
  lines.push(`- Tweet: ${state.tweetId}`);
  lines.push(`- Created: ${new Date(state.createdAt).toISOString()}`);
  lines.push(`- Closed: ${new Date(state.closesAt).toISOString()}`);
  lines.push(`- Voters counted: ${state.voters ?? 0}`);
  lines.push(`- Winner: ${state.winner ?? "N/A"}`);
  lines.push(`- Counts:`);
  if (state.counts) {
    for (const k of Object.keys(state.counts)) {
      lines.push(`  - ${k}: ${state.counts[parseInt(k, 10)]}`);
    }
  }
  fs.writeFileSync(fp, lines.join("\n"), "utf-8");
  return fp;
}

async function closePollAndApply(state: PollState) {
  log("INFO", "Closing poll", { tweetId: state.tweetId });

  const replies = await fetchRepliesForTweet(state.tweetId);
  const result = tallyVotes(replies, 5);

  state.winner = result.winner;
  state.counts = result.counts;
  state.voters = result.voters;

  // Apply change (rules.json updated)
  const apply = applyWinningOption(result.winner);

  state.applied = true;
  saveState(state);

  // governance log
  const govFile = writeGovernanceLog(state);

  // memory meta
  const store = new MemoryStore();
  store.setMeta("last_poll", {
    pollId: state.pollId,
    tweetId: state.tweetId,
    winner: state.winner,
    counts: state.counts,
    voters: state.voters,
    applied: apply
  });

  // tweet summary reply
  const summary = `Poll closed. Winner: ${state.winner}. Votes: ${Object.entries(result.counts)
    .map(([k, v]) => `${k}:${v}`)
    .join(" ")} ribbit.`;

  try {
    await xClient.v2.tweet(summary.slice(0, 260), { reply: { in_reply_to_tweet_id: state.tweetId } } as any);
  } catch (e: any) {
    log("WARN", "Failed to post poll summary reply", { error: String(e?.message ?? e) });
  }

  // ✅ COMMIT + PUSH
  try {
    const commitRes = gitCommitAndPush({
      message: `poll: ${state.pollId} winner=${state.winner}`,
      addPaths: [
        CONFIG.paths.rulesFile,
        CONFIG.paths.memoryFile,
        CONFIG.paths.pollStateFile,
        CONFIG.paths.pollSpecFile,
        govFile
      ]
    });
    log("INFO", "Poll commit result", commitRes);
  } catch (e: any) {
    log("ERROR", "Failed to commit/push poll results", { error: String(e?.message ?? e) });
  }

  log("INFO", "Poll applied", { winner: state.winner, applied: apply });
}

export async function runPoll() {
  let state = loadState();

  // If no active poll or already applied -> create new
  if (!state || state.applied) {
    state = await postPollTweet();
    return;
  }

  // If still open -> do nothing
  if (now() < state.closesAt) {
    log("INFO", "Poll still open", { closesAt: state.closesAt });
    return;
  }

  // Close + apply
  if (!state.applied) {
    await closePollAndApply(state);
  }
}
