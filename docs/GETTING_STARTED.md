# 第一次使用與跨裝置接續

## 三個不同的地方

- **GitHub 儲存庫**：保存程式碼與版本。本專案是 https://github.com/LoHAs-hub/AutoStrat-Bot ，主要分支 `main`。
- **雲端開發環境**：取得儲存庫後執行程式的地方。建立環境、建立儲存庫、把兩者連結起來，是不同的動作。
- **網站網址**：讓你直接操作工作台的介面。程式碼推上 GitHub 不等於網站已發布；本版私人網站尚未完成發布。

## 對話無法傳送：unable to determine project root

這個訊息表示客戶端/任務系統無法判定該對話的專案根目錄。現有雲端檢查顯示執行環境正在運行，但原始 `/workspace` 沒有可用 Git 儲存庫；程式在 `/workspace/strategy-lab`。這是可確認的線索，不足以判定所有裝置錯誤的唯一原因。

建立 GitHub 儲存庫或在環境中執行 git init，不會自動更改已存在聊天室的綁定。也不能由此認定雲端環境完全建立失敗。

## 接續原則

1. 在支援選擇儲存庫/專案的開發介面，確認使用同一帳號，並選取 `LoHAs-hub/AutoStrat-Bot`、`main`。
2. 若目前對話可以重新連結專案，使用該功能；若介面沒有這項能力，再建立新對話並選取上述儲存庫。不同產品與裝置的選單可能不同，不假設有特定按鈕。
3. 使用雲端環境時，確認環境實際取得這個儲存庫，不能只選了一個空環境。初始化後應能看到根目錄的 `README.md`、`AGENTS.md`、`package.json`。
4. 如果是桌面 App 或編輯器使用本機專案，需要先在那台電腦取得儲存庫，再開啟含 `package.json` 的那個資料夾。本機模式和雲端模式的專案位置不同。
5. 如果選到正確儲存庫後仍無法傳送訊息，留下客戶端類型、錯誤文字、發生時間（台北）與對話連結，交由產品支援排查綁定；Agent 不能直接改寫平台對話資料。

不要把 `/workspace/strategy-lab` 當成每台電腦固定存在的位置。它是目前雲端執行環境的路径。新 clone 的根目錄通常由你或平台選定；以 `git rev-parse --show-toplevel` 查得的位置為準。

## 給下一個聊天室

> 請接續 LoHAs-hub/AutoStrat-Bot 的 main 分支。先讀 AGENTS.md、docs/HANDOFF.md、docs/PROJECT.md，並執行 npm run verify。只研究微型台指期貨 TMF，以「嚴格執行交易計劃」為已確認原則。採 Harness，先示例驗收，再批次實作。工作台已實作，LLM Agent、真實回測與下單尚未實作。請先回報目前專案根目錄及狀態，再繼續未完成的工作。

## 本機執行

安裝 Node.js 24 或以上後，在專案根目錄執行：

```sh
npm run verify
npm run dev
```

同一台電腦開啟 http://127.0.0.1:4173 。不需要輸入 TradingView 帳密或安裝 npm 套件。資料保存在 `.local/workspace.sqlite`，不會推到 GitHub；跨機器的資料同步要使用已部署網站，或另做資料遷移。
