# AutoStrat-Bot｜策略研究工作台

GitHub 儲存庫：https://github.com/LoHAs-hub/AutoStrat-Bot

首次使用請先看 [環境與跨裝置接續指南](docs/GETTING_STARTED.md)。

以 Agent Harness 管理**微型台指期貨 TMF**研究專案。第一個可跑版本提供任務、階段流程、知識地圖、交易原則、固定 Harness 示範與跨聊天室交接。

## 立即執行

需要 Node.js 24+，不需安裝套件。

```sh
npm run dev
```

在同一台機器開啟 http://127.0.0.1:4173 。SQLite 資料保存在 `.local/workspace.sqlite`，重啟不會清空。此位址是本機位址，不代表使用者可從其他機器直接存取。雲端網址需 Sites 發布成功才可使用。

```sh
npm run verify  # 語法、契約檢查、整合測試、Worker 建置
npm run demo    # 無 LLM、無市場資料的固定示例，產物在 artifacts/
npm run handoff # 本機伺服器開啟時匯出 Markdown + JSON
npm run preview:offline # 產生只讀、不保存修改的單檔介面示例
```

## 已實作與後續範圍

| 已實作 | 尚未實作 |
|---|---|
| 六階段工作台、任務新增/狀態/完成證據 | 自主知識收集、語意檢索 |
| 使用者原則保存、封存、事件紀錄 | LLM 策略生成、Pine 編譯 |
| 版本衝突檢查與冪等寫入 | TradingView 登入、操作或資料整合 |
| 固定規則 Harness 示範與檢查關卡 | 真實市場回測、模擬下單、實盤 |
| 完整資料匯出與聊天室交接 | 定時背景 Agent、聊天室自動同步 |

示例的 `null` 表示尚未決定，不是可供交易的預設值。沒有預設本金、風險百分比、日損上限或績效。

## 檔案地圖

- `AGENTS.md`：給下個 Agent 的入口。
- `docs/PROJECT.md`：總體流程、知識結構、策略與風控基準。
- `docs/ARCHITECTURE.md`：系統邊界、資料與未來擴充。
- `docs/RESEARCH.md`：Harness 與第三方整合的來源和限制。
- `docs/ACCEPTANCE.md`：階段驗收情境。
- `docs/HANDOFF.md`、`docs/PROGRESS.md`：接續工作與執行狀態。
- `src/`：繁體中文工作台。
- `server/api.mjs`：本機與雲端共用 API。
- `lib/`：邊界驗證與固定 Harness 示範。
- `db/`：SQL 結構；`schemas/`：後續 Agent 的 JSON Schema 草案。
- `scripts/`：本機 SQLite、伺服器、建置、匯出。
- `tests/`：資料保存、授權、版本競爭、依賴與驗收關卡。

## 資料責任

規格與研究筆記以 Git 保存，使用者修改的工作台狀態以資料庫為準。網站開啟後每 45 秒在閒置時更新一次，切回視窗也會讀取；有未送出的表單時不覆蓋輸入。這不是背景研究 Agent。

部署至私人 Sites 時，資料使用 D1；工作台綁定首次經平台驗證的使用者，不接受其他使用者讀寫。本機只綁 loopback，使用獨立的 local-owner 身分。不得把本機伺服器直接公開到網際網路。

備份應包含 Git 原始碼與 `/api/export` 最新完整 JSON。JSON 用於可攜與交接；本版沒有網站匯入功能。若需還原到新資料庫，先實作經 schema 驗證的匯入器。本機 SQLite 檔案另可在伺服器停止後備份。

## 本輪交付狀態

程式與 8 項整合測試已完成；私人 Sites 尚未發布。本機 listen 被目前沙箱 EPERM 阻擋，帶網路權限的啟動呼叫多次取消，故沒有瀏覽器 QA 結果。`artifacts/strategy-lab-preview.html` 可在一般瀏覽器開啟，明確為離線示例，不保存修改。實際持久功能由完整伺服器提供，已用真實 SQLite 整合測試驗證。
