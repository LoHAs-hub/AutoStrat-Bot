# 研究紀錄與依據

查阅日期：2026-09-30。下列四份官方文章/文件已取得全文並查閱相關段落；GitHub 項目僅查核 API metadata，不代表已審查或執行程式碼。2026-10-01 使用者已確認單一研究標的 TMF。

## Harness 的來源與本專案採用方式

1. [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/)（文章日期 2026-02-11）：把儲存庫當作知識紀錄中心；短的 AGENTS.md 是地圖；漸進揭露上下文；可驗證的架構邊界；讓 logs、UI 與測試可被 Agent 理解；定期清除文件/程式漂移。本專案因此建立入口文件、明確分层、驗收檔與可重現檢查，不把所有規則塞進 prompt。
2. [Anthropic — Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)（文章日期 2025-11-26）：初始化與後續增量開發分離；保留功能清單、進度與 Git；每輪開始先看現況與驗證，而不是靠上下文壓縮當成永久記憶。本專案採分階段任務、進度紀錄、固定示例與交接。

Harness 是模型之外的執行環境與工作回饋系統，不是只選一個 Agent 框架。本專案重點是模型可替换、工具邊界清楚、每步輸出有契約、失敗可觀察、狀態可恢復、決策可回溯。原文中的生產力數字是特定工程案例，未當成此專案承諾。

## TradingView

- [Terms of Use §3](https://www.tradingview.com/policies/)：查閱時條款明列 non-display usage 與自動化資料使用限制，包括 algorithmic decision-making 等用途。不能因帳號功能多、訂閱價格高或有第三方套件，就認定可以提供給自主 Agent 擷取/運算。實際整合要再查當時條款、個別資料供應商與明確授權。
- [Pine Script — Strategies](https://www.tradingview.com/pine-script-docs/concepts/strategies/)：broker emulator 根據可用 chart data 推定成交；歷史/即時執行時機不同；佣金與滑價屬回測重要輸入；某些 order-fill 再計算與歷史 OHLC 使用會造成前視。計算模式、成交時序、bar magnifier 與測試範圍要放入策略與 run metadata。

架構決策：TradingView 用作人可見的圖表學習與 Pine 核對候選介面；可運算的市場資料來源獨立，以合法授權為前提。此版本不登入、不操控付費帳號、不存密碼/Cookie、不連券商。

## GitHub 候選模組

查詢 [TradingView repositories](https://github.com/search?q=Tradingview&type=repositories) 對應 GitHub API 搜尋，另取得下列 repository metadata。星數不作採用依據；授權與 metadata 可能更新，真正納入相依前還要鎖版本、讀 LICENSE、測 API、看維護與安全情況。

| 專案 | API 回傳授權 | 可能用途 | 未決或限制 |
|---|---|---|---|
| [lightweight-charts](https://github.com/tradingview/lightweight-charts) | Apache-2.0 | 自有 K 線與成交視覺化 | 不提供市場資料；依 LICENSE/NOTICE 確認義務 |
| [LEAN](https://github.com/QuantConnect/Lean) | Apache-2.0 | 事件驅動引擎與資料/券商介面 | TMF 規格、資料接入與成本待驗證；較重 |
| [backtesting.py](https://github.com/kernc/backtesting.py) | AGPL-3.0 | 最小基準與逐根資料回測 | 期貨適配、授權義務需先評估 |
| [Backtrader](https://github.com/mementum/backtrader) | GPL-3.0 | 多序列与事件驅動架構 | API 顯示 pushed_at 2024-08-19，確認現況與相容性 |
| [vectorbt](https://github.com/polakowo/vectorbt) | NOASSERTION | 向量化研究候選 | 不自行推定 Apache/MIT；讀實際 LICENSE；記錄多重測試 |
| [Freqtrade](https://github.com/freqtrade/freqtrade) | GPL-3.0 | 研究/觀察/工具層分離參考 | 加密貨幣取向，不當作 TMF 連接器 |
| [tradingview-mcp](https://github.com/tradesdontlie/tradingview-mcp) | NOASSERTION | 個人桌面工作流程/MCP 設計研究 | 非官方；條款、權限、實作与授權待查；不執行 |
| [TradingView-API](https://github.com/Mathieu2301/TradingView-API) | null | 社群整合方式研究 | 非官方；API 沒有辨識授權；不作自動行情基礎 |

本輪未決：TMF 官方契約詳細規格、TradingView 對應代碼、資料供應商與可重用權利、最適回測引擎。沒有藉這些研究宣稱某個策略可獲利。
