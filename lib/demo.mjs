export function createDemoRun(principles,{id=crypto.randomUUID(),now=new Date().toISOString()}={}){
 const active=principles.filter(p=>p.active);
 return {schemaVersion:'1.0',id,createdAt:now,mode:'deterministic_demo',status:'blocked',
  model:null,marketData:null,performance:null,cost:{llmTokens:0},
  inputs:{sourceIds:['S01','S02','S04'],principleIds:active.map(p=>p.id),principleSnapshot:active.map(p=>({id:p.id,content:p.content,scope:p.scope??null,strength:p.strength??null})),catalogVersion:'0.1.0',instrument:'TAIFEX:TMF',dataSnapshotId:null},
  hypothesis:{title:'區間突破後的趨勢延續',type:'示例研究假說',rationale:'用可觀察的突破條件示範交易計劃格式；目前没有市場實證。',entry:'示例：已收盤 K 線突破前 N 根最高點，下一根開盤才評估進場。',exit:'示例：依事前設定的停損與出場條件處理；參數未確認。',parameters:{lookback:null,timeframe:null,stopPoints:null,maxRiskTWD:null,maxContracts:null},invalidation:'盤整、跳空與交易成本可能使策略失效，必須獨立測試。'},
  gates:[{id:'trace',name:'來源與原則可追溯',status:active.length?'passed':'blocked',detail:'記錄來源與原則 ID；引用是工程/回測方法，並非此策略有效的證據。'},{id:'instrument',name:'合約規格與資料已查核',status:'blocked',detail:'TMF 已確認，官方合約規格與授權資料快照尚待查核。'},{id:'plan',name:'交易計劃完整',status:'blocked',detail:'週期、進出場參數與例外規則尚未確認。'},{id:'risk',name:'風控數值已核准',status:'blocked',detail:'每筆風險、日損、口數、留倉與成本仍待討論。'},{id:'backtest',name:'獨立回測與樣本外',status:'not_run',detail:'前置關卡未通過；本次沒有執行回測。'}],
  events:[{step:1,action:'讀取最小上下文',result:'引用 3 份方法來源與目前啟用的交易原則。'},{step:2,action:'建立示例策略草案',result:'未知條件保留 null；沒有以推測補齊。'},{step:3,action:'執行檢查關卡',result:'缺少商品、資料、計劃及風控；停止於草案階段。'},{step:4,action:'保存交接紀錄',result:'保存輸入 ID、草案、檢查結果和下一步。'}],
  nextAction:'先查核 TMF 合約規格、資料與交易計劃，再討論是否實作策略生成 Agent。'};
}
