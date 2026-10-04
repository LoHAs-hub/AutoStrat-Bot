# TMF-002 GitHub 交付紀錄

交付日：2026-10-04（Asia/Taipei）。使用者明確要求沿用既有儲存庫同步審閱成果；未建立新儲存庫或改變公開性。

## 已確認的原成果同步

- 儲存庫：[LoHAs-hub/AutoStrat-Bot](https://github.com/LoHAs-hub/AutoStrat-Bot)。
- 既有 remote：`origin`，HTTPS 指向 `https://github.com/LoHAs-hub/AutoStrat-Bot.git`；沒有 URL 內嵌帳密。
- 雲端本機分支：`work`，原本無 upstream。專案既有主要分支：`main`。
- 原成果 commit：[`b98227939e35c8e4521062fcf5994aab6a03c51b`](https://github.com/LoHAs-hub/AutoStrat-Bot/commit/b98227939e35c8e4521062fcf5994aab6a03c51b)。
- 已執行 `git push origin HEAD:refs/heads/main`，從 `95a1fd8` 普通 fast-forward 到該 commit；`git ls-remote origin refs/heads/main` 核對相同 hash。沒有 force push 或覆寫其他分支。
- 先同步原成果，才開始內容審閱。原候選 A／B 與數值結果未因審閱而修改；追加文件及交接以後續提交保存，最新 head 以 `main` 和聊天室回報為準。

## 可直接開啟的成果

| 內容 | GitHub 入口 |
|---|---|
| 最新總報告與交付狀態 | [REPORT](https://github.com/LoHAs-hub/AutoStrat-Bot/blob/main/research/cycles/tmf-002/REPORT.md) |
| 候選 A 審閱、缺漏與待確認最小方案 | [REVIEW-A](https://github.com/LoHAs-hub/AutoStrat-Bot/blob/main/research/cycles/tmf-002/REVIEW-A.md) |
| 原 A／B 完整規則與共同風控 | [CANDIDATES](https://github.com/LoHAs-hub/AutoStrat-Bot/blob/main/research/cycles/tmf-002/CANDIDATES.md) |
| 原 A 的 StrategySpec | [strategy-A.json](https://github.com/LoHAs-hub/AutoStrat-Bot/blob/main/research/cycles/tmf-002/strategy-A.json) |
| 微台成本／風險情境與限制 | [COSTS](https://github.com/LoHAs-hub/AutoStrat-Bot/blob/main/research/cycles/tmf-002/COSTS.md) |
| 圖表觀察與資料邊界 | [OBSERVATIONS](https://github.com/LoHAs-hub/AutoStrat-Bot/blob/main/research/cycles/tmf-002/OBSERVATIONS.md) |
| 微台 1h 圖 | [hourly.png](https://github.com/LoHAs-hub/AutoStrat-Bot/blob/main/research/cycles/tmf-002/evidence/hourly.png) |
| 微台日線 | [daily.png](https://github.com/LoHAs-hub/AutoStrat-Bot/blob/main/research/cycles/tmf-002/evidence/daily.png) |
| ATR 免費帳號提示 | [indicator-account-gate.png](https://github.com/LoHAs-hub/AutoStrat-Bot/blob/main/research/cycles/tmf-002/evidence/indicator-account-gate.png) |
| 來源、原計算、驗證與研究紀錄 | [TMF-002 目錄](https://github.com/LoHAs-hub/AutoStrat-Bot/tree/main/research/cycles/tmf-002) |
| 沿用知識與來源 | [TMF-001 目錄](https://github.com/LoHAs-hub/AutoStrat-Bot/tree/main/research/cycles/tmf-001) |

原始內容可透過 commit 固定連結審閱：例如 [原 REPORT](https://github.com/LoHAs-hub/AutoStrat-Bot/blob/b98227939e35c8e4521062fcf5994aab6a03c51b/research/cycles/tmf-002/REPORT.md)。不需下載 ZIP。

## 納入檔案

原成果同步提交共 31 檔，包含 tmf-001（供引用追溯）及 tmf-002（報告、規則、風控、來源、圖、算術、驗證、原包 manifest），以及四個相關專案／交接文件：

```text
AGENTS.md
docs/HANDOFF.md
docs/PROGRESS.md
docs/PROJECT.md
research/cycles/tmf-001/REPORT.md
research/cycles/tmf-001/answer-review.json
research/cycles/tmf-001/knowledge.json
research/cycles/tmf-001/project-validation.json
research/cycles/tmf-001/questions.json
research/cycles/tmf-001/run.json
research/cycles/tmf-001/sources.json
research/cycles/tmf-001/validation.json
research/cycles/tmf-001/verify.py
research/cycles/tmf-002/CANDIDATES.md
research/cycles/tmf-002/COSTS.md
research/cycles/tmf-002/OBSERVATIONS.md
research/cycles/tmf-002/REPORT.md
research/cycles/tmf-002/TASK-v0.1.md
research/cycles/tmf-002/TASK.md
research/cycles/tmf-002/calculate_costs.py
research/cycles/tmf-002/cost-results.json
research/cycles/tmf-002/evidence/daily.png
research/cycles/tmf-002/evidence/hourly.png
research/cycles/tmf-002/evidence/indicator-account-gate.png
research/cycles/tmf-002/review-manifest.json
research/cycles/tmf-002/run.json
research/cycles/tmf-002/sources.json
research/cycles/tmf-002/strategy-A.json
research/cycles/tmf-002/strategy-B.json
research/cycles/tmf-002/validation.json
research/cycles/tmf-002/verify.py
```

後續審閱新增 `research/cycles/tmf-002/REVIEW-A.md`、本 `DELIVERY.md`，並只更新 `research/cycles/tmf-002/REPORT.md` 的交付提示、`AGENTS.md`、`docs/HANDOFF.md`、`docs/PROGRESS.md`。兩次提交合計涉及 33 個不同檔案。既有應用、測試、schema、依賴與 migration 未改。

## 未納入與原因

| 項目 | 原因／狀態 |
|---|---|
| `artifacts/` 中 ZIP 與既有預覽產物 | 既有 ignore；ZIP 是重複交付容器。本次已拆開相關可版本管理成果，不需 GitHub 使用者下載它。 |
| `dist/` 生成的建置檔 | 既有 ignore，能由程式重建；不是策略研究依據。 |
| 本次 Python import 產生的 `__pycache__/` | 執行快取，沒有提交；只清理本次產生的快取。 |
| `/tmp` 網頁完整快照、診斷 helper 與隔離行情 | 暫存、不適合當授權行情集；保留來源 metadata／短摘錄／圖表署名，不提交完整文章或批次行情。隔離日 K 未用於研究或回測。 |
| 憑證、Cookie、token、`.env`、私人資料庫等 | 不在本次提交清單，沒有為本次讀取內容；候選文字檔掃描未發現匹配的憑證字串。這不把掃描當作所有風險的保證。 |
| Pine 策略／原生測試結果 | 尚未生成／執行，不是推送失敗。最小指標驗收方案等待使用者確認。 |

沒有已批准同步但推送失敗的成果項目。圖表保留 TradingView 水印／來源；公開性維持儲存庫原設定。

## 驗證範圍與歷史快照

同步前重新核對資料包八項完整性檢查、三張圖 hash、原 ZIP manifest 32 個內容檔及 ZIP CRC；候選提交文字未見本次掃描規則的憑證命中。這些是交付與引用檢查，不是新行情測試、回測或有效性驗證。

`review-manifest.json` 記錄 2026-10-02 ZIP 的原版本 hash；以 `b98227939e35c8e4521062fcf5994aab6a03c51b` 中檔案核對，兩個既有 schema 也已在儲存庫。後續 REPORT／交接提示更動不回填舊 manifest。`run.json`、成本與驗證結果保留原研究時點，不把當時的「未推送」改寫成今天的研究執行證據。
