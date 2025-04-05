import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  getTransactionHistory, 
  getInternalTransactions,
  getERC20Transfers 
} from '../services/api/etherscanService';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  gasPrice: string;
  gasUsed: string;
  blockNumber: string;
  isError: string;
  type: 'normal' | 'internal' | 'token';
  // 代幣交易專用
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
  contractAddress?: string;
}

interface TransactionFilter {
  type?: 'normal' | 'internal' | 'token';
  startDate?: Date;
  endDate?: Date;
  status?: boolean;
}

interface DailyStats {
  [date: string]: {
    totalValue: ethers.BigNumber;
    count: number;
  };
}

export function useTransactionHistory(address: string, chainId: number, filter: TransactionFilter = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 加載交易歷史
  useEffect(() => {
    if (!address) return;
    
    async function loadTransactions() {
      try {
        setLoading(true);
        setError(null);
        
        // 並行獲取不同類型的交易
        const [normalTxs, internalTxs, tokenTxs] = await Promise.all([
          getTransactionHistory(address, chainId),
          getInternalTransactions(address, chainId),
          getERC20Transfers(address, chainId)
        ]);
        
        // 組合所有交易到一個數組
        const allTransactions: Transaction[] = [
          ...normalTxs.result.map((tx: any) => ({ ...tx, type: 'normal' as const })),
          ...internalTxs.result.map((tx: any) => ({ ...tx, type: 'internal' as const })),
          ...tokenTxs.result.map((tx: any) => ({ ...tx, type: 'token' as const }))
        ];
        
        // 依時間排序
        allTransactions.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
        
        setTransactions(allTransactions);
        setLoading(false);
      } catch (err) {
        console.error('Error loading transactions:', err);
        setError('無法加載交易歷史');
        setLoading(false);
      }
    }
    
    loadTransactions();
  }, [address, chainId]);

  // 應用過濾條件
  useEffect(() => {
    if (!transactions.length) return;
    
    let filtered = [...transactions];
    
    // 應用交易類型過濾
    if (filter.type) {
      filtered = filtered.filter(tx => tx.type === filter.type);
    }
    
    // 應用日期範圍過濾
    if (filter.startDate) {
      filtered = filtered.filter(tx => 
        parseInt(tx.timeStamp) >= Math.floor(filter.startDate.getTime() / 1000)
      );
    }
    
    if (filter.endDate) {
      filtered = filtered.filter(tx => 
        parseInt(tx.timeStamp) <= Math.floor(filter.endDate.getTime() / 1000)
      );
    }
    
    // 應用狀態過濾
    if (filter.status !== undefined) {
      filtered = filtered.filter(tx => tx.isError === (filter.status ? '0' : '1'));
    }
    
    setFilteredTransactions(filtered);
    
    // 計算每日統計數據
    const stats: DailyStats = filtered.reduce((acc, tx) => {
      const date = new Date(parseInt(tx.timeStamp) * 1000).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = { totalValue: ethers.BigNumber.from(0), count: 0 };
      }
      
      // 累計價值（ETH或代幣）
      if (tx.type === 'normal' || tx.type === 'internal') {
        acc[date].totalValue = acc[date].totalValue.add(ethers.BigNumber.from(tx.value));
      } else if (tx.type === 'token' && tx.tokenDecimal) {
        // 代幣轉賬需要考慮小數位
        const tokenValue = ethers.BigNumber.from(tx.value);
        // 這裡可以添加更複雜的代幣價值計算，例如查詢當前匯率
        acc[date].totalValue = acc[date].totalValue.add(tokenValue);
      }
      
      acc[date].count += 1;
      return acc;
    }, {});
    
    setDailyStats(stats);
  }, [transactions, filter]);

  return {
    transactions: filteredTransactions,
    dailyStats,
    loading,
    error
  };
} 