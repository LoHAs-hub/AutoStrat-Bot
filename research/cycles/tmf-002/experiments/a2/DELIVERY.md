# A2 GitHub 交付清單

目的地：既有 [LoHAs-hub/AutoStrat-Bot](https://github.com/LoHAs-hub/AutoStrat-Bot)，遠端分支 `main`；本機工作分支 `work`。沿用普通 `HEAD:refs/heads/main` 推送，不建立新儲存庫、不變更公開性、不 force push。推送結果與固定 commit 由聊天室回報並核對遠端；本文件的版本可由 GitHub commit 歷史定位。

## 本次納入

A2 新增 18 檔，均位於 `research/cycles/tmf-002/experiments/a2/`：

- [DELIVERY.md](DELIVERY.md)
- [NATIVE-RUN.md](NATIVE-RUN.md)
- [REPORT.md](REPORT.md)
- [SPEC.md](SPEC.md)
- [counterexamples.json](counterexamples.json)
- [counterexamples.mjs](counterexamples.mjs)
- [evidence/native-access.json](evidence/native-access.json)
- [evidence/native-sign-in.png](evidence/native-sign-in.png)
- [experiment.json](experiment.json)
- [project-verification.json](project-verification.json)
- [project-verification.log](project-verification.log)
- [reference.mjs](reference.mjs)
- [reference.test.mjs](reference.test.mjs)
- [strategy-A-v2.json](strategy-A-v2.json)
- [tmf002_a2.pine](tmf002_a2.pine)
- [verification.json](verification.json)
- [verification.tap](verification.tap)
- [verify.py](verify.py)

更新 6 個既有入口／交接文件：

- [AGENTS.md](../../../../../AGENTS.md)
- [docs/HANDOFF.md](../../../../../docs/HANDOFF.md)
- [docs/PROGRESS.md](../../../../../docs/PROGRESS.md)
- [docs/PROJECT.md](../../../../../docs/PROJECT.md)
- [research/cycles/tmf-002/REPORT.md](../../../../../research/cycles/tmf-002/REPORT.md)
- [research/cycles/tmf-002/TASK.md](../../../../../research/cycles/tmf-002/TASK.md)

原 TMF-001／TMF-002 圖表與來源仍在原位置，由 A2 引用；未複製成另一份行情資料。原 10/2 run.json／review-manifest.json／validation.json 保留不變。

## 本次未納入

- TradingView 帳密、Cookie、token 與瀏覽器 profile：未讀取帳戶憑證，不屬版本管理內容。
- 暫存／隔離診斷行情、行情擷取 helper、完整第三方 HTML：未用於研究計算，不屬交付；不從可見網頁推定外部行情處理權利。
- `dist/`、ZIP、Python 快取、環境／代理設定：生成或機器暫存內容；既有 `.gitignore` 保留。測試 log 僅含這次本地驗證輸出。
- 原生編譯／Strategy Tester 報表：**尚未產生**，登入能力受阻，不能假稱檔案存在或以合成結果代替。
- 應用程式、資料庫、網站任務與雲端設定草案：本輪未變更，避免把研究文件進度寫成產品能力。

本地驗證：25 項合成測試、資料包檢查、既有 8 項整合測試及 Worker 建置通過；文件連結、研究程式 hash、提交範圍與常見憑證模式已核對。合成通過不等於 Pine 編譯或微台有效性，詳見 REPORT。
