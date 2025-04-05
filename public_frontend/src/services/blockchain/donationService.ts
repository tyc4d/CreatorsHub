import { ethers } from 'ethers';
import { getQuote, estimateGas, createFusionOrder } from '../api/oneInchService';

// 合約ABI - 這只是簡化版，實際使用時請替換為完整ABI
const DONATION_FACTORY_ABI = [
  'function getCreatorContract(address creator) external view returns (address)',
  'function hasContract(address creator) external view returns (bool)'
];

const CREATOR_DONATION_ABI = [
  'function donateToken(address token, uint256 amount, bool swapToEth) external',
  'function withdrawEth() external',
  'function withdrawToken(address token) external',
  'function getEthBalance() external view returns (uint256)',
  'function getTokenBalance(address token) external view returns (uint256)',
  'function isTokenSupported(address tokenAddress) external view returns (bool)'
];

// 常量
const ETH_ADDRESS = import.meta.env.REACT_APP_DEFAULT_ETH_ADDRESS || '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const FACTORY_ADDRESS = import.meta.env.REACT_APP_FACTORY_ADDRESS || '';

// 徽章金額（銅/銀/金牌）
export const BADGE_AMOUNTS = {
  bronze: ethers.utils.parseEther('0.01'),
  silver: ethers.utils.parseEther('0.05'),
  gold: ethers.utils.parseEther('0.1')
};

type BadgeType = 'bronze' | 'silver' | 'gold' | null;

/**
 * 獲取創作者的捐贈合約地址
 * @param provider 以太坊提供者
 * @param creatorAddress 創作者地址
 */
export async function getCreatorContract(provider: ethers.providers.Provider, creatorAddress: string) {
  try {
    if (!FACTORY_ADDRESS) {
      throw new Error('Factory address not configured');
    }
    
    const factoryContract = new ethers.Contract(
      FACTORY_ADDRESS,
      DONATION_FACTORY_ABI,
      provider
    );
    
    return await factoryContract.getCreatorContract(creatorAddress);
  } catch (error) {
    console.error('Error getting creator contract:', error);
    throw error;
  }
}

/**
 * 檢查創作者是否已有捐贈合約
 * @param provider 以太坊提供者
 * @param creatorAddress 創作者地址
 */
export async function hasCreatorContract(provider: ethers.providers.Provider, creatorAddress: string) {
  try {
    if (!FACTORY_ADDRESS) {
      throw new Error('Factory address not configured');
    }
    
    const factoryContract = new ethers.Contract(
      FACTORY_ADDRESS,
      DONATION_FACTORY_ABI,
      provider
    );
    
    return await factoryContract.hasContract(creatorAddress);
  } catch (error) {
    console.error('Error checking creator contract:', error);
    throw error;
  }
}

/**
 * 計算贊助預覽資訊
 * @param provider 以太坊提供者
 * @param chainId 區塊鏈網絡ID
 * @param tokenAddress 代幣地址
 * @param amount 代幣數量 (以最小單位表示)
 * @param creatorAddress 創作者地址
 * @param badgeType 徽章類型
 */
export async function calculateDonationPreview(
  provider: ethers.providers.Web3Provider,
  chainId: number,
  tokenAddress: string,
  amount: string,
  creatorAddress: string,
  badgeType: BadgeType = null
) {
  try {
    // 獲取用戶地址
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    
    // 獲取創作者合約地址
    const donationAddress = await getCreatorContract(provider, creatorAddress);
    
    // 如果選擇了徽章，使用固定的ETH金額
    if (badgeType) {
      const badgeAmount = BADGE_AMOUNTS[badgeType].toString();
      const gasFee = await estimateEthTransferGas(provider, donationAddress);
      
      return {
        estimatedReceived: badgeAmount,
        gasFee: gasFee.toString(),
        isEthDonation: true
      };
    }
    
    // 如果是ETH，直接返回金額
    if (tokenAddress === ETH_ADDRESS) {
      const gasFee = await estimateEthTransferGas(provider, donationAddress);
      
      return {
        estimatedReceived: amount,
        gasFee: gasFee.toString(),
        isEthDonation: true
      };
    }
    
    // 如果不是ETH，獲取代幣兌換報價
    const quote = await getQuote(chainId, tokenAddress, ETH_ADDRESS, amount);
    const gasEstimate = await estimateGas(
      chainId, 
      tokenAddress, 
      ETH_ADDRESS, 
      amount,
      userAddress
    );
    
    return {
      estimatedReceived: quote.toAmount,
      gasFee: gasEstimate.estimatedGas,
      isEthDonation: false,
      exchangeRate: quote.toAmount / amount
    };
  } catch (error) {
    console.error('Error calculating donation preview:', error);
    throw error;
  }
}

/**
 * 執行捐贈
 * @param provider 以太坊提供者
 * @param chainId 區塊鏈網絡ID
 * @param tokenAddress 代幣地址
 * @param amount 代幣數量 (以最小單位表示)
 * @param creatorAddress 創作者地址
 * @param badgeType 徽章類型
 */
export async function executeDonation(
  provider: ethers.providers.Web3Provider,
  chainId: number,
  tokenAddress: string,
  amount: string,
  creatorAddress: string,
  badgeType: BadgeType = null
) {
  try {
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    
    // 獲取創作者合約地址
    const donationAddress = await getCreatorContract(provider, creatorAddress);
    
    // 如果選擇了徽章，自動使用相應ETH金額
    if (badgeType) {
      // 徽章贊助總是使用ETH
      return await donateEth(provider, donationAddress, BADGE_AMOUNTS[badgeType].toString());
    }
    
    // 如果是ETH且在Ethereum網絡，使用普通轉賬
    if (tokenAddress === ETH_ADDRESS && chainId === 1) {
      return await donateEth(provider, donationAddress, amount);
    }
    
    // 其他情況使用Fusion+
    return await createFusionOrder(
      chainId,
      tokenAddress,
      ETH_ADDRESS,
      amount,
      donationAddress,
      userAddress,
      signer
    );
  } catch (error) {
    console.error('Error executing donation:', error);
    throw error;
  }
}

