export type VoteResult = {
  winner: number;
  counts: Record<number, number>;
  voters: number;
};

export function extractFirstVote(text: string): number | null {
  // Ищем первую цифру 1–5 где угодно:
  // "я за номер 2 потому что..." -> 2
  // "2 2 2 2" -> 2 (один голос)
  const m = text.match(/[1-5]/);
  if (!m) return null;
  return parseInt(m[0], 10);
}

export function tallyVotes(
  comments: { user_id: string; text: string }[],
  maxOption: number = 5
): VoteResult {
  const seen = new Set<string>(); // чтобы 1 юзер = 1 голос
  const counts: Record<number, number> = {};
  for (let i = 1; i <= maxOption; i++) counts[i] = 0;

  for (const c of comments) {
    if (!c.user_id) continue;
    if (seen.has(c.user_id)) continue; // игнорируем все последующие комменты от того же юзера
    const v = extractFirstVote(c.text);
    if (!v) continue;
    if (v < 1 || v > maxOption) continue;
    seen.add(c.user_id);
    counts[v] += 1;
  }

  let winner = 1;
  let best = -1;
  for (let i = 1; i <= maxOption; i++) {
    if (counts[i] > best) {
      best = counts[i];
      winner = i;
    }
  }

  return { winner, counts, voters: seen.size };
}
