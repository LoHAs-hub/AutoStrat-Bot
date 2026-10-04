# TMF 小型自主知識研究：tmf-001

研究日期：2026-10-02（Asia/Taipei）。程式基準：`95a1fd8`。

本輪由目前對話中的 Codex 自主選題、查閱文件、整理主張與執行驗證。交付是可累積的研究資料包；尚未實作定時或常駐的知識庫 Agent。

## 先看這五個結論

1. TMF 一口每點 10 元，最小跳動 1 點；算術損益還需扣掉交易成本。
2. 夜盤歸屬次一一般交易時段；到期月份在最後交易日有不同時段，不能只依曆日切 K 線。
3. ROD 是當盤有效。跨日夜盤模型若把委託延續到另一盤，可能製造實際不會發生的成交。
4. `TAIFEX:TMF1!` 商品頁已找到，標示連續合約；換月/復權、行情使用權與歷史完整性仍未驗證。
5. Pine 訊號與成交時點需要分開；高週期資料不能無條件開啟 `lookahead_on`。

## 問題與選題理由

自主選題：在提出 TMF 策略前，哪些商品、時間、委託及模擬規則最可能讓研究結果失真？依既有 P0 優先序選五份官方來源，先建立有引用的小核心。未先決定本金、交易週期、方向或數值風控。

本輪首次提出的後續研究假說：**委託當盤失效若被忽略，跨日夜盤回測可能高估可成交機會。** 這是從 ROD 制度推出的方法風險假說，尚未用行情或券商資料驗證，更不是策略獲利證據。

## 五份來源

