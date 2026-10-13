import { readFileSync, writeFileSync } from "node:fs";
import { zstdDecompressSync } from "node:zlib";

const files = process.argv.slice(2);
if (!files.length) throw new Error("Usage: node scripts/e2e-log-report.mjs <DSH session.jsonl[.zstd]> ...");
const sessions = [];
for (const file of files) {
  const bytes = readFileSync(file);
  const frames = [];
  if (file.endsWith(".zstd")) {
    let offset = 0;
    while (offset < bytes.length) {
      const { buffer, engine } = zstdDecompressSync(bytes.subarray(offset), { info: true });
      frames.push(buffer);
      offset += engine.bytesWritten;
    }
  } else frames.push(bytes);
  const events = Buffer.concat(frames).toString("utf8").trim().split("\n").map(JSON.parse);
  const header = events.find(e => e.type === "session");
  const calls = new Map();
  const text = content => (content || []).filter(c => c.type === "text").map(c => c.text).join("\n");
  const result = (event, message) => {
    const data = event.data;
    return {seq:event.seq,isError:Boolean(data.isError || message.isError || message.source?.isError),text:text(message.content || data.content)};
  };
  for (const event of events) {
    const d = event.data || {};
    if (["tool/call","tool/ptc-dispatch-start","tool/code-dispatch-start","tool/ptc-dispatch","tool/code-dispatch"].includes(event.type) && d.name?.startsWith("memory_")) {
      const id = d.subCallId || d.callId;
      const call = calls.get(id) || {id,name:d.name,seq:event.seq};
      if (event.type.endsWith("-dispatch")) call.result = result(event,d);
      calls.set(id,call);
    }
    if (event.type === "tool/result") {
      const message=d.message;
      const call=calls.get(message?.source?.callId);
      if (call) call.result=result(event,message);
    }
  }
  const byTool = {};
  for (const call of calls.values()) {
    const counts=byTool[call.name] ||= {calls:0,errors:0,missingResults:0};
    counts.calls++;
    if (!call.result) counts.missingResults++;
    else if (call.result.isError) counts.errors++;
  }
  const lastTurn=events.filter(e=>e.type==="turn/end").at(-1);
  const report={file,session:header?.id,lastTurn:lastTurn?.data,tools:byTool,calls:[...calls.values()]};
  writeFileSync(`${file}.memory-e2e.json`,JSON.stringify(report,null,2)+"\n");
  sessions.push({file,session:header?.id,lastTurn:lastTurn?.data,tools:byTool});
}
console.log(JSON.stringify(sessions,null,2));
