export function normalizeWhitespace(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

export function ensureRibbit(text: string) {
  const t = text.trim();
  if (/(ribbit\.?$)/i.test(t)) return t;
  return t.endsWith(".") ? `${t} ribbit.` : `${t}. ribbit.`;
}
