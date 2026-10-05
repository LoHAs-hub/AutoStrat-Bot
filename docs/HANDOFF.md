# 下個工作階段從這裡開始

更新：2026-10-05（台北）。最新任務是減少人工 TradingView 驗證負擔，建立安全的登入接管方案，入口 **`docs/TRADINGVIEW-ACCESS.md`**。A2 研究入口仍為 `research/cycles/tmf-002/experiments/a2/REPORT.md`；原生編譯／微台績效未執行。

## 登入協作與安全查核

- 使用者希望 Agent 自行完成登入後研究，人工只處理必要登入／2FA／批准；不再交回整份 NATIVE-RUN 要使用者逐項操作。
- 使用者已確認環境只有本人存取，GPT 沒有 Agent 模式，要求在目前 Codex 雲端登入。不要再重問這兩項，也不把另一個 Agent 模式當作可用方案。本人存取是使用者確認，平台保存／管理權限仍非工具可核實。
- 本 repo 於 10/5 由 GitHub API 確認 public；網路 runtime 仍 unrestricted、enforcement unknown。沒有可用的私密瀏覽器接管／ingress 工具，不能聲稱雲端足夠封閉或已能安全托管主帳號。
- 最新匿名實測：一般指令路徑遭 Chromium sandbox helper 所見擁有者問題，namespace 替代也失敗；標準核准路徑成功，Namespace／PID／Network／Seccomp-BPF／TSYNC 啟用、未用 no-sandbox、TLS 保留，Pine Editor HTTP 200。結果在 ACCESS-CONFIG；這證明瀏覽器可運作，沒有證明已有人機接管或安全的持久 session。
- 已讀 VPN/runtime 指引，未配置 VPN／TCP grants；該轉發只支援由雲端向外連接、不支援 inbound。缺的是可供使用者登入同一瀏覽器的受管私密入口，安裝 VNC 本身不能解決。已詢問客戶端是否有 Browser／Desktop／private Preview／Ports 入口，尚待回覆。
- 新增 Git auth/profile/HAR 忽略保護，18 個敏感路徑與 4 個正常路徑測試通過；目前 tracked tree 的有限常見憑證模式掃描未發現匹配，不是完整歷史或資安認證。
- 已保存並讀回確認：restricted 網域草稿、start_skill，以及取代早期需求文字的 install_script；後者實際執行通過 Node/Python 前置與既有 8/8 整合測試及 Worker 建置。A2 25/25 合成測試亦通過。設定尚未由使用者儲存／發布，runtime 未變；細節在 CONFIG 紀錄，無新增 secrets。
- 下一步取得綁定此環境且經身分驗證的私密互動入口，再做無帳號接管／撤銷驗證；完成環境設定發布後另查 runtime enforcement。沒有入口前不收憑證、不匯入 Cookie、不公開 VNC/CDP、不代開新付費服務；不把 GitHub、網路 allowlist 或背景截圖當成登入介面。

## 最新授權與實際進度

- 使用者希望 Agent 自主發現現象、形成可測規則並驗證、依結果保留／修正／淘汰。0.618、價格回測、盤中手法與 45 分鐘等都是可參考經驗，非必採條件。一般研究與專案內實作／驗證不逐項等確認；重要規則、風控和結論整包回報。
- 實際商品限微台 TMF，TradingView `TAIFEX:TMF1!` 為主。TXF 公開心得可供靈感，不能移植其數值與績效。沒有新增費用、帳號權限、持久憑證或實盤授權；原 GitHub 成果同步已授權。
- 已核對原成果在既有 `LoHAs-hub/AutoStrat-Bot`，原 main 基準 `df8d2b76a0eeeec1308ccc8fd99280805dd8c407`，本機分支 `work`。推送沿用 `HEAD:refs/heads/main`，不得 force push 或覆蓋他人修改。原交付見 DELIVERY.md。
- A2 檢查「同一批突破事件，等待價格回測並收回是否優於直接進場」。共用突破時凍結的停損與事件期限，盤內一口，收盤確認／下一 tick 模擬成交；選 30 分鐘以配合正常日盤長度，沒有用 30 分鐘行情或績效挑參數。完整規則見 A2 SPEC，既有格式 StrategySpec v2 仍為 draft。
- 已完成 Pine 原型、合成參照模型、25 項邊界／因果性／時序／成本測試與反例。合成 OHLC 證明同根停損停利順序會改變假設結果，不能反推微台成交。JS 並非 Pine broker emulator，沒有證明兩者一致。
- 原 10/2 日線／1h 圖與成本算術沿用，沒有新行情序列、微台 ATR／訊號或歷史績效。圖表參與了選機制，不是獨立留出。原 run／manifest／validation 不覆寫；A2 另有 experiment／verification。
- 10/4 原生能力實測：匿名 Pine Editor 可開啟／編輯，Ctrl+Enter 最小探針顯示 Sign in；沒有 A2 編譯結果或 Strategy Tester。證據在 A2 evidence。該結果只證明目前路徑受阻，不推定所有帳號功能或必須付費。
- 沿用 tmf-001 K01–K10：每點 10 元、tick 1 點、夜盤跨午夜、ROD 當盤有效；保證金與費率不能當永久常數。TradingView 條款限制外部非展示處理，隔離診斷行情未用、勿重用擷取 helper。
- 所有原生與市場驗證未執行處均明列。A2 假說保留待測，B 暫緩而非被否定；沒有獲利、勝率或可交易性結論。參照測試／程式完成／圖畫對都不是策略有效性。
- 每輪成果在對話與 GitHub 審閱，不先建工作台。區分「價格回測突破位」與「歷史績效回測」，以及「訊號確認／下單觸發／模擬成交」。

