import axios from 'axios';

// 動態獲取Etherscan API URL根據鏈ID
function getBaseUrl(chainId: number): string {
  switch (chainId) {
    case 1: return 'https://api.etherscan.io/api'; // Ethereum Mainnet
    case 5: return 'https://api-goerli.etherscan.io/api'; // Goerli Testnet
    case 11155111: return 'https://api-sepolia.etherscan.io/api'; // Sepolia Testnet
    case 56: return 'https://api.bscscan.com/api'; // Binance Smart Chain
    case 137: return 'https://api.polygonscan.com/api'; // Polygon
    case 42161: return 'https://api.arbiscan.io/api'; // Arbitrum
    case 10: return 'https://api-optimistic.etherscan.io/api'; // Optimism
    case 43114: return 'https://api.snowtrace.io/api'; // Avalanche
    default: return 'https://api.etherscan.io/api'; // 默認Ethereum
  }
}

const API_KEY = import.meta.env.REACT_APP_ETHERSCAN_API_KEY || '';

/**
 * 獲取地址的交易歷史
 * @param address 地址
 * @param chainId 區塊鏈網絡ID
 * @param sort 排序方式 (asc/desc)
 * @param page 頁碼
 * @param offset 每頁數量
 */
export async function getTransactionHistory(
  address: string,
  chainId: number = 1,
  sort: string = 'desc', 
  page: number = 1,
  offset: number = 100
) {
  try {
    const baseUrl = getBaseUrl(chainId);
    const response = await axios.get(baseUrl, {
      params: {
        module: 'account',
        action: 'txlist',
        address,
        sort,
        page,
        offset,
        apikey: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
}

/**
 * 獲取合約內部交易
 * @param address 地址
 * @param chainId 區塊鏈網絡ID
 * @param sort 排序方式 (asc/desc)
 * @param page 頁碼
 * @param offset 每頁數量
 */
export async function getInternalTransactions(
  address: string,
  chainId: number = 1,
  sort: string = 'desc',
  page: number = 1,
  offset: number = 100
) {
  try {
    const baseUrl = getBaseUrl(chainId);
    const response = await axios.get(baseUrl, {
      params: {
        module: 'account',
        action: 'txlistinternal',
        address,
        sort,
        page,
        offset,
        apikey: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching internal transactions:', error);
    throw error;
  }
}

/**
 * 獲取ERC20代幣轉賬事件
 * @param address 地址
 * @param chainId 區塊鏈網絡ID
 * @param sort 排序方式 (asc/desc)
 * @param page 頁碼
 * @param offset 每頁數量
 */
export async function getERC20Transfers(
  address: string,
  chainId: number = 1,
  sort: string = 'desc',
  page: number = 1,
  offset: number = 100
) {
  try {
    const baseUrl = getBaseUrl(chainId);
    const response = await axios.get(baseUrl, {
      params: {
        module: 'account',
        action: 'tokentx',
        address,
        sort,
        page,
        offset,
        apikey: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ERC20 transfers:', error);
    throw error;
  }
}

/**
 * 獲取合約ABI
 * @param address 合約地址
 * @param chainId 區塊鏈網絡ID
 */
export async function getContractABI(address: string, chainId: number = 1) {
  try {
    const baseUrl = getBaseUrl(chainId);
    const response = await axios.get(baseUrl, {
      params: {
        module: 'contract',
        action: 'getabi',
        address,
        apikey: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contract ABI:', error);
    throw error;
  }
}

/**
 * 獲取錢包代幣餘額
 * @param address 錢包地址
 * @param contractAddress 代幣合約地址 (沒有表示查詢ETH餘額)
 * @param chainId 區塊鏈網絡ID
 */
export async function getTokenBalance(
  address: string,
  contractAddress: string = '',
  chainId: number = 1
) {
  try {
    const baseUrl = getBaseUrl(chainId);
    
    // 根據是否提供合約地址來決定查詢ETH還是ERC20代幣
    const params = contractAddress ? {
      module: 'account',
      action: 'tokenbalance',
      address,
      contractaddress: contractAddress,
      tag: 'latest',
      apikey: API_KEY
    } : {
      module: 'account',
      action: 'balance',
      address,
      tag: 'latest',
      apikey: API_KEY
    };
    
    const response = await axios.get(baseUrl, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
}

/**
 * 根據區塊鏈瀏覽器查詢交易詳情頁面URL
 * @param txHash 交易哈希
 * @param chainId 區塊鏈網絡ID
 */
export function getTransactionExplorerUrl(txHash: string, chainId: number = 1): string {
  switch (chainId) {
    case 1: return `https://etherscan.io/tx/${txHash}`;
    case 5: return `https://goerli.etherscan.io/tx/${txHash}`;
    case 11155111: return `https://sepolia.etherscan.io/tx/${txHash}`;
    case 56: return `https://bscscan.com/tx/${txHash}`;
    case 137: return `https://polygonscan.com/tx/${txHash}`;
    case 42161: return `https://arbiscan.io/tx/${txHash}`;
    case 10: return `https://optimistic.etherscan.io/tx/${txHash}`;
    case 43114: return `https://snowtrace.io/tx/${txHash}`;
    default: return `https://etherscan.io/tx/${txHash}`;
  }
}

/**
 * 獲取地址的區塊鏈瀏覽器頁面URL
 * @param address 地址
 * @param chainId 區塊鏈網絡ID
 */
export function getAddressExplorerUrl(address: string, chainId: number = 1): string {
  switch (chainId) {
    case 1: return `https://etherscan.io/address/${address}`;
    case 5: return `https://goerli.etherscan.io/address/${address}`;
    case 11155111: return `https://sepolia.etherscan.io/address/${address}`;
    case 56: return `https://bscscan.com/address/${address}`;
    case 137: return `https://polygonscan.com/address/${address}`;
    case 42161: return `https://arbiscan.io/address/${address}`;
    case 10: return `https://optimistic.etherscan.io/address/${address}`;
    case 43114: return `https://snowtrace.io/address/${address}`;
    default: return `https://etherscan.io/address/${address}`;
  }
} 