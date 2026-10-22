import fs from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire('/home/openclaw/apps/deepseek-harness/node_modules/@deepseek-ai/dsh/package.json');
const yaml=require('js-yaml');
const base=process.env.DSH_MEMORY_VERIFY_DIR || '/mnt/d/AI_Projects/dsh-memory-repair-20261022/e2e';
const home=process.env.DSH_HOME || '/home/openclaw/.dsh-memory-repair-20261022';
const source=fileURLToPath(new URL('../../../../',import.meta.url)).replace(/\/$/,'');
for(const p of [home,`${base}/workspace`,`${base}/memory`,`${base}/sessions`,`${base}/logs`])fs.mkdirSync(p,{recursive:true});
fs.chmodSync(home,0o700);
fs.copyFileSync('/home/openclaw/.dsh/.credentials.yaml',`${home}/.credentials.yaml`);fs.chmodSync(`${home}/.credentials.yaml`,0o600);
const proxyLines=fs.readFileSync('/home/openclaw/.dsh/.env','utf8').split(/\r?\n/).filter(l=>/^(HTTP_PROXY|HTTPS_PROXY|ALL_PROXY|NO_PROXY|http_proxy|https_proxy|all_proxy|no_proxy)=/.test(l));
fs.writeFileSync(`${home}/.env`,proxyLines.join('\n')+'\n',{mode:0o600});
const homeConfig=yaml.load(fs.readFileSync('/home/openclaw/.dsh/cordis.patch.yml','utf8'),{schema:yaml.DEFAULT_SCHEMA.extend([new yaml.Type('tag:yaml.org,2002:js',{kind:'scalar',construct:d=>d})])});
const provider=homeConfig.find(x=>x.id==='llm-pi-ai').config.providers['opencode-go'];
const config=[
{id:'llm-pi-ai',config:{providers:{'opencode-go':{...provider,models:provider.models.map(m=>({...m,maxTokens:8192}))}}}},
{id:'agent-default-model',config:{provider:'opencode-go',model:'deepseek-v4.1-flash',reasoningEffort:'high',maxTokens:8192}},
{id:'dsh-layered-memory',config:{memoryDir:`${base}/memory`,defaultNamespace:'web-e2e',autoNamespace:false,progressive:true,turnReviewEnabled:true,turnReviewMinEvidence:6,turnReviewCooldownMinutes:30,reflectionEnabled:false,reflectionMode:'notify',maintainEveryTurns:0,reflectCooldownTurns:0,l1MaxChars:8192}},
{id:'session-persistence-jsonl',config:{root:`${base}/sessions`}},
{id:'sandbox-policy',config:{mode:'danger-full-access',workspaceRoot:`${base}/workspace`}},
{id:'approval',config:{policy:'never'}},
{id:'session-title-llm',disabled:true},
{id:'agent-instructions',disabled:true},
{id:'browser-use',disabled:true},
{id:'browser-use-chrome-devtools-mcp',disabled:true},
{id:'computer-use',disabled:true},
{id:'computer-use-cua-driver-native',disabled:true},
{id:'subagent-model-selection-settings',config:{enabled:true,allowedModels:[{provider:'opencode-go',model:'deepseek-v4.1-flash'}]}}
];
for(const [profile,bundle] of [['memory-repair-web','@deepseek-ai/dsh-web-app'],['memory-repair-sdk','@deepseek-ai/dsh-sdk-app']]){
 const dir=`${home}/profiles/${profile}`;fs.mkdirSync(`${dir}/node_modules/@dsh-external`,{recursive:true});
 const pkg={name:`dsh-profile-${profile}`,private:true,dependencies:{'@dsh-external/dsh-layered-memory':`link:${source}`,'@dsh-external/dsh-layered-memory-status':`link:${source}/lib/status`},dsh:{profile:{bundles:['@deepseek-ai/dsh-base',bundle,'@dsh-external/dsh-layered-memory']}}};
 fs.writeFileSync(`${dir}/package.json`,JSON.stringify(pkg,null,2)+'\n');fs.writeFileSync(`${dir}/cordis.yml`,'[]\n');fs.writeFileSync(`${dir}/cordis.patch.yml`,yaml.dump(config,{lineWidth:120}));
 for(const [name,target] of [['dsh-layered-memory',source],['dsh-layered-memory-status',`${source}/lib/status`]]){const dest=`${dir}/node_modules/@dsh-external/${name}`;if(!fs.existsSync(dest))fs.symlinkSync(target,dest);}
}
fs.writeFileSync(`${base}/environment.json`,JSON.stringify({base,home,profiles:['memory-repair-web','memory-repair-sdk'],source,provider:'opencode-go',model:'deepseek-v4.1-flash',credentials:'managed private copy',web:`http://127.0.0.1:${process.env.DSH_MEMORY_VERIFY_PORT || 3082}`},null,2)+'\n');
for(const [name,data] of [['a.json',{project:'beacon-app',port:8456}],['b.json',{project:'beacon-app',binding:'127.0.0.1'}],['c.json',{project:'beacon-app',build:'npm run build'}],['d.json',{project:'beacon-app',output:'dist'}],['e.json',{project:'beacon-app',preview:'npm run preview'}],['f.json',{project:'beacon-app',environment:'WSL'}]])fs.writeFileSync(`${base}/workspace/${name}`,JSON.stringify(data)+'\n');
console.log('Isolated Web and SDK profiles prepared; model opencode-go/deepseek-v4.1-flash.');