## 當前實作

七個工作台分頁：總覽、流程与示例、任務、知識地圖、交易原則、開源研究、聊天室交接。原生 Node 24 與 SQLite 開發環境，Cloudflare Worker 共用 API。無需 npm install。

API 支援持久保存、擁有者隔離、版本衝突、冪等請求、任務依賴與驗收證據。原則封存保留歷史。示例是固定規則，不是 LLM 或真實回測。

私人 Sites 已註冊，project_id 在 `.openai/hosting.json`。沒有成功發布狀態前，不把 expected_url 當成已上线網址。憑證不得存入檔案。之前工具回報兩次 aborted by user，不能從此判定真實中斷原因。

## 如何接續

1. 先讀 `research/cycles/tmf-002/experiments/a2/REPORT.md`、SPEC 與 NATIVE-RUN。舊 REVIEW-A 的等待確認不是現行授權；A2 已自主修改原 v1，不把它當等價轉譯。
2. 本地可用 `python3 research/cycles/tmf-002/experiments/a2/verify.py` 重跑合成／資料包檢查，必要時 `--project` 同跑既有開發檢查。通過只支持列出的功能，不支持交易有效性。
3. 優先接續已有權使用的 TradingView 原生編譯／訊號與成交對帳，再用相同事件比較 Retest 與 Direct。當前缺口是本雲端無可用登入工作階段，不是等待策略細節批准；不索取密碼／Cookie，不使用隔離行情或改查其他供應商。
4. 若仍無原生操作能力，依最新 ACCESS 方案取得人機私密接管；不要再要求使用者自行跑完整策略驗證。沒有接管能力就明列缺口，不得說 Agent 已登入或在背景持續研究。
5. 原工作台功能需要時使用 `npm run dev`；本輪未讀網站資料庫，沒有更新 UI 任務。研究成果與目前進度以 GitHub 檔案／提交為準。

## 未完成與限制

未完成：Pine 原生編譯、即時／重載一致性、微台歷史績效與獨立留出；持續知識庫 Agent／LLM／排程及實盤均未實作。A2 的 30 分鐘、N20／ATR14／M6／H12、收盤確認、盤內一口與假設成本是研究起點，未經行情調校，不是永久限制或個人適配。

## 驗證紀錄

2026-10-04 A2：25/25 合成邏輯測試、schema／引用／圖證完整性檢查通過；另執行 `npm run verify`，8/8 既有整合情境通過並完成 Worker 建置。原生 Pine 與微台歷史績效未執行。可重跑紀錄在 A2 verification.json／project-verification.json；沒有更動雲端設定草案或宣稱原生交易研究能力已就緒。

以下保留 2026-10-01 的應用與啟動歷史，不能當作目前仍然受阻的證據：

8 項 API/SQLite 整合情境通過，包含保存/重啟、重複請求、併發、驗收與相依、授權/跨來源、任務/原則/示例、決定性與 transaction rollback。Worker 建置與 fetch export 檢查通過。瀏覽器視覺與 WebMCP 實際 context 驗證未完成。

本機監聽遭沙箱 EPERM 阻擋，網路權限呼叫多次被取消且沒有執行結果。因此停止同一重試，保留本機成果。已註冊私人網站仍未發布；不要把 expected_url 當作成功部署。`artifacts/strategy-lab-preview.html` 是只供示範的離線快照，不保存操作。

恢復部署時：Sites bundled scripts 在目前執行環境未找到；需先取得可用的發布工具/權限。保留現有 project_id，勿再 create_site。檢查 D1 binding 格式與 migration 打包規格；採正式 Drizzle schema/generation 後檢查 SQL，再做來源推送、產物打包與 save/deploy。沒有曾成功部署的 migration，目前 db/0000_initial.sql 僅由本機 migration runner 套用。

## 跨裝置 project root 問題

以下是 2026-10-01 的歷史排查。2026-10-02 本次工作實際儲存庫根目錄為 `/workspace/AutoStrat-Bot`，已從舊基準 fast-forward 至遠端 `main` 的 `95a1fd8`；以實際 `git rev-parse --show-toplevel` 為準。

使用者回報另一裝置在送訊息時出現 `unable to determine project root`。環境 status 為 running/connected；但啟始 cwd `/workspace` 的 `.git` 是空的唯讀掛載。專案原先只是子目錄，故已在 `/workspace/strategy-lab` 初始化 Git 並建立基準提交。有效 root 應為 `/workspace/strategy-lab`，不是 `/workspace`。客戶端的對話/專案綁定不在目前工具可修改範圍，若錯誤仍在，需要在該裝置重新開啟/連結同一專案或由產品支援檢查；不可宣稱已修復跨裝置問題。

## GitHub 儲存庫

使用者指定的遠端：https://github.com/LoHAs-hub/AutoStrat-Bot ，預設分支 main。推送前已確認寫入權限，遠端僅有初始化 README（初始 commit 07d6ea931065b63dabcc0534ebab0bd129ce1cf7）。保留該歷史，再提交本專案。這個遠端是跨裝置保存原始碼的入口，不代表聊天室綁定或網站發布已完成。見 docs/GETTING_STARTED.md。
