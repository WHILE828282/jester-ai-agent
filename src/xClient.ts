import { TwitterApi } from "twitter-api-v2";
import { CONFIG } from "./config.js";
import { log } from "./logger.js";

let _client: TwitterApi | null = null;

function buildClient(): TwitterApi {
  const appKey = (CONFIG as any).X_APP_KEY ?? process.env.X_APP_KEY ?? "";
  const appSecret = (CONFIG as any).X_APP_SECRET ?? process.env.X_APP_SECRET ?? "";
  const accessToken = (CONFIG as any).X_ACCESS_TOKEN ?? process.env.X_ACCESS_TOKEN ?? "";
  const accessSecret = (CONFIG as any).X_ACCESS_SECRET ?? process.env.X_ACCESS_SECRET ?? "";

  // Без утечки секретов — только длины
  log("INFO", "X auth present (lengths)", {
    X_APP_KEY_len: String(appKey).length,
    X_APP_SECRET_len: String(appSecret).length,
    X_ACCESS_TOKEN_len: String(accessToken).length,
    X_ACCESS_SECRET_len: String(accessSecret).length,
  });

  try {
    return new TwitterApi({
      appKey: String(appKey),
      appSecret: String(appSecret),
      accessToken: String(accessToken),
      accessSecret: String(accessSecret),
    });
  } catch (e: any) {
    // twitter-api-v2 кидает "Invalid consumer tokens" именно тут
    throw new Error(
      `X client init failed: ${e?.message ?? String(e)}. ` +
        `Check X_APP_KEY/X_APP_SECRET and X_ACCESS_TOKEN/X_ACCESS_SECRET in GitHub Secrets.`
    );
  }
}

export function getXClient(): TwitterApi {
  if (_client) return _client;
  _client = buildClient();
  return _client;
}

// Чтобы не менять остальной код, даём "xClient" как прокси,
// инициализируется только при первом обращении xClient.v2 / xClient.v1 и т.д.
export const xClient: TwitterApi = new Proxy({} as TwitterApi, {
  get(_t, prop) {
    const c = getXClient() as any;
    return c[prop];
  },
}) as TwitterApi;
