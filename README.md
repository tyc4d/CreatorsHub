# :gift: CreatorsHub - Multi-Token Donation Platform with 1inch Integration

Welcome to **CreatorsHub**, an innovative blockchain donation platform that allows creators to *accept any ERC20 token as a donation and automatically convert it to ETH*. By leveraging the [1inch API](https://1inch.io/) for optimal exchange rates, CreatorsHub makes cryptocurrency donations simpler than ever.

## :brain: What is CreatorsHub?

CreatorsHub is a cryptocurrency donation platform where users can **donate to creators using any ERC20 token**. The system automatically converts tokens to ETH through 1inch. The platform uses smart contracts to ensure that each creator has a dedicated donation address and can easily withdraw funds.

### ⚡️ In Short

- :rocket: Donate using any ERC20 token
- :arrows_counterclockwise: System uses **1inch API** to automatically convert tokens to ETH (at best rates)
- :bar_chart: Each creator has their own donation contract
- :money_with_wings: Creators can withdraw funds anytime
- :white_check_mark: Complete transaction records and status tracking

---

## :dividers: Project Structure

```
CreatorsHub/
├── public_frontend/      # React frontend application
├── public_contract/      # Smart contracts (Solidity)
├── 1inch-vercel-proxy/   # 1inch API proxy server
├── proxy.js              # Local API proxy
```

---

## :jigsaw: Technology Stack

| Layer               | Technology                         |
|---------------------|-----------------------------------|
| Frontend            | React + TypeScript + Tailwind CSS |
| Token Exchange      | **1inch API** :fire:              |
| Smart Contracts     | Solidity + Factory Pattern        |
| Blockchain SDK      | ethers.js / web3.js               |
| Transaction Tracking| Custom transaction components     |
| Security Management | Environment variables + API proxy |

---

## :tools: Frontend Application – `public_frontend`

An intuitive UI that lets users easily select and donate tokens, track transaction status.

### :test_tube: Features

- :white_check_mark: Multi-token selector
- :arrows_counterclockwise: Real-time token conversion quotes
- :moneybag: Donation form and confirmation
- :scroll: Transaction history
- :mag: Real-time transaction status tracking

### :technologist: Tech Stack

- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: 1inch Swap API
- **Networking**: Fetch API
- **State Management**: React Context/Hooks

---

### :arrows_counterclockwise: 1inch API Integration (Core Feature)

CreatorsHub leverages the **1inch API** to ensure users get the best token exchange rates:

- Forwards API requests through a proxy server to protect API keys
- Gets real-time token prices and gas fee estimates
- Executes token swaps at optimal rates
- Accepts over 50 common ERC20 tokens as donations

---

### :dollar: Donation Flow

1. **User selects token** and enters amount
2. **System queries 1inch API** for real-time quote
3. **Displays estimated results** including exchange rate and gas fees
4. **User confirms donation** to execute transaction
5. **Transaction is submitted to blockchain**
6. **System tracks transaction status** and updates UI

---

### :page_facing_up: Smart Contract Architecture

- **DonationFactory**: Creates and manages personal donation contracts
- **CreatorDonation**: Handles donations, token swaps, and withdrawal functions
- **ISwapRouter**: Interface for interacting with 1inch router

---

## :construction_site: Smart Contracts – `public_contract`

Core contract logic for the donation system, including:

- Factory pattern for deploying personal donation contracts
- Token swap router configuration
- Multi-token donation handling
- Secure withdrawal mechanisms
- Transaction event logging
- Supporter NFT minting capabilities

---

## :electric_plug: API Proxies

To protect API keys and simplify frontend integration, the system uses proxy servers:

- Forward frontend requests to 1inch API
- Add necessary authentication and API keys
- Handle errors and responses
- Support multiple API endpoints

---

## :wrench: Environment Setup

1. Frontend Environment:
   - `REACT_APP_API_PROXY_URL`: API proxy URL
   - `REACT_APP_CHAIN_ID`: Blockchain network ID
   - `REACT_APP_FACTORY_ADDRESS`: Contract factory address

2. Proxy Environment:
   - `ONEINCH_API_KEY`: 1inch API key
   - `PORT`: Proxy server port

---

## :handshake: Contributing

1. Fork this project
2. Create a branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m "Add feature"`
4. Push: `git push origin feature/amazing`
5. Open a PR
