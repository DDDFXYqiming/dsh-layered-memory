import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { readFileSync, createWriteStream, writeFileSync } from 'node:fs';
import { once } from 'node:events';
const scenario = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const log = createWriteStream(scenario.output + '.jsonl');
const diagnostics = createWriteStream(scenario.output + '.stderr.log');
const child = spawn('/usr/local/bin/node', ['--expose-internals', '/home/openclaw/apps/deepseek-harness/node_modules/@deepseek-ai/dsh/lib/bin.js', '--profile', scenario.profile || 'memory-repair-sdk', '--patch', scenario.patch], {cwd: scenario.cwd, env:{...process.env, DSH_HOME:process.env.DSH_HOME || '/home/openclaw/.dsh-memory-repair-20261022',DSH_TELEMETRY_DISABLED:'1'}, stdio:['pipe','pipe','pipe']});
child.stderr.pipe(diagnostics);
const pending = new Map(), notices = [], listeners = new Set(), stepChecks = [];
let sequence = 0;
const exited = once(child, 'exit');
createInterface({input:child.stdout}).on('line', line => {
  let value;
  try { value = JSON.parse(line); } catch { diagnostics.write(line+'\n'); return; }
  log.write(JSON.stringify(value)+'\n');
  if (value.id !== undefined && pending.has(value.id)) {
    const request = pending.get(value.id); pending.delete(value.id);
    value.error ? request.reject(new Error(JSON.stringify(value.error))) : request.resolve(value.result);
  } else { notices.push(value); for (const notify of [...listeners]) notify(value); }
});
child.on('exit', (code, signal) => { for (const request of pending.values()) request.reject(new Error(`SDK退出 ${code}/${signal}`)); pending.clear(); });
function rpc(method, params) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {pending.set(id,{resolve,reject}); child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,...params === undefined ? {} : {params}})+'\n');});
}
function maintenanceDone(expected = 1) {
  return new Promise((resolve, reject) => {
    let finishedCount = 0;
    const timer=setTimeout(()=>{listeners.delete(onNotice);reject(new Error('维护子代理未在预算时间内完成'));},480000);
    const onNotice=value=>{if(value.method==='subagent.finished' && ++finishedCount >= expected){clearTimeout(timer);listeners.delete(onNotice);resolve(value.params);}};
    listeners.add(onNotice);
  });
}
const deadline=setTimeout(()=>{diagnostics.write('端到端场景超时，释放专用SDK进程\n');child.kill('SIGTERM');},660000);
try {
  console.log('initialize', await rpc('initialize',{cwd:scenario.cwd,provider:scenario.provider||'opencode-go',model:scenario.model||'deepseek-v4.1-flash',...(scenario.defaultReasoning?{}:{reasoningEffort:'high'}),maxTokens:8192}));
  for (const step of scenario.steps) {
    if(step.delayMs) await new Promise(resolve=>setTimeout(resolve,step.delayMs));
    const completion=step.maintenance ? maintenanceDone(step.children || 1) : null;
    if(completion) completion.catch(()=>{});
    console.log('prompt',await rpc('session/prompt',{sessionId:scenario.id,contentBlocks:[{type:'text',text:step.prompt}]}));
    await rpc('session/wait',{sessionId:scenario.id});
    await new Promise(resolve=>setTimeout(resolve,1000));
    await rpc('session/wait',{sessionId:scenario.id});
    if(completion) {const {lastAssistantMessage,...finished}=await completion;console.log('maintenance',finished);await rpc('session/wait',{sessionId:scenario.id});}
    let reviewState=null; if(scenario.stateFile){try{reviewState=JSON.parse(readFileSync(scenario.stateFile,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}}
    stepChecks.push({step:stepChecks.length+1,children:notices.filter(n=>n.method==='subagent.finished').length,reviewState});
    writeFileSync(scenario.output+'.steps.json',JSON.stringify(stepChecks,null,2)+'\n');
  }
  const events=notices.filter(n=>n.method==='session.event');
  const rootEvents=events.filter(n=>n.params.sessionId===scenario.id).map(n=>n.params.event);
  const summary={session:scenario.id,humanPrompts:scenario.steps.length,rootTurns:rootEvents.filter(e=>e.type==='turn/end').length,pluginMessages:rootEvents.filter(e=>e.type==='user/message'&&e.data.source?.kind?.startsWith('plugin:layered-memory')),assistantTexts:rootEvents.filter(e=>e.type==='assistant/message').flatMap(e=>(e.data.message?.content||[]).filter(b=>b.type==='text').map(b=>({seq:e.seq,text:b.text}))),checkpoints:events.filter(n=>n.params.event.type==='user/message' && n.params.event.data.source?.kind==='plugin:layered-memory:turn-review').map(n=>({session:n.params.sessionId,seq:n.params.event.seq})),turns:events.filter(n=>n.params.event.type==='turn/end').map(n=>({session:n.params.sessionId,...n.params.event.data})),children:notices.filter(n=>n.method==='subagent.finished').map(n=>{const {lastAssistantMessage,...result}=n.params;return result;})};
  writeFileSync(scenario.output+'.summary.json',JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify(summary,null,2));
} finally {
  if(child.exitCode===null && !child.killed) await rpc('shutdown');
  console.log('SDK退出',await exited);clearTimeout(deadline);log.end();diagnostics.end();
}
