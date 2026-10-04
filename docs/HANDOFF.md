# 下個工作階段從這裡開始

更新：2026-10-02（台北）。目前保留循環 00 工作台，完成 tmf-001 知識包與 tmf-002 圖表觀察／策略草案審閱包；持續知識庫 Agent 尚未實作。

## 最新接續入口

- **最新使用者方向**：以 TradingView `TAIFEX:TMF1!` 實際可讀行情自主研究策略、成本與風控。TXF 公開心得可作機制參考，但微台實際分析／測試／成本不能混用 TXF。45 分鐘、固定根數／日期／候選數量／驗證方法都不是硬限制。小研究步驟自行推進，重要規則／風控／較大實作整包審閱；不是全部實作、付費或真實交易批準。
- **最新成果入口**：`research/cycles/tmf-002/REPORT.md`。實際讀到微台日線／1h 圖，保留兩張圖及 ATR 免費帳號提示；提出 A「突破後回測」、B「區間假突破回歸」與既有 StrategySpec 格式草案。原提案已封存為 `TASK-v0.1.md`。
- **已計算／未計算**：微台成本算術情境來回約 59.6／119.6／179.6 元，使用明示未校準費／滑價與股價類交易稅通則；不是實際帳戶成本。沒有 ATR、訊號、Pine 編譯、逐筆交易、回測或有效性結論。審閱包格式／引用／hash／成本重算結果在 `validation.json`。
- **具體阻礙與最小下一步**：未登入圖表加入內建 ATR 遇免費帳號提示；TradingView 條款第 3 節限制外部非展示／機器處理，已停止批次擷取並隔離診斷行情，不用它計算。下一步使用已有權使用、已登入的 TradingView 原生 Pine／Strategy Tester；不預設買服務，也不轉做其他供應商研究。
- **優先序調整**：其他歷史資料供應商、交易日與合約月份欄位整理不作下一輪主要交付；資料存取、換月與使用權實際阻礙時，才說明操作、影響和最小協助。tmf-001 的舊建議保留為歷史紀錄。

- 使用者希望 Agent 自主探索交易知識，先用對話與可審閱檔案驗收；若檔案無法開啟，貼出內容，之後再視需要建工作台。
- 已完成 `research/cycles/tmf-001/REPORT.md`：五份官方來源、十個知識單元、十八段可定位短摘錄、十題檢索/回答審閱集。
- 已確認期交所 TMF 每點 10 元、tick 為 1 點；夜盤歸屬次一一般交易時段，ROD 為當盤有效。TradingView 公開頁為 `TAIFEX:TMF1!`，標示連續合約。資料權限、換月/復權與完整行情歷史未驗證。
- 保證金頁於本輪擷取時列原始 35,050 元；它只是 2026-10-02 所見快照，頁面更新日 2026-08-12 不等於已查明生效日，不能寫成永久值或個人帳戶要求。
- 八題有來源的開發問題均於 top-3 取得所需單元；兩題由本輪 Agent 審閱後記錄來源不足。這不是盲測、獨立評估或 LLM 問答能力證明。
- 研究資料符合既有 KnowledgeUnit JSON Schema，原文摘錄與快照 hash 已核對；`npm run verify` 本輪再次執行，8/8 通過並完成 Worker 建置。詳細結果見 `validation.json` 與 `project-validation.json`。
- tmf-001 原建議查原生資料與欄位，已由上述最新使用者方向調整。既有知識繼續提供商品、成交時點與風控檢查；勿據此宣稱資料、Pine、回測或背景 Agent 已完成。
- 本輪未讀取最新網站資料庫，因此沒有修改工作台任務狀態或 `src/catalog.mjs` 的進度。研究檔案目前在雲端工作目錄，尚未提交或推送 GitHub。

## 使用者決策

- Harness 指 Agent Harness／Harness Engineering。
- 實際研究商品為微型台指期貨 TMF，入口 TAIFEX:TMF1!；TXF 公開觀點允許供假說參考，數值／驗證不移植。原 MXF1! 不是研究標的。
- 唯一已確認的主觀原則：「嚴格執行交易計劃」。
- 先討論與示例驗收，到階段關卡再批次實作；整理交接後可換新聊天室。
- 原先希望網站顯示任務，2026-10-02 改為優先在對話審閱檔案，工作台按需再做。未要求現在就接入實盤。

## 當前實作

