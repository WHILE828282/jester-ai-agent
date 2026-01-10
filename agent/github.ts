import { spawn } from "child_process";

function runGit(args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, { cwd, stdio: ["ignore", "pipe", "pipe"] });

    let out = "";
    let err = "";

    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));

    child.on("close", (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(`git ${args.join(" ")} failed: ${err.trim()}`));
    });
  });
}

export async function gitCommitAndPush(
  cwd: string,
  message: string
): Promise<void> {
  console.log("[GIT] add .");
  await runGit(["add", "."], cwd);

  console.log("[GIT] status");
  const status = await runGit(["status", "--porcelain"], cwd);

  if (!status.trim()) {
    console.log("[GIT] No changes to commit.");
    return;
  }

  console.log("[GIT] commit");
  try {
    await runGit(["commit", "-m", message], cwd);
  } catch (e: any) {
    // если нечего коммитить
    console.log("[GIT] Commit skipped:", e.message);
    return;
  }

  console.log("[GIT] push");
  await runGit(["push"], cwd);

  console.log("[GIT] ✅ Pushed successfully");
}
