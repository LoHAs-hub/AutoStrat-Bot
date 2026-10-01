# 架構与 Harness 實作邊界

## 目前可跑結構

```text
src/index.html + app.js + style.css
                  │ 同源 JSON
server/api.mjs ─── lib/contracts.mjs（驗證與關卡）
       │          lib/demo.mjs（固定示例，不含 LLM）
       ├── 本機：Node 24 HTTP → SQLite adapter → .local/workspace.sqlite
       └── 雲端：Cloudflare Worker → D1（Sites 平台驗證使用者）

src/catalog.mjs  → 版本化任務基準、來源、領域與規格
資料庫          → 使用者任務狀態、原則、操作事件、示例執行
GET /api/export → 完整狀態快照
GET /api/handoff→ 新聊天室摘要
```

雲端 Worker 與本機共用同一份 API，不重複維護業務邏輯。`scripts/build.mjs` 是無依賴、限制明確的模組合併器，只處理本專案列出的幾個模組；新增第三方套件或更複雜模組圖時再遷移至標準打包器。

本版無需安裝依賴，是因目前環境的兩次外部工具執行中斷後採取的最小可跑選擇。不是最終模型供應商或回測引擎決策。

## 資料與併發

工作台只有一位擁有者。平台的使用者 ID 由可信 Sites dispatcher 注入；首次讀取綁定 owner，其後不匹配即 403。本機僅 loopback，固定 local-owner 並覆寫客戶端提供的 ID。

每次寫入帶 `revision` 和 `requestId`。內容變更、事件與版本遞增在同一個 D1 batch/SQLite transaction 內；每項 SQL 都帶版本條件，過期寫入回 409 且不修改資料。相同 requestId/內容可安全重送；相同 requestId 不同內容拒絕。所有 SQL 使用參數。

任務進入實作/驗收/完成前檢查相依項；完成需要證據。重開已完成前置任務前須先處理已啟動的後續項。原則不做永久刪除；封存仍保留於匯出與事件中。

UI 在保存成功後才替換狀態；失敗維持表單。最新 80 筆事件、12 筆示例用於畫面；完整匯出包含所有資料。當累積資料量需要時，再加入伺服器分頁、匯出大小限制與串流，不把前端列表誤稱全部歷史。

## 未來 Agent Harness（規劃，未實作）

```text
任務佇列 / 評估預算
  → 初始化（載入目標、版本、工具範圍、檢查基準）
  → 檢索（最小上下文包，來源/原則版本）
  → 計劃與執行（模型/工具 adapter，timeout/retry）
  → 檢查（schema → deterministic gates → independent evaluator）
  → checkpoint（run/step/event/artifact）
  → 完成、退回、停止或重試
  → 整理交接（變更、驗證、失敗與下一步）
```

先一個 orchestrator + 可分離模組。不是先上多 Agent；只有當任務明確可獨立、評估能量化收益時再拆角色。模型 adapter、資料 adapter、browser adapter、回測 adapter 各自隔離。

一個真正 run 應記錄：run/parent id、task id、code commit、schema、model/provider、prompt/template hash、工具與權限快照、資料/知識/原則版本、seed、step 狀態、時間與 token/成本預算、artifact hash、失敗與重試、gate 結果、下一步。checkpoint 只允許完成的步驟提交，不把半成品當成已驗證輸出。

D1 保存狀態與索引。較大的市場序列與原文（取得權利後）保存為不可變檔案/物件儲存，使用 Parquet 或壓縮檔；embedding 是可重建快取。之後需要長時間回測/重模型時放到獨立執行器，勿在網站 request 中跑重型工作。

## 評估與成本

- 知識：引用正確率、來源涵蓋、過期識別、衝突檢出、檢索 recall、答案可追溯。
- 策略：schema 完整、原則遵守、規格可執行、編譯與跨引擎成交一致。
- Harness：恢復成功率、重複副作用、每步耗時與成本、任務完成率。
- 研究：固定試驗註冊、負面結果、樣本外与穩健性；不只用報酬率評價 Agent。

先驗收固定示例，再實作單一垂直流程。以 source hash 避免重讀，將回饋批次處理，交接時只載入入口地圖、當前計劃與必要依據。數值預算應在接入付費模型前決定。

## 部署與恢復

Private Sites id 寫在 `.openai/hosting.json`。保持擁有者私人存取；不新增公開權限。Worker default export 必须有 fetch。D1 結構變更應在發布階段套用，不在 request 中做 DDL。已部署 migration 不可重寫。

每輪保存 Git commit、完整狀態匯出、驗證結果與 HANDOFF。資料庫與 Git 各有權威範圍；不能只靠聊天室記憶。還原到新資料庫的匯入器尚未實作，故匯出不是已測試的一鍵還原功能。
