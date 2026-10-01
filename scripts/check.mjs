import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {tasks,phases,sources} from '../src/catalog.mjs';
const paths=['src','server','lib','scripts','tests'];
for(const dir of paths)for(const f of readdirSync(dir))if(/\.(js|mjs)$/.test(f))execFileSync(process.execPath,['--check',`${dir}/${f}`],{stdio:'inherit'});
for(const file of ['AGENTS.md','README.md','docs/PROJECT.md','docs/ARCHITECTURE.md','docs/RESEARCH.md','docs/HANDOFF.md','docs/PROGRESS.md','docs/ACCEPTANCE.md'])if(!existsSync(file))throw new Error('Missing document: '+file);
const ids=new Set(tasks.map(t=>t.id));if(ids.size!==tasks.length)throw new Error('Duplicate task ids');
for(const t of tasks){if(!phases.some(p=>p.id===t.phase))throw new Error('Unknown phase');for(const dep of t.deps)if(!ids.has(dep))throw new Error('Unknown dependency');if(t.status==='done'&&!t.evidence)throw new Error('Missing completion evidence');}
for(const s of sources)if(!s.url.startsWith('https://')||!s.claim||!s.limitation)throw new Error('Invalid source');
for(const f of readdirSync('schemas'))if(f.endsWith('.json'))JSON.parse(readFileSync('schemas/'+f));
console.log('Syntax, source links, task integrity, contracts and handoff documents checked.');
