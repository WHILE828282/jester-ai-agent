// agent/fixer.ts
import fs from "fs";
import path from "path";
import { runTests } from "./runTests";
import { parsePatchToFiles, applyPatchFiles } from "./patch";
import { gitCommitAndCreatePR } from "./github";

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
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
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

/* ----------------- Safety helpers ----------------- */

function allowedPath(p: string) {
  // разрешаем патчи только в этих директориях
  const allowed = [/^src\//, /^agent\//, /^data\//];
  const forbidden = [/^\.github\//, /^\.env$/, /^package-lock\.json$/, /^yarn.lock$/];
  if (forbidden.some((rx) => rx.test(p))) return false;
  return allowed.some((rx) => rx.test(p));
}

function looksLikeSecret(s: string) {
  // простая эвристика: common token prefixes / long base64 / GH token
  const re = /(AKIA|AIza|ghp_[A-Za-z0-9]{36}|xox[baprs]-[A-Za-z0-9-]{20,}|-----BEGIN PRIVATE KEY-----|GROQ_API_KEY|GROQ_MODEL|X_APP_SECRET|X_ACCESS_SECRET)/;
  return re.test(s);
}

/* ----------------- Main ----------------- */

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

  console.log("📌 Patch received, parsing...");
  const patchFiles = parsePatchToFiles(patch);

  if (!patchFiles.length) {
    console.error("❌ No files detected in patch. Patch was:");
    console.error(patch);
    process.exit(1);
  }

  // проверяем пути и секреты до применения
  for (const pf of patchFiles) {
    if (!allowedPath(pf.filePath)) {
      console.error("❌ Patch contains modifications to forbidden path:", pf.filePath);
      process.exit(2);
    }
    if (looksLikeSecret(pf.content)) {
      console.error("❌ Patch contains possible secrets (refusing to apply):", pf.filePath);
      process.exit(2);
    }
  }

  // делаем резервную копию изменяемых файлов
  const backupDir = fs.mkdtempSync(path.join(PROJECT_ROOT, "agent", "backup-"));
  const createdFiles: string[] = [];
  const overwrittenFiles: string[] = [];

  for (const pf of patchFiles) {
    const fullPath = path.join(PROJECT_ROOT, pf.filePath);
    const destBackup = path.join(backupDir, pf.filePath);
    const dir = path.dirname(destBackup);
    fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(fullPath)) {
      fs.copyFileSync(fullPath, destBackup);
      overwrittenFiles.push(pf.filePath);
    } else {
      // файл новый
      createdFiles.push(pf.filePath);
    }
  }

  // применяем патч
  console.log("🛠 Applying patch files...");
  applyPatchFiles(PROJECT_ROOT, patchFiles);

  // запускаем тесты
  console.log("🧪 Running tests after patch...");
  const after = await runTests();

  if (!after.ok) {
    console.error("❌ Fix failed. Tests still failing. Reverting changes...");
    // восстановим файлы из бэкапа
    for (const pf of patchFiles) {
      const fullPath = path.join(PROJECT_ROOT, pf.filePath);
      const backed = path.join(backupDir, pf.filePath);
      if (fs.existsSync(backed)) {
        fs.copyFileSync(backed, fullPath);
      } else {
        // новый файл — удалить
        try { fs.unlinkSync(fullPath); } catch {}
      }
    }
    console.error(after.stderr);
    process.exit(2);
  }

  console.log("✅ Fix successful. Creating PR...");

  // commit + create PR
  try {
    const prUrl = await gitCommitAndCreatePR(PROJECT_ROOT, "auto-fix: patch from Groq agent");
    console.log("🎉 PR created:", prUrl);
  } catch (e: any) {
    console.error("❌ Failed to create PR:", e.message || e);
    process.exit(3);
  }

  // cleanup backup
  // (можно оставить для аудита)
  // fs.rmSync(backupDir, { recursive: true, force: true });

  console.log("🎉 Done.");
}

main().catch((e) => {
  console.error("Agent crashed:", e);
  process.exit(1);
});
