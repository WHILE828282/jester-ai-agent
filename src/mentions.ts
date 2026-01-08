import { getXClient } from "./xClient.js";

export type Mention = {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
};

export async function fetchMentionsSince(sinceId?: string, maxResults = 10): Promise<{ mentions: Mention[]; newestId?: string }> {
  const client = getXClient();

  const me = await client.v2.me();
  const userId = me.data.id;

  const mentions = await client.v2.userMentionTimeline(userId, {
    since_id: sinceId,
    max_results: maxResults,
    "tweet.fields": ["created_at", "author_id"],
    expansions: ["author_id"]
  });

  const data: Mention[] = [];
  for await (const t of mentions) {
    data.push({
      id: t.id,
      text: t.text,
      author_id: (t as any).author_id!,
      created_at: (t as any).created_at!
    });
  }

  const newestId = data[0]?.id;
  return { mentions: data, newestId };
}
