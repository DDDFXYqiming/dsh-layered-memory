// 原子写工具：先写同目录临时文件再 rename 覆盖，宿主进程崩溃/断电时
// 不会留下写一半的 JSON/Markdown。rename 在同一卷内是原子的（Windows
// NTFS 与 POSIX 均如此），且保留目标文件原本的 ACL/owner 语义。
import { writeFileSync, renameSync, rmSync } from "node:fs";
import { join, dirname, basename } from "node:path";

const SLEEP_BUF = new Int32Array(new SharedArrayBuffer(4));

/** Windows：rename 覆盖瞬间可能被其他进程的并发读/替换持有目标文件（EPERM/EACCES/
 * EBUSY 是毫秒级瞬态，不是权限配置错误），递增退避+抖动重试；每次退避后回调
 * revalidate()，返回 false 视为基座已被并发改写，放弃本次 rename（返回 conflict）。
 * POSIX rename 恒成功不受影响。调用方负责清理 tmp（本函数 finally 兜底）。 */
export function commitStaged(tmp, filePath, revalidate = () => true) {
  try {
    for (let i = 0; ; i++) {
      try {
        renameSync(tmp, filePath);
        return "ok";
      } catch (err) {
        if (i >= 15 || !["EPERM", "EACCES", "EBUSY"].includes(err?.code)) throw err;
        // 抖动必加：无随机时全体败方同步退避、同步重试，会持续互相撞回 EPERM。
        const delay = 5 * (i + 1) + Math.floor(Math.random() * 10);
        Atomics.wait(SLEEP_BUF, 0, 0, delay);
        if (!revalidate()) return "conflict";
      }
    }
  } finally {
    try { rmSync(tmp, { force: true }); } catch { /* 清理失败不掩盖原结果 */ }
  }
}

/** 把内容写入目标同目录的唯一下 tmp 文件（不落正式文件）。 */
export function stageWrite(filePath, content, encoding = "utf8") {
  const dir = dirname(filePath);
  const tmp = join(dir, `.${basename(filePath)}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  try {
    writeFileSync(tmp, content, encoding);
    return tmp;
  } catch (err) {
    try { rmSync(tmp, { force: true }); } catch { /* 清理失败不掩盖原错误 */ }
    throw err;
  }
}

export function atomicWriteFileSync(filePath, content, encoding = "utf8") {
  const tmp = stageWrite(filePath, content, encoding);
  const r = commitStaged(tmp, filePath);
  if (r !== "ok") throw new Error(`atomicWriteFileSync: rename 前基座复核失败（并发冲突）: ${filePath}`);
}
