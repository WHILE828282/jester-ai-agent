import { getXClient } from "./xClient.js";
import { log } from "../logger.js";

export async function postTweet(text: string): Promise<string> {
  const client = getXClient();
  const rw = client.readWrite;

  const res = await rw.v2.tweet(text);
  log("INFO", "Tweet posted", { tweet_id: res.data.id });
  return res.data.id;
}
