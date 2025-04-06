# :gift: CreatorsHub – 區塊鏈多幣種捐贈平台 (1inch 整合)

歡迎來到 **CreatorsHub**，一個革新的區塊鏈捐贈平台，讓創作者*可以接受任何 ERC20 代幣作為捐贈，並自動轉換為 ETH*。通過 [1inch API](https://1inch.io/) 獲得最佳兌換率，CreatorsHub 讓加密貨幣捐贈變得前所未有的簡單。

## :brain: 什麼是 CreatorsHub？

CreatorsHub 是一個加密貨幣捐贈平台，使用者可以**透過任何 ERC20 代幣向創作者捐贈**，系統會自動透過 1inch 執行代幣轉換為 ETH。平台利用智能合約確保每位創作者擁有專屬的捐贈地址，並可以輕鬆提取資金。

### ⚡️ 簡單來說

- :rocket: 選擇任何 ERC20 代幣進行捐贈
- :arrows_counterclockwise: 系統使用 **1inch API** 自動將代幣轉換為 ETH (獲得最佳匯率)
- :bar_chart: 每位創作者擁有專屬的捐贈合約
- :money_with_wings: 創作者可以隨時提取資金
- :white_check_mark: 完整的交易記錄和狀態追踪

---

## :dividers: 專案結構

```
CreatorsHub/
├── public_frontend/      # React 前端應用
├── donate_contract/      # 智能合約 (Solidity)
├── proxy.js              # 1inch API 代理轉發
```

---

## :jigsaw: 技術棧概述

| 層級              | 技術                            |
|-------------------|----------------------------------|
| 前端              | React + TypeScript + Tailwind CSS |
| 代幣交換          | **1inch API** :fire:                 |
| 智能合約          | Solidity + Factory 模式          |
| 區塊鏈 SDK        | ethers.js / web3.js              |
| 交易追踪          | 自建交易管理組件                 |
| 安全管理          | 環境變數 + API 代理              |

---

## :tools: 前端應用 – `public_frontend`

一個直觀的 UI，讓使用者輕鬆選擇和捐贈代幣，追踪交易狀態。

### :test_tube: 功能

- :white_check_mark: 多種代幣選擇器
- :arrows_counterclockwise: 代幣轉換即時報價
- :moneybag: 捐贈表單和確認
- :scroll: 交易歷史記錄
- :mag: 實時交易狀態追踪

### :technologist: 技術棧

- **框架**: React + TypeScript
- **樣式**: Tailwind CSS
- **API 整合**: 1inch Swap API
- **網路通訊**: Fetch API
- **狀態管理**: React Context/Hooks

---

### :arrows_counterclockwise: 1inch API 整合 (核心功能)

CreatorsHub 利用 **1inch API**，確保使用者獲得最佳的代幣交換率：

- 透過代理服務器轉發 API 請求，保護 API 金鑰
- 實時獲取代幣價格和 gas 費用估算
- 執行最佳匯率的代幣交換
- 可以接受超過 50 種常用 ERC20 代幣作為捐贈

---

### :dollar: 捐贈流程

1. **使用者選擇代幣** 和輸入金額
2. **系統查詢 1inch API** 獲取即時報價
3. **顯示預估結果** 包括交換比率和 gas 費用
4. **用戶確認捐贈** 後執行交易
5. **交易提交到區塊鏈**
6. **系統追踪交易狀態** 並更新 UI

---

### :page_facing_up: 智能合約架構

- **DonationFactory**: 創建和管理個人捐贈合約
- **CreatorDonation**: 處理捐贈、代幣交換和提款功能
- **ISwapRouter**: 與 1inch 路由交互的接口

---

## :construction_site: 智能合約 – `donate_contract`

捐贈系統的核心合約邏輯，包括：

- 工廠模式部署個人捐贈合約
- 代幣交換路由設置
- 多幣種捐贈處理
- 安全提款機制
- 交易事件記錄

---

## :electric_plug: API 代理 – `proxy.js`

為了保護 API 金鑰和簡化前端整合，系統使用代理服務器：

- 轉發前端請求到 1inch API
- 添加必要的驗證和 API 金鑰
- 處理錯誤和回應
- 支持多種 API 端點

---

## :wrench: 環境設置

1. 前端環境：
   - `REACT_APP_API_PROXY_URL`: API 代理網址
   - `REACT_APP_CHAIN_ID`: 區塊鏈網路 ID
   - `REACT_APP_FACTORY_ADDRESS`: 合約工廠地址

2. 代理環境：
   - `ONEINCH_API_KEY`: 1inch API 金鑰
   - `PORT`: 代理服務器埠號

---

## :handshake: 貢獻

1. Fork 這個專案
2. 創建分支：`git checkout -b feature/amazing`
3. 提交變更：`git commit -m "添加新功能"`
4. 推送：`git push origin feature/amazing`
5. 開啟 PR

