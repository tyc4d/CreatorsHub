import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  calculateDonationPreview, 
  executeDonation,
  BADGE_AMOUNTS
} from '../services/blockchain/donationService';

type BadgeType = 'bronze' | 'silver' | 'gold' | null;

interface Token {
  address: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

interface DonationPreview {
  estimatedReceived: string;
  gasFee: string;
  isEthDonation: boolean;
  exchangeRate?: number;
}

export function useDonation(provider: ethers.providers.Web3Provider | null, chainId: number) {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [creatorAddress, setCreatorAddress] = useState<string>('');
  const [badgeType, setBadgeType] = useState<BadgeType>(null);
  const [preview, setPreview] = useState<DonationPreview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  // 計算捐贈預覽
  useEffect(() => {
    if (!provider || !selectedToken || !amount || !creatorAddress || !chainId) {
      setPreview(null);
      return;
    }
    
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 如果選擇了徽章，使用預設ETH金額
        const tokenAddress = badgeType ? ethers.constants.AddressZero : selectedToken.address;
        const donationAmount = badgeType 
          ? BADGE_AMOUNTS[badgeType].toString()
          : ethers.utils.parseUnits(amount, selectedToken.decimals).toString();
        
        const previewData = await calculateDonationPreview(
          provider,
          chainId,
          tokenAddress,
          donationAmount,
          creatorAddress,
          badgeType
        );
        
        setPreview(previewData);
      } catch (err: any) {
        console.error('Error calculating preview:', err);
        setError('無法計算捐贈預覽，請稍後再試');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreview();
  }, [provider, selectedToken, amount, creatorAddress, chainId, badgeType]);
  
  // 執行捐贈
  const donate = async () => {
    if (!provider || !selectedToken || !creatorAddress || !chainId) {
      setError('缺少必要參數');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const tokenAddress = badgeType ? ethers.constants.AddressZero : selectedToken.address;
      const donationAmount = badgeType 
        ? BADGE_AMOUNTS[badgeType].toString()
        : ethers.utils.parseUnits(amount, selectedToken.decimals).toString();
      
      const result = await executeDonation(
        provider,
        chainId,
        tokenAddress,
        donationAmount,
        creatorAddress,
        badgeType
      );
      
      // 設置交易哈希以供查詢
      setTransactionHash(result.transactionHash || result.hash);
      return result;
    } catch (err: any) {
      console.error('Error executing donation:', err);
      setError(err.message || '捐贈失敗，請稍後再試');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // 獲取徽章金額 (格式化)
  const getBadgeAmount = (type: BadgeType): string => {
    if (!type) return '0';
    
    switch(type) {
      case 'bronze': return '0.01';
      case 'silver': return '0.05';
      case 'gold': return '0.1';
      default: return '0';
    }
  };
  
  // 重置表單
  const resetForm = () => {
    setAmount('');
    setBadgeType(null);
    setPreview(null);
    setTransactionHash(null);
    setError(null);
  };
  
  return {
    selectedToken,
    setSelectedToken,
    amount,
    setAmount,
    creatorAddress,
    setCreatorAddress,
    badgeType,
    setBadgeType,
    preview,
    loading,
    error,
    donate,
    transactionHash,
    getBadgeAmount,
    resetForm
  };
} 