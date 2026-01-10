import fs from "fs";
import path from "path";
import { runTests } from "./runTests";
import { parsePatchToFiles, applyPatchFiles } from "./patch";
import { gitCommitAndPush } from "./github";

const PROJECT_ROOT = process.cwd();
const ERROR_FILE = path.join(PROJECT_ROOT, "agent", "error.log");

function loadError(): string {
  if (process.env.AGENT_ERROR) return process.env.AGENT_ERROR;

  if (fs.existsSync(ERROR_FILE)) {
    return fs.readFileSync(ERROR_FILE, "utf8");
  }

  return "No error info provided. Try running tests.";
}

async function callGroqFix(errorText: string, context: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY");

  const body = {
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    max_tokens: 2500,
    messages: [
      {
        role: "system",
        content: `
You are a senior TypeScript engineer.
Your job: fix the project by generating a patch as unified diff.
Rules:
- Output ONLY a unified diff patch (no explanations).
- Use complete file replacement in patch (write full updated file content).
- Change as little as possible.
- Ensure tests pass.
Format:
--- a/path
+++ b/path
@@
<full new file content>
`.trim(),
      },
      {
        role: "user",
        content: `
ERROR:
${errorText}

TEST OUTPUT / CONTEXT:
${context}

Generate a patch.
`.trim(),
      },
    ],
  };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;

  if (!text) throw new Error("Groq returned empty patch");

  return text as string;
}

async function main() {
  console.log("🤖 Jester Fixer Agent started...");

  const initial = await runTests();

  if (initial.ok) {
    console.log("✅ Tests already passing. No fix needed.");
    return;
  }

  const errorText = loadError();

  const ctx = `
TEST STDOUT:
${initial.stdout}

TEST STDERR:
${initial.stderr}
  `.trim();

  console.log("❌ Tests failed. Asking Groq for patch...");

  const patch = await callGroqFix(errorText, ctx);

  console.log("📌 Patch received, applying...");

  const patchFiles = parsePatchToFiles(patch);

  if (!patchFiles.length) {
    console.error("❌ No files detected in patch. Patch was:");
    console.error(patch);
    process.exit(1);
  }

  applyPatchFiles(PROJECT_ROOT, patchFiles);

  console.log("🧪 Running tests again...");
  const after = await runTests();

  if (!after.ok) {
    console.error("❌ Fix failed. Tests still failing.");
    console.error(after.stderr);
    process.exit(2);
  }

  console.log("✅ Fix successful. Committing & pushing...");

  await gitCommitAndPush(PROJECT_ROOT, "auto-fix: patch from Groq agent");

  console.log("🎉 Done.");
}

main().catch((e) => {
  console.error("Agent crashed:", e);
  process.exit(1);
});
