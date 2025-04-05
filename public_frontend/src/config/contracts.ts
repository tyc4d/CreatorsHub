// 合約地址配置
export const CONTRACT_ADDRESSES = {
  // 主網合約地址
  mainnet: {
    factory: process.env.REACT_APP_FACTORY_ADDRESS || '',
    creatorNFT: process.env.REACT_APP_CREATOR_NFT_ADDRESS || '',
    supporterNFT: process.env.REACT_APP_SUPPORTER_NFT_ADDRESS || '',
    priceOracle: process.env.REACT_APP_PRICE_ORACLE_ADDRESS || '',
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Ethereum mainnet WETH
  },
  // 測試網合約地址
  testnet: {
    factory: process.env.REACT_APP_TESTNET_FACTORY_ADDRESS || '',
    creatorNFT: process.env.REACT_APP_TESTNET_CREATOR_NFT_ADDRESS || '',
    supporterNFT: process.env.REACT_APP_TESTNET_SUPPORTER_NFT_ADDRESS || '',
    priceOracle: process.env.REACT_APP_TESTNET_PRICE_ORACLE_ADDRESS || '',
    weth: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', // Goerli WETH
  },
  // 本地開發合約地址
  localhost: {
    factory: process.env.REACT_APP_LOCAL_FACTORY_ADDRESS || '',
    creatorNFT: process.env.REACT_APP_LOCAL_CREATOR_NFT_ADDRESS || '',
    supporterNFT: process.env.REACT_APP_LOCAL_SUPPORTER_NFT_ADDRESS || '',
    priceOracle: process.env.REACT_APP_LOCAL_PRICE_ORACLE_ADDRESS || '',
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // 本地 WETH
  },
};

// 網絡配置
export const NETWORKS = {
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.REACT_APP_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
  },
  testnet: {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: process.env.REACT_APP_TESTNET_RPC_URL || 'https://goerli.infura.io/v3/',
    explorerUrl: 'https://goerli.etherscan.io',
  },
  localhost: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://localhost:8545',
    explorerUrl: '',
  },
};

// 1inch API 配置
export const ONEINCH_API = {
  baseUrl: 'https://api.1inch.io/v5.0',
  apiKey: process.env.REACT_APP_1INCH_API_KEY || '',
};

// ENS 配置
export const ENS_CONFIG = {
  rpcUrl: process.env.REACT_APP_ENS_RPC_URL || 'https://mainnet.infura.io/v3/',
};

// IPFS 配置
export const IPFS_CONFIG = {
  gateway: process.env.REACT_APP_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
}; 