export class ValidationError extends Error { constructor(message,status=400){super(message);this.status=status;} }
export const statuses=['backlog','ready','in_progress','review','done'];
export function string(value,name,max=2000){if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new ValidationError(`${name}需有內容，且最多 ${max} 字。`);return value.trim();}
export function validateMutation(b){
 if(!b||typeof b!=='object'||Array.isArray(b))throw new ValidationError('請提供有效資料。');
 if(!Number.isInteger(b.revision)||b.revision<0)throw new ValidationError('缺少有效的資料版本。');
 if(typeof b.requestId!=='string'||!/^[-a-zA-Z0-9]{8,80}$/.test(b.requestId))throw new ValidationError('缺少有效的操作識別碼。');
 return b;
}
export function checkTaskUpdate(task,b,tasks){
 if(!statuses.includes(b.status))throw new ValidationError('未知的任務狀態。');
 const evidence=typeof b.evidence==='string'?b.evidence.trim():task.evidence||'';
 const note=typeof b.note==='string'?b.note.trim():task.note||'';
 if(evidence.length>4000||note.length>4000)throw new ValidationError('備註或證據最多 4000 字。');
 if(b.status==='done'&&!evidence)throw new ValidationError('完成任務前，請記錄驗收證據。');
 if(['in_progress','review','done'].includes(b.status)&&b.status!==task.status){
  const missing=task.deps.filter(id=>tasks.find(t=>t.id===id)?.status!=='done');
  if(missing.length)throw new ValidationError(`先完成相依任務：${missing.join('、')}。`,409);
 }
 // Reopening a prerequisite must not silently invalidate active downstream work.
 if(task.status==='done'&&b.status!=='done'){
  const downstream=tasks.filter(t=>t.deps.includes(task.id)&&['in_progress','review','done'].includes(t.status));
  if(downstream.length)throw new ValidationError(`請先調整後續任務：${downstream.map(t=>t.id).join('、')}。`,409);
 }
 return {status:b.status,evidence,note};
}
export function validatePrinciple(b){
 const content=string(b.content,'原則',2000),scope=string(b.scope,'適用範圍',200);
 if(!['hard','preference','hypothesis'].includes(b.strength))throw new ValidationError('請選擇原則性質。');
 return {content,scope,strength:b.strength};
}
