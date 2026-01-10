export function extractVote(text: string, maxOption = 5): number | null {
  // ищем цифру 1..maxOption в тексте
  const match = text.match(new RegExp(`\\b([1-${maxOption}])\\b`));
  if (!match) return null;
  return parseInt(match[1], 10);
}
