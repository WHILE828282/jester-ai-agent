import { MemoryStore } from "../memoryStore.js";
import { postTweet } from "../poster.js";
import { replyToTweet } from "../replier.js";
import { log } from "../logger.js";

import { PollOption, PollState } from "./types.js";
import { countVotesForTweet, pickWinner } from "./voteCounter.js";
import { applyOptionToRules, loadRulesFile } from "./rulesEngine.js";

import { commitAndPush } from "../../agent/github.js"; // используй твой agent/github.ts

function now() { return Date.now(); }
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

function buildPollTweet(options: PollOption[]) {
  const lines = options.map(o => `${o.id}) ${o.title}`);
  return [
    "WEEKLY CHANGE VOTE 👇",
    "Write ONE number (1–5) in comments. Only 1 vote per account. 24h window.",
    "",
    ...lines,
    "",
    "ribbit."
  ].join("\n");
}

// ✅ важное: options тут ты сам настраиваешь (что именно можно удалить/добавить)
function getDefaultOptions(): PollOption[] {
  return [
    {
      id: 1,
      title: "ADD rule: never apologize",
      action: "add_rule",
      key: "no_apologies",
      text: "Never apologize. If you must acknowledge, do it with mockery."
    },
    {
      id: 2,
      title: "REMOVE rule: never apologize",
      action: "remove_rule",
      key: "no_apologies"
    },
    {
      id: 3,
      title: "REPLACE rule: tone becomes even harsher",
      action: "replace_rule",
      key: "tone_core",
      text: "Tone: savage, blunt, provocative. No corporate softness. Keep it short."
    },
    {
      id: 4,
      title: "ADD rule: always include 1 punchline max",
      action: "add_rule",
      key: "one_punchline",
      text: "Only one punchline per tweet. No double jokes. No explanations."
    },
    {
      id: 5,
      title: "REMOVE rule: one punchline max",
      action: "remove_rule",
      key: "one_punchline"
    }
  ];
}

export async function runPollMode() {
  const store = new MemoryStore();
  const mem = store.getMemory() as any;

  if (!mem.poll) mem.poll = {};
  const poll: PollState = mem.poll;

  // 1) Если опрос ещё не создан — создаём
  if (!poll.pollTweetId) {
    const options = getDefaultOptions();
    const tweetText = buildPollTweet(options);

    log("INFO","Posting poll tweet");
    const id = await postTweet(tweetText);

    poll.pollTweetId = id;
    poll.pollCreatedAt = now();
    poll.pollOptions = options;

    store.setMemory(mem);
    await store.commitMemory("poll: created");

    log("INFO","Poll created", { id });
    return;
  }

  // 2) Если создан, но 24 часа ещё не прошло — ничего не делаем
  const age = now() - (poll.pollCreatedAt || 0);
  if (age < ONE_DAY) {
    log("INFO","Poll still running", { pollTweetId: poll.pollTweetId, hoursPassed: (age/ONE_HOUR).toFixed(2) });
    return;
  }

  // 3) Если уже есть lastResult — значит уже обработали
  if (poll.lastResult) {
    log("INFO","Poll already finalized", { pollTweetId: poll.pollTweetId, winner: poll.lastResult.winnerId });
    return;
  }

  // 4) Подсчитываем голоса
  const pollId = poll.pollTweetId!;
  const { counts, totalVoters } = await countVotesForTweet(pollId);
  const winnerId = pickWinner(counts);

  const options = poll.pollOptions || [];
  const winnerOpt = options.find(o => o.id === winnerId);

  if (!winnerOpt) {
    log("ERROR","Winner option not found", { winnerId });
    // сбрасываем чтобы можно было создать новый poll
    poll.pollTweetId = undefined;
    poll.pollCreatedAt = undefined;
    poll.pollOptions = undefined;
    store.setMemory(mem);
    await store.commitMemory("poll: reset due to missing option");
    return;
  }

  // 5) Применяем изменение в rules.json
  let patch: any = null;
  try {
    patch = applyOptionToRules(winnerOpt);
  } catch (e: any) {
    log("ERROR","Failed applying rule patch", { error: e?.message });
  }

  poll.lastResult = {
    winnerId,
    counts,
    totalVoters,
    appliedAt: now(),
    appliedPatch: patch || undefined,
  };

  // 6) Пишем результат в memory + коммитим память
  store.setMemory(mem);
  await store.commitMemory("poll: finalized");

  // 7) Коммитим rules.json + governance лог (опционально)
  // Создадим лог-файл о победителе
  const logPath = `governance/poll_${new Date().toISOString().slice(0,10)}.md`;
  const fs = await import("fs");
  const text = [
    `# Weekly Vote Result (${new Date().toISOString().slice(0,10)})`,
    ``,
    `Poll tweet: https://x.com/i/web/status/${pollId}`,
    ``,
    `Winner: ${winnerId}) ${winnerOpt.title}`,
    ``,
    `Counts:`,
    `- 1: ${counts[1] || 0}`,
    `- 2: ${counts[2] || 0}`,
    `- 3: ${counts[3] || 0}`,
    `- 4: ${counts[4] || 0}`,
    `- 5: ${counts[5] || 0}`,
    ``,
    `Total voters: ${totalVoters}`,
    ``,
    `Applied patch:`,
    "```json",
    JSON.stringify(patch, null, 2),
    "```",
    ``,
    `Rules after:`,
    "```json",
    JSON.stringify(loadRulesFile(), null, 2),
    "```",
  ].join("\n");

  fs.mkdirSync("governance", { recursive: true });
  fs.writeFileSync(logPath, text, "utf-8");

  // commit + push
  await commitAndPush(`poll: apply winner #${winnerId}`, [
    "data/rules.json",
    "data/memory.json",
    logPath,
  ]);

  // 8) Отвечаем под опросом итогом
  const resultMsg = [
    `VOTE CLOSED. Winner: #${winnerId} — ${winnerOpt.title}.`,
    `Voters: ${totalVoters}.`,
    `Rules updated + committed to repo.`,
    `ribbit.`
  ].join(" ");

  await replyToTweet(pollId, resultMsg);

  // 9) Сбрасываем poll, чтобы на следующей неделе создать новый
  poll.pollTweetId = undefined;
  poll.pollCreatedAt = undefined;
  poll.pollOptions = undefined;

  store.setMemory(mem);
  await store.commitMemory("poll: reset for next cycle");

  log("INFO","Poll cycle completed");
}
