import { getXClient } from "./xClient.js";
import { log } from "../logger.js";

export async function replyToTweet(tweetId: string, replyText: string): Promise<string> {
  const client = getXClient();
  const rw = client.readWrite;

  const res = await rw.v2.reply(replyText, tweetId);
  log("INFO", "Replied to mention", { reply_id: res.data.id, in_reply_to: tweetId });
  return res.data.id;
}
