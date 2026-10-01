# 下個工作階段從這裡開始

更新：2026-10-01。當前循環 00：專案定義、互動工作台與固定 Harness 示範。

## 使用者決策

- Harness 指 Agent Harness／Harness Engineering。
- 只研究微型台指期貨 TMF。原連結是 MXF1!，使用者已明確選擇以 TMF 為準；TradingView 對應代碼另查。
- 唯一已確認的主觀原則：「嚴格執行交易計劃」。
- 先討論與示例驗收，到階段關卡再批次實作；整理交接後可換新聊天室。
- 網站須顯示目前任務與狀況。未要求現在就接入實盤。

## 當前實作

七個工作台分頁：總覽、流程与示例、任務、知識地圖、交易原則、開源研究、聊天室交接。原生 Node 24 與 SQLite 開發環境，Cloudflare Worker 共用 API。無需 npm install。

API 支援持久保存、擁有者隔離、版本衝突、冪等請求、任務依賴與驗收證據。原則封存保留歷史。示例是固定規則，不是 LLM 或真實回測。

私人 Sites 已註冊，project_id 在 `.openai/hosting.json`。沒有成功發布狀態前，不把 expected_url 當成已上线網址。憑證不得存入檔案。之前工具回報兩次 aborted by user，不能從此判定真實中斷原因。

## 如何接續

1. `npm run verify`，需要查看時 `npm run dev`。
2. 閱讀本文件、PROJECT 和最新工作台匯出；資料庫狀態可能比 catalog 基準新。
3. 先驗收循環 00；接著談 TMF 官方契約、TradingView 代碼、K 線週期与日夜盤。
4. 用小資料樣本驗收授權/品質，再決定知識庫 Agent 的一個批次實作範圍。
5. 使用者尚未指定模型供應商或 API key；目前不要安裝大框架或宣稱自主 Agent 已存在。

## 未完成與限制

知識收集、語意檢索、LLM、Pine 編譯、市場資料、回測、背景排程、對話自動同步、模擬/實盤皆未實作。JSON 可匯出但未實作還原匯入器。各階段估算在示例驗收後再訂；數值風控仍待決定。

## 驗證紀錄

8 項 API/SQLite 整合情境通過，包含保存/重啟、重複請求、併發、驗收與相依、授權/跨來源、任務/原則/示例、決定性與 transaction rollback。Worker 建置與 fetch export 檢查通過。瀏覽器視覺與 WebMCP 實際 context 驗證未完成。

本機監聽遭沙箱 EPERM 阻擋，網路權限呼叫多次被取消且沒有執行結果。因此停止同一重試，保留本機成果。已註冊私人網站仍未發布；不要把 expected_url 當作成功部署。`artifacts/strategy-lab-preview.html` 是只供示範的離線快照，不保存操作。

恢復部署時：Sites bundled scripts 在目前執行環境未找到；需先取得可用的發布工具/權限。保留現有 project_id，勿再 create_site。檢查 D1 binding 格式與 migration 打包規格；採正式 Drizzle schema/generation 後檢查 SQL，再做來源推送、產物打包與 save/deploy。沒有曾成功部署的 migration，目前 db/0000_initial.sql 僅由本機 migration runner 套用。

## 跨裝置 project root 問題

使用者回報另一裝置在送訊息時出現 `unable to determine project root`。環境 status 為 running/connected；但啟始 cwd `/workspace` 的 `.git` 是空的唯讀掛載。專案原先只是子目錄，故已在 `/workspace/strategy-lab` 初始化 Git 並建立基準提交。有效 root 應為 `/workspace/strategy-lab`，不是 `/workspace`。客戶端的對話/專案綁定不在目前工具可修改範圍，若錯誤仍在，需要在該裝置重新開啟/連結同一專案或由產品支援檢查；不可宣稱已修復跨裝置問題。

## GitHub 儲存庫

使用者指定的遠端：https://github.com/LoHAs-hub/AutoStrat-Bot ，預設分支 main。推送前已確認寫入權限，遠端僅有初始化 README（初始 commit 07d6ea931065b63dabcc0534ebab0bd129ce1cf7）。保留該歷史，再提交本專案。這個遠端是跨裝置保存原始碼的入口，不代表聊天室綁定或網站發布已完成。見 docs/GETTING_STARTED.md。
