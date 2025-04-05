import axios from 'axios';

const API_KEY = import.meta.env.REACT_APP_1INCH_API_KEY || '';
const BASE_URL = 'https://api.1inch.dev/swap/v5.0';
const FUSION_API_URL = 'https://api.1inch.dev/fusion/v1.0';
const ETH_ADDRESS = import.meta.env.REACT_APP_DEFAULT_ETH_ADDRESS || '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

/**
 * 獲取支持的代幣列表
 * @param chainId 區塊鏈網絡ID
 */
export async function getSupportedTokens(chainId: number) {
  try {
    const response = await axios.get(`${BASE_URL}/${chainId}/tokens`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching supported tokens:', error);
    throw error;
  }
}

/**
 * 獲取代幣轉換報價
 * @param chainId 區塊鏈網絡ID
 * @param fromToken 源代幣地址
 * @param toToken 目標代幣地址 (通常是ETH)
 * @param amount 代幣數量 (以最小單位表示, 例如wei)
 */
export async function getQuote(chainId: number, fromToken: string, toToken: string, amount: string) {
  try {
    const response = await axios.get(`${BASE_URL}/${chainId}/quote`, {
      params: {
        fromTokenAddress: fromToken,
        toTokenAddress: toToken || ETH_ADDRESS,
        amount: amount
      },
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting quote:', error);
    throw error;
  }
}

/**
 * 估算Gas費用
 * @param chainId 區塊鏈網絡ID
 * @param fromToken 源代幣地址
 * @param toToken 目標代幣地址 (通常是ETH)
 * @param amount 代幣數量 (以最小單位表示)
 * @param fromAddress 用戶錢包地址
 */
export async function estimateGas(
  chainId: number, 
  fromToken: string, 
  toToken: string, 
  amount: string, 
  fromAddress: string
) {
  try {
    const response = await axios.get(`${BASE_URL}/${chainId}/estimate`, {
      params: {
        fromTokenAddress: fromToken,
        toTokenAddress: toToken || ETH_ADDRESS,
        amount: amount,
        fromAddress: fromAddress
      },
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw error;
  }
}

/**
 * 創建Fusion+訂單
 * @param chainId 區塊鏈網絡ID
 * @param fromToken 源代幣地址 
 * @param toToken 目標代幣地址 (通常是ETH)
 * @param amount 代幣數量 (以最小單位表示)
 * @param receiverAddress 接收者地址 (創作者合約地址)
 * @param walletAddress 用戶錢包地址
 * @param provider Web3 Provider
 */
export async function createFusionOrder(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string,
  receiverAddress: string,
  walletAddress: string,
  signer: any
) {
  try {
    // 獲取Fusion+訂單報價
    const quoteResponse = await axios.get(`${FUSION_API_URL}/${chainId}/quote`, {
      params: {
        src: fromToken,
        dst: toToken || ETH_ADDRESS,
        amount: amount,
        receiver: receiverAddress
      },
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    // 準備訂單數據，參考fusion-plus-order
    const order = {
      src: fromToken,
      dst: toToken || ETH_ADDRESS,
      amount: amount,
      receiver: receiverAddress,
      walletAddress: walletAddress,
      ...quoteResponse.data
    };

    // 獲取訂單簽名數據
    const orderResponse = await axios.post(
      `${FUSION_API_URL}/${chainId}/order`,
      order,
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    );

    const { orderHash } = orderResponse.data;

    // 簽名訂單
    const signature = await signer.signMessage(orderHash);

    // 提交已簽名的訂單
    const submitResponse = await axios.post(
      `${FUSION_API_URL}/${chainId}/submit`,
      {
        order: orderResponse.data.order,
        signature: signature,
        signerAddress: walletAddress
      },
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    );

    return submitResponse.data;
  } catch (error) {
    console.error('Error creating Fusion order:', error);
    throw error;
  }
}

/**
 * 獲取訂單狀態
 * @param chainId 區塊鏈網絡ID
 * @param orderId 訂單ID
 */
export async function getOrderStatus(chainId: number, orderId: string) {
  try {
    const response = await axios.get(
      `${FUSION_API_URL}/${chainId}/order/${orderId}/status`,
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting order status:', error);
    throw error;
  }
} 