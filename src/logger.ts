export type LogLevel = "INFO" | "WARN" | "ERROR";

export function log(level: LogLevel, message: string, meta?: Record<string, any>) {
  const line = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta || {})
  };
  console.log(JSON.stringify(line));
}
