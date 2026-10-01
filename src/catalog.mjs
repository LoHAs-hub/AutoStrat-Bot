export const project = {
  name: '策略研究工作台', version: '0.1.0', cycle: '00', date: '2026-10-01',
  market: '微型台指期貨 TMF', instrumentStatus: '商品已確認 · TradingView 代碼待查核',
  instrumentLink: 'https://www.tradingview.com/symbols/TAIFEX-MXF1!/',
  confirmed: ['Agent Harness／Harness Engineering', '只研究微型台指期貨（TMF）', '嚴格執行交易計劃', '先以示例驗收，再按階段批次實作'],
  pending: ['TMF 的 TradingView 對應代碼与官方規格', 'K 線週期、日盤／夜盤與是否留倉', '研究資料的來源、使用權與歷史範圍', '交易成本、資金與數值風控上限'],
};
export const phases = [
 {id:'p0',number:'00',name:'專案定義與工作台',label:'本次循環',goal:'把想法變成可追蹤、可驗收的專案。',deliverables:['互動工作台與任務記錄','Harness 工作方式與資料契約','第一筆交易原則、研究來源與交接包'],acceptance:'可以儲存原則、調整任務、走一次示例、匯出交接；重啟後資料保留。',demo:'新增一條原則，重新載入後仍存在；匯出的交接包包含該原則與未決問題。'},
 {id:'p1',number:'01',name:'商品與資料基準',label:'下一個討論',goal:'確定研究的是哪一份合約、哪一段資料。',deliverables:['商品識別與官方契約規格','授權資料樣本與品質報告','交易時段、換月與成本假設'],acceptance:'能由每根 K 線追溯到資料來源；缺漏、跨夜日期、換月與時區處理明確。',demo:'用一天日夜盤樣本，核對時間、價格單位、缺棒及換月；不先大量下載。'},
 {id:'p2',number:'02',name:'知識庫 Agent',label:'規劃中',goal:'讓有來源的知識變成策略可引用的資料。',deliverables:['收集、去重、拆解主張與引用','分類、衝突、失效與版本管理','固定問題集的檢索評估'],acceptance:'每項主張可回到來源；未核實、過期與偏好可區分；抽樣問題能取得正確引用。',demo:'先處理 5 份來源、10 個知識單元與 10 題檢索問題，再決定是否需要向量索引。'},
 {id:'p3',number:'03',name:'策略生成 Agent',label:'規劃中',goal:'把可解釋的假說轉成完整交易計劃。',deliverables:['策略假說與知識引用','進出場、部位、風控及失效条件','結構化策略規格與 Pine 轉譯'],acceptance:'規格沒有含糊的進出場語句；未知參數明列；違反硬性原則即退回。',demo:'同一組知識產出趨勢與區間兩個研究假說，比較依據、例外與失效條件。'},
 {id:'p4',number:'04',name:'回測與獨立驗證',label:'規劃中',goal:'測試策略能否在固定資料與成本下成立。',deliverables:['可重現基準與成本模型','樣本外、走動驗證及參數敏感度','Pine／獨立引擎差異報告'],acceptance:'不使用未來資訊；鎖定試驗紀錄；保留失敗策略；相同版本與資料可重現。',demo:'先讓一個簡單策略在兩個引擎對照逐筆成交，再看績效。'},
 {id:'p5',number:'05',name:'模擬觀察與維護',label:'未排入',goal:'觀察計劃遵守程度，逐步檢驗運行可靠性。',deliverables:['模擬交易觀察與偏離計劃紀錄','知識更新與資料漂移監測','停機、恢復與人工覆核流程'],acceptance:'每項決策能回到當時的計劃版本與輸入；異常可停機且可恢復。',demo:'用資料斷流與重複訊號示例測試；實盤連線另定範圍。'},
];
export const taskStatuses = {backlog:'待討論',ready:'已排入',in_progress:'實作中',review:'待驗收',done:'已完成'};
export const tasks = [
 {id:'T01',title:'查證 Harness 與 TradingView 邊界',phase:'p0',status:'done',size:'S',deps:[],description:'對照官方工程文章、資料條款與 Pine 回測文件，記錄來源及影響。',acceptance:'研究結論可回到官方原文；開源 metadata 查核與程式碼評估明確分開。',evidence:'docs/RESEARCH.md；官方來源與 GitHub metadata 於 2026-09-30 查閱。'},
 {id:'T02',title:'建立專案規格與交接地圖',phase:'p0',status:'done',size:'M',deps:['T01'],description:'建立 AGENTS、架構、階段計劃、資料契約與交接文件。',acceptance:'新聊天室能知道已確認事項、可跑方式、未完成內容與下一步。',evidence:'AGENTS.md、docs/PROJECT.md、docs/ARCHITECTURE.md、docs/HANDOFF.md。'},
 {id:'T03',title:'驗收互動工作台',phase:'p0',status:'review',size:'M',deps:['T02'],description:'檢視任務、保存交易原則、記錄操作與匯出交接資料。',acceptance:'任務修改與原則在重新載入後保留；有操作紀錄與錯誤回饋。',evidence:''},
 {id:'T04',title:'走一次 Harness 示範',phase:'p0',status:'review',size:'S',deps:['T02'],description:'用固定示例展示知識、原則、策略草案、檢查關卡與執行紀錄。',acceptance:'示例清楚標示非 LLM、非市場回測；未確認風控與商品會阻擋後續驗證。',evidence:''},
 {id:'T05',title:'查核 TMF 規格與研究時段',phase:'p1',status:'backlog',size:'S',deps:['T03'],description:'TMF 已由使用者確認；查核官方規格與 TradingView 代碼，決定週期、日夜盤、方向與留倉。',acceptance:'商品 ID、每點價值、tick、時區、到期、交易日定義皆有官方依據與使用者決策。',evidence:''},
 {id:'T06',title:'驗證資料取得與授權',phase:'p1',status:'backlog',size:'M',deps:['T05'],description:'評估期交所、券商或授權供應商；以小樣本檢查品質。',acceptance:'可合法重用、可重現的樣本，附來源、checksum、取得時間與使用限制。',evidence:''},
 {id:'T07',title:'定義風控、成本與交易計劃',phase:'p1',status:'backlog',size:'M',deps:['T05'],description:'將嚴格執行計劃轉成可檢查規則；數值由使用者決定。',acceptance:'每筆與每日風險、回撤上限、口數、保證金、手續費、交易稅、滑價與停機規則完整。',evidence:''},
 {id:'T08',title:'示例驗收知識資料契約',phase:'p2',status:'backlog',size:'S',deps:['T06'],description:'用 10 個有來源的主張驗收欄位、引用與衝突處理。',acceptance:'事實、假說、主觀偏好可分辨；PIT 時間、來源、失效條件可查。',evidence:''},
 {id:'T09',title:'實作知識收集與檢索 Agent',phase:'p2',status:'backlog',size:'L',deps:['T08'],description:'先用關鍵字與欄位過濾，證明不足後才加入向量搜尋。',acceptance:'固定問題集有引用正確率、回答涵蓋率、成本和耗時紀錄；支援續跑。',evidence:''},
 {id:'T10',title:'驗收策略規格與原則檢查',phase:'p3',status:'backlog',size:'M',deps:['T07','T09'],description:'將策略假說轉成機器可讀的交易計劃，列出因果依據與失效條件。',acceptance:'所有策略都有來源 ID、計劃版本、完整進出場和硬性風控；模糊規則不能通過。',evidence:''},
 {id:'T11',title:'建構策略生成與 Pine 轉譯',phase:'p3',status:'backlog',size:'L',deps:['T10'],description:'接入可替换模型與 prompt 版本；草案由獨立檢查器驗證。',acceptance:'保存模型、prompt、參數、上下文 ID 與結構化輸出；編譯錯誤可追溯。',evidence:''},
 {id:'T12',title:'建立獨立回測與逐筆對帳',phase:'p4',status:'backlog',size:'L',deps:['T11','T06'],description:'依台指期貨需求挑選引擎，建立手續費、滑價、跨夜與換月模型。',acceptance:'固定資料與策略可重跑；先逐筆對帳 Pine 的成交時序，再評估績效。',evidence:''},
 {id:'T13',title:'樣本外與過度擬合評估',phase:'p4',status:'backlog',size:'M',deps:['T12'],description:'凍結 holdout，記錄所有試驗，測試多重比較、成本加倍與參數穩健性。',acceptance:'報告含失敗試驗、交易數、不確定性、回撤、尾部損失與基準；不只看淨利。',evidence:''},
 {id:'T14',title:'模擬觀察與計劃遵守報告',phase:'p5',status:'backlog',size:'L',deps:['T13'],description:'在不實盤下觀察訊號延遲、資料中斷、重複訊號与計劃偏離。',acceptance:'異常停止、恢復、版本回溯、人工覆核與資料保留方式可操作。',evidence:''},
];
export const categories = [
 ['商品與市場結構','契約、交易時段、tick、結算、換月、流動性、撮合與日夜盤'],
 ['TradingView 與 Pine','圖表、回放、Strategy Tester、Pine v6、重繪與平台限制'],
 ['技術分析','趨勢、區間、波動、量價、型態；每個概念要有失效條件'],
 ['基本面與指數結構','台灣加權指數成分、權重、企業財報公告及指數影響'],
 ['總經與市場消息','利率、通膨、匯率、政策、經濟日曆；保留發布與修訂時間'],
 ['投資與組合理論','期望值、風險溢酬、曝險、槓桿與資金配置'],
 ['風控與執行','口數、停損、日損上限、保證金、滑價、交易成本與停機'],
 ['統計與回測方法','樣本外、走動驗證、多重測試、存活偏差與前視偏差'],
 ['交易心理與個人原則','原話、適用範圍、例外、硬性規則或軟性偏好'],
 ['軟體與 Agent 工程','Harness、資料契約、工具界線、評估、事件紀錄與復原'],
];
export const sources = [
 {id:'S01',title:'Harness engineering',publisher:'OpenAI',kind:'工程方法',date:'2026-09-30',url:'https://openai.com/index/harness-engineering/',claim:'以儲存庫作知識紀錄中心，AGENTS.md 作入口地圖，搭配可檢查的架構邊界與回饋循環。',limitation:'工程案例的效率數字不能直接推論到交易研究；本專案採用流程設計。'},
 {id:'S02',title:'Effective harnesses for long-running agents',publisher:'Anthropic',kind:'工程方法',date:'2026-09-30',url:'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents',claim:'首次初始化與後續增量工作分開；功能清單、進度檔、測試與 Git 讓跨上下文工作能續接。',limitation:'不是要求建立大量 Agent；先用一個可恢復的執行器也可實現。'},
 {id:'S03',title:'TradingView 使用條款 · §3',publisher:'TradingView',kind:'平台限制',date:'2026-09-30',url:'https://www.tradingview.com/policies/',claim:'現行條款限制市場資料的非顯示與自動化使用；付費帳號本身不能當作資料 API 的授權。',limitation:'整合前需查核最新條款、資料供應商與帳號適用授權。已存在的第三方工具不構成授權。'},
 {id:'S04',title:'Pine Script · Strategies',publisher:'TradingView',kind:'回測方法',date:'2026-09-30',url:'https://www.tradingview.com/pine-script-docs/concepts/strategies/',claim:'策略測試使用 broker emulator，歷史 K 線的成交假設與即時執行不同；佣金、滑價與計算時機會改變結果。',limitation:'需核對 bar magnifier、收盤或 next-tick 成交、calc_on_order_fills 等設定；平台結果不是實盤證明。'},
];
export const resources = [
 {name:'tradingview/lightweight-charts',category:'圖表',license:'Apache-2.0',fit:'未來工作台的 K 線與成交標記。',caution:'圖表庫本身不提供市場資料，也不等於完整 TradingView。',verdict:'可評估',checked:'2026-09-30'},
 {name:'QuantConnect/Lean',category:'回測引擎',license:'Apache-2.0',fit:'事件驅動架構、資料/券商介面與期貨研究設計。',caution:'台指期貨資料、合約規格與執行成本需自行驗證；初期較重。',verdict:'優先比較',checked:'2026-09-30'},
 {name:'kernc/backtesting.py',category:'回測引擎',license:'AGPL-3.0',fit:'最小策略基準與逐根 K 線回測示例。',caution:'期貨換月、保證金與稅費需驗證；採用前評估授權義務。',verdict:'優先比較',checked:'2026-09-30'},
 {name:'mementum/backtrader',category:'回測引擎',license:'GPL-3.0',fit:'事件驅動與多資料序列回測架構參考。',caution:'本次 metadata 顯示最後 push 為 2024-08-19；先確認維護与依賴相容。',verdict:'架構參考',checked:'2026-09-30'},
 {name:'polakowo/vectorbt',category:'研究加速',license:'NOASSERTION',fit:'向量化參數研究與研究結果分析。',caution:'API 的授權辨識是 NOASSERTION，須讀實際 LICENSE；大量搜尋會提高過度擬合風險。',verdict:'待查核',checked:'2026-09-30'},
 {name:'freqtrade/freqtrade',category:'架構參考',license:'GPL-3.0',fit:'研究/模擬運行分離、組態與檢查工具的設計。',caution:'主要面向加密貨幣，不能直接當作台指期貨連接器。',verdict:'架構參考',checked:'2026-09-30'},
 {name:'tradesdontlie/tradingview-mcp',category:'TradingView 整合',license:'NOASSERTION',fit:'研究 MCP 工具如何描述圖表操作與觀察結果。',caution:'非官方整合；程式碼、桌面存取、條款及授權均待查核。本階段不執行。',verdict:'待查核',checked:'2026-09-30'},
 {name:'Mathieu2301/TradingView-API',category:'TradingView 整合',license:'API 未回傳授權',fit:'了解社群的資料整合方向與相依風險。',caution:'非官方 API；未建立重用授權與資料使用權，不列為資料基礎。',verdict:'暫不採用',checked:'2026-09-30'},
];