七個工作台分頁：總覽、流程与示例、任務、知識地圖、交易原則、開源研究、聊天室交接。原生 Node 24 與 SQLite 開發環境，Cloudflare Worker 共用 API。無需 npm install。

API 支援持久保存、擁有者隔離、版本衝突、冪等請求、任務依賴與驗收證據。原則封存保留歷史。示例是固定規則，不是 LLM 或真實回測。

私人 Sites 已註冊，project_id 在 `.openai/hosting.json`。沒有成功發布狀態前，不把 expected_url 當成已上线網址。憑證不得存入檔案。之前工具回報兩次 aborted by user，不能從此判定真實中斷原因。

## 如何接續

1. `npm run verify`，需要查看時 `npm run dev`。
2. 閱讀本文件、PROJECT 和最新工作台匯出；資料庫狀態可能比 catalog 基準新。
3. 先讀 tmf-002 REPORT、OBSERVATIONS、CANDIDATES 與 COSTS；規則 v1 供整包審閱，60 分鐘等參數是未調校研究起點，不當作使用者偏好。已看過的圖表窗口參與選機制，不能當獨立留出。
4. 取得支援的已登入 TradingView 原生研究環境後，先核對 A 的成交／成本與簡單突破基準，保存版本／參數／全部調整與負面結果。編譯、績效與樣本外各自標狀態，不以草案或格式驗證冒稱完成。
5. 使用者尚未指定模型供應商或 API key；目前不要安裝大框架或宣稱自主 Agent 已存在。

## 未完成與限制

已完成對話內的小型知識整理、FTS5 開發檢索與微台圖表觀察／規則草案；持續知識收集 Agent、語意檢索、LLM、Pine 編譯、授權行情匯入、回測、背景排程、對話自動同步、模擬／實盤皆未實作。JSON 可匯出但未實作還原匯入器。個人數值風控未確認；草案的一口／跨盤／連虧停止是研究提議。

## 驗證紀錄

8 項 API/SQLite 整合情境通過，包含保存/重啟、重複請求、併發、驗收與相依、授權/跨來源、任務/原則/示例、決定性與 transaction rollback。Worker 建置與 fetch export 檢查通過。瀏覽器視覺與 WebMCP 實際 context 驗證未完成。

本機監聽遭沙箱 EPERM 阻擋，網路權限呼叫多次被取消且沒有執行結果。因此停止同一重試，保留本機成果。已註冊私人網站仍未發布；不要把 expected_url 當作成功部署。`artifacts/strategy-lab-preview.html` 是只供示範的離線快照，不保存操作。

恢復部署時：Sites bundled scripts 在目前執行環境未找到；需先取得可用的發布工具/權限。保留現有 project_id，勿再 create_site。檢查 D1 binding 格式與 migration 打包規格；採正式 Drizzle schema/generation 後檢查 SQL，再做來源推送、產物打包與 save/deploy。沒有曾成功部署的 migration，目前 db/0000_initial.sql 僅由本機 migration runner 套用。

## 跨裝置 project root 問題

以下是 2026-10-01 的歷史排查。2026-10-02 本次工作實際儲存庫根目錄為 `/workspace/AutoStrat-Bot`，已從舊基準 fast-forward 至遠端 `main` 的 `95a1fd8`；以實際 `git rev-parse --show-toplevel` 為準。

使用者回報另一裝置在送訊息時出現 `unable to determine project root`。環境 status 為 running/connected；但啟始 cwd `/workspace` 的 `.git` 是空的唯讀掛載。專案原先只是子目錄，故已在 `/workspace/strategy-lab` 初始化 Git 並建立基準提交。有效 root 應為 `/workspace/strategy-lab`，不是 `/workspace`。客戶端的對話/專案綁定不在目前工具可修改範圍，若錯誤仍在，需要在該裝置重新開啟/連結同一專案或由產品支援檢查；不可宣稱已修復跨裝置問題。

## GitHub 儲存庫

使用者指定的遠端：https://github.com/LoHAs-hub/AutoStrat-Bot ，預設分支 main。推送前已確認寫入權限，遠端僅有初始化 README（初始 commit 07d6ea931065b63dabcc0534ebab0bd129ce1cf7）。保留該歷史，再提交本專案。這個遠端是跨裝置保存原始碼的入口，不代表聊天室綁定或網站發布已完成。見 docs/GETTING_STARTED.md。