/**
 * ETH捐贈
 * @param provider 以太坊提供者
 * @param donationAddress 捐贈合約地址
 * @param amount ETH數量 (以wei為單位)
 */
async function donateEth(
  provider: ethers.providers.Web3Provider, 
  donationAddress: string, 
  amount: string
) {
  try {
    const signer = provider.getSigner();
    
    const tx = await signer.sendTransaction({
      to: donationAddress,
      value: amount
    });
    
    return await tx.wait();
  } catch (error) {
    console.error('Error donating ETH:', error);
    throw error;
  }
}

/**
 * 代幣捐贈
 * @param provider 以太坊提供者
 * @param donationAddress 捐贈合約地址
 * @param tokenAddress 代幣地址
 * @param amount 代幣數量 (以最小單位表示)
 * @param swapToEth 是否轉換為ETH
 */
export async function donateToken(
  provider: ethers.providers.Web3Provider,
  donationAddress: string,
  tokenAddress: string,
  amount: string,
  swapToEth: boolean = false
) {
  try {
    const signer = provider.getSigner();
    
    // 創建ERC20合約實例
    const erc20Interface = new ethers.utils.Interface([
      'function approve(address spender, uint256 amount) external returns (bool)'
    ]);
    const tokenContract = new ethers.Contract(tokenAddress, erc20Interface, signer);
    
    // 授權捐贈合約使用代幣
    const approveTx = await tokenContract.approve(donationAddress, amount);
    await approveTx.wait();
    
    // 創建捐贈合約實例
    const donationContract = new ethers.Contract(
      donationAddress,
      CREATOR_DONATION_ABI,
      signer
    );
    
    // 執行捐贈
    const donateTx = await donationContract.donateToken(tokenAddress, amount, swapToEth);
    return await donateTx.wait();
  } catch (error) {
    console.error('Error donating token:', error);
    throw error;
  }
}

/**
 * 估算ETH轉賬Gas費用
 * @param provider 以太坊提供者
 * @param to 接收地址
 */
async function estimateEthTransferGas(provider: ethers.providers.Provider, to: string) {
  try {
    const gasPrice = await provider.getGasPrice();
    const gasLimit = 21000; // 基本ETH轉賬Gas限制
    
    return gasPrice.mul(gasLimit);
  } catch (error) {
    console.error('Error estimating ETH transfer gas:', error);
    throw error;
  }
}

/**
 * 獲取創作者的ETH餘額
 * @param provider 以太坊提供者
 * @param creatorAddress 創作者地址
 */
export async function getCreatorEthBalance(provider: ethers.providers.Provider, creatorAddress: string) {
  try {
    const donationAddress = await getCreatorContract(provider, creatorAddress);
    
    const donationContract = new ethers.Contract(
      donationAddress,
      CREATOR_DONATION_ABI,
      provider
    );
    
    return await donationContract.getEthBalance();
  } catch (error) {
    console.error('Error getting creator ETH balance:', error);
    throw error;
  }
}

/**
 * 獲取創作者的代幣餘額
 * @param provider 以太坊提供者
 * @param creatorAddress 創作者地址
 * @param tokenAddress 代幣地址
 */
export async function getCreatorTokenBalance(
  provider: ethers.providers.Provider, 
  creatorAddress: string, 
  tokenAddress: string
) {
  try {
    const donationAddress = await getCreatorContract(provider, creatorAddress);
    
    const donationContract = new ethers.Contract(
      donationAddress,
      CREATOR_DONATION_ABI,
      provider
    );
    
    return await donationContract.getTokenBalance(tokenAddress);
  } catch (error) {
    console.error('Error getting creator token balance:', error);
    throw error;
  }
}

/**
 * 提取ETH
 * @param provider 以太坊提供者
 * @param creatorAddress 創作者地址
 */
export async function withdrawEth(provider: ethers.providers.Web3Provider, creatorAddress: string) {
  try {
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    
    // 確認用戶是否為創作者
    if (signerAddress.toLowerCase() !== creatorAddress.toLowerCase()) {
      throw new Error('Only creator can withdraw funds');
    }
    
    const donationAddress = await getCreatorContract(provider, creatorAddress);
    
    const donationContract = new ethers.Contract(
      donationAddress,
      CREATOR_DONATION_ABI,
      signer
    );
    
    const tx = await donationContract.withdrawEth();
    return await tx.wait();
  } catch (error) {
    console.error('Error withdrawing ETH:', error);
    throw error;
  }
}

/**
 * 提取代幣
 * @param provider 以太坊提供者
 * @param creatorAddress 創作者地址
 * @param tokenAddress 代幣地址
 */
export async function withdrawToken(
  provider: ethers.providers.Web3Provider, 
  creatorAddress: string, 
  tokenAddress: string
) {
  try {
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    
    // 確認用戶是否為創作者
    if (signerAddress.toLowerCase() !== creatorAddress.toLowerCase()) {
      throw new Error('Only creator can withdraw funds');
    }
    
    const donationAddress = await getCreatorContract(provider, creatorAddress);
    
    const donationContract = new ethers.Contract(
      donationAddress,
      CREATOR_DONATION_ABI,
      signer
    );
    
    const tx = await donationContract.withdrawToken(tokenAddress);
    return await tx.wait();
  } catch (error) {
    console.error('Error withdrawing token:', error);
    throw error;
  }
} 