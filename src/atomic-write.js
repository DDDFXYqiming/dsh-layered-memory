import { writeFileSync, renameSync, rmSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { randomUUID } from "node:crypto";

// 不在宿主事件线程内重试或休眠：提交失败直接报告。
export function stageWrite(filePath, content, encoding = "utf8") {
  const tmp = join(dirname(filePath), `.${basename(filePath)}.tmp-${randomUUID()}`);
  try {
    writeFileSync(tmp, content, { encoding, flag: "wx" });
    return tmp;
  } catch (error) {
    rmSync(tmp, { force: true });
    throw error;
  }
}

export function commitStaged(tmp, filePath) {
  try { renameSync(tmp, filePath); }
  finally { rmSync(tmp, { force: true }); }
}

export function atomicWriteFileSync(filePath, content, encoding = "utf8") {
  commitStaged(stageWrite(filePath, content, encoding), filePath);
}