| ID | 官方文件 | 本輪用途 | 取得時間（台北） |
|---|---|---|---|
| S01 | [微型臺指期貨契約規格](https://www.taifex.com.tw/cht/2/tMF) | 商品、時段、到期、券商保證金下限 | 2026-10-02 18:19:40 |
| S02 | [盤後交易介紹](https://www.taifex.com.tw/cht/4/aHIntroduction) | 夜盤交易日與 ROD | 2026-10-02 18:18:59 |
| S03 | [股價指數類保證金一覽表](https://www.taifex.com.tw/cht/5/indexMarging) | 保證金時間快照 | 2026-10-02 18:16:04 |
| S04 | [MICRO TAIEX FUTURES — TAIFEX:TMF1!](https://www.tradingview.com/symbols/TAIFEX-TMF1!/) | 商品代碼與連續合約類型 | 2026-10-02 18:19:39 |
| S05 | [Pine Script v6 — Strategies](https://www.tradingview.com/pine-script-docs/concepts/strategies/) | 模擬成交與未來資料洩漏 | 2026-10-02 18:16:04 |

各頁面擷取時間、HTTP metadata、完整快照與正規化文字 hash 在 [sources.json](sources.json)。頁面初次公開時間及生效時間未確認，不以擷取時間或頁面更新日補造過去版本。

## 十個知識單元

以下 `reviewed` 表示本輪 Agent 已比對原文；仍等待使用者審閱，沒有獨立研究者評估。每筆原文、知識主張與研究推導分開。

### K01：TMF 身分與每點價值

**類型：文件事實。知識主張：** 期交所微型臺指期貨代碼為 TMF，標的是臺灣證券交易所發行量加權股價指數；一口契約價值為指數乘以新臺幣 10 元，即每點價值 10 元。

**原文依據：**

- [S01／契約規格表：交易標的／中文簡稱／英文代碼](https://www.taifex.com.tw/cht/2/tMF)（E01）

> 交易標的 臺灣證券交易所發行量加權股價指數 中文簡稱 微型臺指期貨 英文代碼 TMF

- [S01／契約規格表：契約價值](https://www.taifex.com.tw/cht/2/tMF)（E02）

> 微型臺指期貨指數乘上新臺幣10元

**本輪推導／使用意義：** 研究計算：忽略交易成本時，多單一口上漲 100 點的毛損益為 100 × 10 = 1,000 元；這是算術推導，不是交易績效。

**限制與例外：** 不可把其他商品的乘數或口數直接套用到 TMF。

### K02：最小跳動

**類型：文件事實。知識主張：** TMF 的最小跳動（最小升降單位）為指數 1 點，相當於一口新臺幣 10 元。

**原文依據：**

- [S01／契約規格表：最小升降單位](https://www.taifex.com.tw/cht/2/tMF)（E03）

> 指數1點（相當於新臺幣10元）

**本輪推導／使用意義：** 策略下單價、滑價和成本換算需符合 tick 與整數口數；每點價值與 tick 數是不同欄位。

### K03：日夜盤與到期合約例外

**類型：文件事實。知識主張：** TMF 日盤交易時間為 08:45–13:45，夜盤為 15:00–次日 05:00；到期月份契約最後交易日的日盤至 13:30，且該到期契約當日沒有夜盤。時間採 Asia/Taipei。

**原文依據：**

- [S01／契約規格表：交易時間](https://www.taifex.com.tw/cht/2/tMF)（E04）

> 一般交易時段之交易時間為營業日上午8:45~下午1:45；到期月份契約最後交易日之交易時間為上午8:45~下午1:30 盤後交易時段之交易時間為營業日下午3:00~次日上午5:00；到期月份契約最後交易日無盤後交易時段

**本輪推導／使用意義：** 資料品質檢查要依契約月份套用時段；到期例外不代表所有月份都沒有夜盤。

**限制與例外：** 遇休市、天然災害等特殊情況仍須查官方交易日曆與公告。

### K04：最後交易日與交割

**類型：文件事實。知識主張：** TMF 最後交易日通常為交割月份第 3 個星期三；若遇假日或不可抗力未能交易，改為最近的次一營業日；到期採現金交割。

**原文依據：**

- [S01／契約規格表：最後交易日](https://www.taifex.com.tw/cht/2/tMF)（E05）

> 各契約的最後交易日為各該契約交割月份第3個星期三

- [S01／契約規格表下方假日例外](https://www.taifex.com.tw/cht/2/tMF)（E06）

> 最後交易日若為假日或因不可抗力因素未能進行交易時，以其最近之次一營業日為最後交易日。

- [S01／契約規格表：交割方式](https://www.taifex.com.tw/cht/2/tMF)（E07）

> 以現金交割，交易人於最後結算日依最後結算價之差額，以淨額進行現金之交付或收受

**本輪推導／使用意義：** 換月與到期處理不能只用每月固定曆日；保留實際到期月份與交易日曆。

**限制與例外：** 最後結算價不是任意選取的收盤成交價；本輪未建立完整結算價計算器。

### K05：夜盤交易日歸屬

**類型：文件事實。知識主張：** 盤後交易（夜盤）以一般交易時段收盤為交易及結算作業的劃分點，夜盤交易歸屬次一一般交易時段。

**原文依據：**

- [S02／交易及部位歸屬原則](https://www.taifex.com.tw/cht/4/aHIntroduction)（E08）

> 每日交易及結算作業以一般交易時段收盤為劃分點，盤後交易時段之交易屬於次一一般交易時段；

**本輪推導／使用意義：** 資料需分開記錄時間戳、曆日與交易所交易日；週末與休市應用官方日曆，不能單純加一天。

**限制與例外：** 本輪沒有取得完整假日日曆與行情樣本，尚未驗證跨夜資料轉換程式。

### K06：ROD 是當盤有效

**類型：文件事實。知識主張：** 期交所盤後交易制度下，ROD 委託僅在該委託申報的交易時段有效；「當日有效」調整為「當盤有效」。

**原文依據：**

- [S02／委託申報種類](https://www.taifex.com.tw/cht/4/aHIntroduction)（E09）

> 委託之有效時間將配合調整，僅在該委託申報的交易時段有效，意即「當日有效」改為「當盤有效」。

**本輪推導／使用意義：** 日盤未成交委託不能假設自動延續到夜盤；回測需記錄委託有效時段與到期取消。

**限制與例外：** 未驗證任何券商 API 是否另提供自動重新送單功能。

### K07：保證金快照與券商下限

**類型：文件事實。知識主張：** 本輪擷取的期交所保證金頁列 TMF 結算／維持／原始保證金為 25,950／26,900／35,050 元，頁面更新日期為 2026-08-12；契約規格要求期貨商收取標準不得低於公告的原始及維持水準。

**原文依據：**

- [S03／股價指數類：欄位順序](https://www.taifex.com.tw/cht/5/indexMarging)（E10）

> 商品別 結算保證金 維持保證金 原始保證金

- [S03／股價指數類：微型臺指期貨列](https://www.taifex.com.tw/cht/5/indexMarging)（E11）

> 微型臺指期貨 25,950 26,900 35,050

- [S03／表格下方更新日期](https://www.taifex.com.tw/cht/5/indexMarging)（E12）

> 更新日期：2026/08/12

- [S01／契約規格表：保證金](https://www.taifex.com.tw/cht/2/tMF)（E13）

> 期貨商向交易人收取之交易保證金及保證金追繳標準，不得低於本公司公告之原始保證金及維持保證金水準

**本輪推導／使用意義：** 這是 2026-10-02 所見頁面快照；數值不是永久常數，頁面更新日也不是已查明的生效日。實際保證金需重查當時公告與券商規則。

**限制與例外：** 未取得生效公告或券商實收規則；不能把此數值當成歷史回測保證金或個人帳戶要求。

### K08：TradingView 商品與連續合約

**類型：文件事實。知識主張：** TradingView 公開商品頁存在 TAIFEX:TMF1!，名稱為 MICRO TAIEX FUTURES，類型標示 Continuous contract（連續合約）。

**原文依據：**

- [S04／頁面標題](https://www.tradingview.com/symbols/TAIFEX-TMF1!/)（E14）

> MICRO TAIEX FUTURES Price Chart — TAIFEX:TMF1! — TradingView

- [S04／商品頁標頭](https://www.tradingview.com/symbols/TAIFEX-TMF1!/)（E15）

> MICRO TAIEX FUTURES Continuous contract Continuous contract TMF1! Taiwan Futures Exchange

**本輪推導／使用意義：** 已找到對應商品頁；連續序列與實際到期月份需分開保存。公開商品頁不等於已取得行情下載權。

**限制與例外：** 換月規則、復權設定、資料歷史、帳號可用權限與實際 Pine 圖表操作尚未驗證。

### K09：Pine 預設市價單成交時點

**類型：文件事實。知識主張：** Pine 策略 broker emulator 預設最早在下一個可用 tick 成交；預設每根 K 線收盤後計算時，收盤產生的市價單通常在下一根 K 線開盤成交。

**原文依據：**

- [S05／#orders-and-trades](https://www.tradingview.com/pine-script-docs/concepts/strategies/#orders-and-trades)（E16）

> By default, the earliest point at which the broker emulator fills an order is on the next available tick

- [S05／#orders-and-trades](https://www.tradingview.com/pine-script-docs/concepts/strategies/#orders-and-trades)（E17）

> If a strategy uses the default calculation behavior , it updates its calculations only after a bar closes, meaning the next tick on which an order can fill is at the open of the following bar .

**本輪推導／使用意義：** 訊號產生時間與成交時間分開記錄，跨引擎對帳需對齊計算與成交設定。

**限制與例外：** process_orders_on_close、逐 tick 計算、委託種類與其他執行設定會改變行為；此主張不是所有委託的共同成交規則。

### K10：高週期 lookahead 的必要檢查

**類型：官方方法指引。知識主張：** 使用 request.*() 取得高週期資料時，不應在未對資料序列作歷史位移的情況下使用 barmerge.lookahead_on，以免把未來資訊洩漏到歷史。

**原文依據：**

- [S05／#lookahead-bias](https://www.tradingview.com/pine-script-docs/concepts/strategies/#lookahead-bias)（E18）

> Do not include barmerge.lookahead_on in request.*() calls without offsetting the data series with the history-referencing operator , especially when requesting data from a higher timeframe.

**本輪推導／使用意義：** 歷史位移需要對照實際請求的週期與策略使用方式；記錄訊號當時是否已知。

**限制與例外：** 不能把「有位移」直接等同完全沒有偏差；資料、其他計算設定與整個策略仍需檢查。本輪未編譯 Pine。

## 十題檢索與回答審閱

問題集先於知識整理寫入 [questions.json](questions.json)，但題目由同一研究 Agent 設計，是開發集，不是獨立盲測。檢索使用 SQLite FTS5/BM25，僅索引知識主張的中文字元雙連字與英文詞，不索引標準答案或題目。

八題有來源的問題，所需知識均出現在前三筆結果。其餘两題由本輪 Agent 核對後明確記錄來源不足；檢索器會傳回附近資料，但附近資料不能當作問題的答案。

### Q01：TMF 一口每點價值與最小跳動是多少？

一口每點新臺幣 10 元；最小跳動為 1 點，即一口 10 元。這不包含手續費、交易稅或滑價。

依據：K01、K02。實際 top-3：K02、K01、K03。

### Q02：TMF 日盤和夜盤交易時間如何區分？到期合約有什麼例外？

日盤 08:45–13:45，夜盤 15:00–次日 05:00（台北）；到期月份契約最後交易日到 13:30，該到期契約沒有夜盤。

依據：K03。實際 top-3：K03、K05、K08。

### Q03：盤後交易的交易日歸屬，能否直接使用成交的曆日？

不能直接用成交曆日；夜盤歸屬次一一般交易時段，須搭配交易日曆處理週末與休市。

依據：K05。實際 top-3：K05、K06、K09。

### Q04：TMF 最後交易日與現金交割規則是什麼？

通常是交割月份第 3 個星期三，假日或不可抗力不能交易時順延到最近次一營業日；到期為現金交割。

依據：K04。實際 top-3：K04、K03、K05。

### Q05：TMF 原始保證金可以永遠固定成一個數字嗎？

不能。本輪僅有頁面快照，原始保證金列 35,050 元；更新日不是生效日證據，實際使用前須重查公告與券商規則。

依據：K07。實際 top-3：K07、K09、K02。

### Q06：TradingView 上的 TMF1! 是什麼商品與合約類型？

商品頁為 TAIFEX:TMF1!，名稱 MICRO TAIEX FUTURES，標示連續合約；尚未驗證行情權限與換月/復權設定。

依據：K08。實際 top-3：K08。

### Q07：Pine 策略在收盤產生市價單，預設什麼時候成交？

在預設收盤計算下，市價單最早下一個可用 tick，通常為下一根 K 線開盤成交；改變計算/成交設定時須另核對。

依據：K09。實際 top-3：K09、K05。

### Q08：使用 lookahead_on 取得高週期資料時，怎樣避免未來資料洩漏？

官方要求不要對未作歷史位移的序列使用 lookahead_on，尤其高週期請求；仍須檢查其他未來資料洩漏途徑。

依據：K10。實際 top-3：K10。

### Q09：我的券商交易 TMF 每口實際手續費是多少？

來源不足：本輪沒有你的券商、帳戶費率或成交費用文件，不能填入實際每口手續費。需要券商費率或成交明細。

依據：無可支持答案的單元。實際 top-3：K03、K04、K01。

### Q10：哪個 TMF 策略已證明可以穩定獲利，應該直接採用？

來源不足：本輪沒有行情快照、候選策略回測、樣本外驗證或模擬紀錄，不能推薦已證明穩定獲利的 TMF 策略。

依據：無可支持答案的單元。實際 top-3：K09、K02、K03。

## 驗證證據

- 10 筆資料符合儲存庫原有 KnowledgeUnit JSON Schema，引用 ID、主張 hash 與 18 段摘錄 hash 一致。
- 5 個實際下載的快照及 18 段摘錄位置核對通過；探索途中回 HTTP 200 的 404 轉址頁被排除。
- 8/8 有來源題目通過「全部必要單元位於 top-3」的開發檢索檢查；2 題保留人工審閱的拒答。
- 查詢截至 2026-09-30 可知資料時，本輪 2026-10-02 快照全部排除，避免把新取得版本回填成過去已知。
- `npm run verify` 已執行：檢查通過、8/8 整合測試通過、Worker 建置完成。

詳細研究結果：[validation.json](validation.json)。專案結果：[project-validation.json](project-validation.json)。原文出現與資料格式檢查不能代替語意判斷；本輪沒有獨立驗證器或 LLM 問答效果測試。

## 未知與下一輪

- TMF 原生歷史資料起點、可取得範圍與使用權仍未查明；沒有行情下載或授權資料樣本。
- 沒有券商手續費、交易稅模型、完整成本、實際保證金生效公告與個人帳戶要求。
- 沒有 Pine 編譯、真實回測、樣本外評估、策略推薦、模擬或實盤。
- 未找到本輪五份文件間的直接衝突；沒有衝突案例不代表衝突處理已驗證。

建議下一輪先追問：**TMF 原生行情能合法取得哪些歷史，資料是否同時保留實際合約月份與交易所交易日？** 授權與欄位確認後再取一日日夜盤樣本。一般商品研究不必等待使用者指定本金；涉及個人風險的參數仍需使用者決定。

## 檔案與重現

- [knowledge.json](knowledge.json)：10 個符合既有 schema 的知識單元；推導、分類與審閱 metadata 放在獨立 annotations。
- [sources.json](sources.json)：5 份來源與 18 段可定位短摘錄。
- [questions.json](questions.json)、[answer-review.json](answer-review.json)：問題與逐題可讀答案。
- [validation.json](validation.json)、[project-validation.json](project-validation.json)：已執行結果。
- [run.json](run.json)：選題、工具、失敗診斷、未知與後續研究。
- [verify.py](verify.py)：重跑 schema／引用檢查與檢索；不讀寫工作台資料庫。

研究稽核使用 Python 3、SQLite FTS5 與 `jsonschema`（目前環境已有）；應用程式仍使用原本的 Node 24，沒有新增 npm 依賴。

```sh
cd /workspace/AutoStrat-Bot
python3 research/cycles/tmf-001/verify.py
python3 research/cycles/tmf-001/verify.py --query "夜盤交易日歸屬"
```

本輪原始下載快照保留於 `/tmp/tmf-research`，不納入 Git；在快照仍存在的本次環境，可加 `--raw-dir /tmp/tmf-research` 重核原文位置。新環境若沒有快照，該項會明示 `unrun`；需重新取得官方來源再核對，不能宣稱舊快照檢查重新通過。

本輪成果目前存於雲端專案，尚未提交或推送 GitHub；也沒有改寫工作台資料庫或預設任務進度。此報告本身足夠審閱，工作台不是前置。
