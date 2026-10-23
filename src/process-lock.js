import { mkdirSync, readFileSync, readdirSync, renameSync, rmdirSync, lstatSync, unlinkSync, writeFileSync } from "node:fs";
import { hostname } from "node:os";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

const sleepBuffer = new Int32Array(new SharedArrayBuffer(4));

export function isProcessOwnerDead(owner) {
	if (owner.host !== hostname()) return false;
	try { process.kill(owner.pid, 0); return false; }
	catch (error) {
		if (error.code === "ESRCH") return true;
		if (error.code === "EPERM") return false;
		throw error;
	}
}

function removeEmpty(path) {
	try { rmdirSync(path); }
	catch (error) {
		if (!["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error.code)) throw error;
	}
}

function readLock(path) {
	let info;
	try { info = lstatSync(path); }
	catch (error) { if (error.code === "ENOENT") return null; throw error; }
	const directory = info.isDirectory();
	let ownerPath = path;
	try {
		if (directory) {
			const [name] = readdirSync(path);
			if (!name) return { directory, owner: null };
			ownerPath = join(path, name);
		}
		return { directory, ownerPath, owner: JSON.parse(readFileSync(ownerPath, "utf8")) };
	} catch (error) { if (error.code === "ENOENT" || error.code === "EISDIR") return null; throw error; }
}

export function readProcessLockOwner(path) { return readLock(path)?.owner ?? null; }

function clearExitedOwner(path) {
	const lock = readLock(path);
	if (!lock) return true;
	if (!lock.owner) { removeEmpty(path); return true; }
	if (!isProcessOwnerDead(lock.owner)) return false;
	// The unique owner filename prevents competing reclaimers from unlinking a new owner.
	try { unlinkSync(lock.ownerPath); }
	catch (error) {
		if (error.code === "ENOENT" || error.code === "EISDIR") return true;
		if (!lock.directory && error.code === "EPERM" && lstatSync(path).isDirectory()) return true;
		throw error;
	}
	if (lock.directory) removeEmpty(path);
	return true;
}

export function acquireProcessLock(path, { id = randomUUID(), waitBudgetMs = 0 } = {}) {
	const candidate = `${path}.owner-${id}`;
	const ownerFile = `${id}.json`;
	mkdirSync(candidate);
	writeFileSync(join(candidate, ownerFile), JSON.stringify({ id, pid: process.pid, host: hostname(), startedAt: new Date().toISOString() }));
	const deadline = Date.now() + waitBudgetMs;
	let acquired = false;
	try {
		for (;;) {
			if (!clearExitedOwner(path)) {
				if (Date.now() >= deadline) return null;
				Atomics.wait(sleepBuffer, 0, 0, 10);
				continue;
			}
			try { renameSync(candidate, path); acquired = true; break; }
			catch (error) {
				if (!["EEXIST", "ENOTEMPTY", "ENOTDIR", "EISDIR", "EPERM"].includes(error.code)) throw error;
				if (error.code === "EPERM") {
					try { lstatSync(path); }
					catch (missing) { if (missing.code === "ENOENT") throw error; throw missing; }
				}
				if (clearExitedOwner(path)) continue;
				if (Date.now() >= deadline) return null;
				Atomics.wait(sleepBuffer, 0, 0, 10);
			}
		}
	} finally {
		if (!acquired) { unlinkSync(join(candidate, ownerFile)); rmdirSync(candidate); }
	}
	return () => { unlinkSync(join(path, ownerFile)); removeEmpty(path); };
}
