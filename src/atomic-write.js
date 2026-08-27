// 原子写工具：先写同目录临时文件再 rename 覆盖，宿主进程崩溃/断电时
// 不会留下写一半的 JSON/Markdown。rename 在同一卷内是原子的（Windows
// NTFS 与 POSIX 均如此），且保留目标文件原本的 ACL/owner 语义。
import { writeFileSync, renameSync, rmSync } from "node:fs";
import { join, dirname, basename } from "node:path";

export function atomicWriteFileSync(filePath, content, encoding = "utf8") {
  const dir = dirname(filePath);
  const tmp = join(dir, `.${basename(filePath)}.tmp-${process.pid}-${Date.now()}`);
  try {
    writeFileSync(tmp, content, encoding);
    renameSync(tmp, filePath);
  } catch (err) {
    try { rmSync(tmp, { force: true }); } catch { /* 清理失败不掩盖原错误 */ }
    throw err;
  }
}
