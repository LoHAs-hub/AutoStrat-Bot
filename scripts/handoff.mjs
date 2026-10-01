import {mkdirSync,writeFileSync} from 'node:fs';
const root='http://127.0.0.1:4173';mkdirSync('artifacts',{recursive:true});
for(const [route,name] of [['/api/handoff','handoff.md'],['/api/export','workspace.json']]){const r=await fetch(root+route);if(!r.ok)throw new Error(`Export failed ${r.status}; start npm run dev first`);writeFileSync('artifacts/'+name,await r.text());console.log('Saved artifacts/'+name);}
