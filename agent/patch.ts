import fs from "fs";
import path from "path";

/**
 * Очень простой unified-diff patcher.
 * Поддерживает только замену целого файла (не по строкам), если model прислал полный content.
 *
 * Формат:
 * --- a/path/to/file.ts
 * +++ b/path/to/file.ts
 * @@
 * <полный новый файл>
 *
 * ✅ Это надежнее, чем пытаться делать line-by-line patch.
 */

export type PatchFile = {
  filePath: string;
  content: string;
};

export function parsePatchToFiles(patch: string): PatchFile[] {
  const blocks = patch.split(/^--- /m).filter(Boolean);

  const files: PatchFile[] = [];

  for (const block of blocks) {
    // block начинается с "a/file"
    const lines = block.split("\n");
    const first = lines[0].trim(); // "a/xxx"
    const filePath = first.replace(/^a\//, "").trim();

    // ищем строку "+++"
    const plusIndex = lines.findIndex((l) => l.startsWith("+++ "));
    if (plusIndex === -1) continue;

    // после @@ идет полный content
    const atIndex = lines.findIndex((l) => l.startsWith("@@"));
    if (atIndex === -1) continue;

    const newContent = lines.slice(atIndex + 1).join("\n").trimStart();

    files.push({
      filePath,
      content: newContent,
    });
  }

  return files;
}

export function applyPatchFiles(projectRoot: string, patchFiles: PatchFile[]) {
  for (const pf of patchFiles) {
    const fullPath = path.join(projectRoot, pf.filePath);
    const dir = path.dirname(fullPath);

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, pf.content, "utf8");

    console.log(`[PATCH] Updated: ${pf.filePath}`);
  }
}
