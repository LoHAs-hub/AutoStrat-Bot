import {mkdirSync,writeFileSync} from 'node:fs';
import {createDemoRun} from '../lib/demo.mjs';
const run=createDemoRun([{id:'P001',content:'嚴格執行交易計劃',active:true}]);
mkdirSync('artifacts',{recursive:true});writeFileSync(`artifacts/${run.id}.json`,JSON.stringify(run,null,2));
console.log(`示例已保存：artifacts/${run.id}.json\n模式：固定示例；沒有市場資料、LLM 或回測。\n結果：${run.status}；下一步：${run.nextAction}`);
