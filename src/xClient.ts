import { TwitterApi } from "twitter-api-v2";
import { CONFIG } from "./config.js";

export const xClient = new TwitterApi({
  appKey: CONFIG.X_APP_KEY,
  appSecret: CONFIG.X_APP_SECRET,
  accessToken: CONFIG.X_ACCESS_TOKEN,
  accessSecret: CONFIG.X_ACCESS_SECRET,
}).readWrite;
