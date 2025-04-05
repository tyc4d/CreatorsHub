import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';

interface TokenAction {
  chainId: string;
  address: string;
  standard: string;
  fromAddress: string;
  toAddress: string;
  amount?: string;
  tokenId?: string;
  direction: 'In' | 'Out';
}

interface TransactionDetails {
  txHash: string;
  chainId: number;
  blockNumber: number;
  blockTimeSec: number;
  status: string;
  type: string;
  tokenActions: TokenAction[];
  fromAddress: string;
  toAddress: string;
  nonce: number;
  orderInBlock: number;
  feeInSmallestNative: string;
  nativeTokenPriceToUsd: string | null;
}

interface Transaction {
  timeMs: number;
  address: string;
  type: number;
  rating: string;
  direction: 'in' | 'out';
  details: TransactionDetails;
  id: string;
  eventOrderInTransaction: number;
}

interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  amountRange: {
    min: string;
    max: string;
  };
  token: string;
  status: string;
}

export const TransactionHistory = () => {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 篩選狀態
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      start: '',
      end: '',
    },
    amountRange: {
      min: '',
      max: '',
    },
    token: '',
    status: '',
  });

  // 獲取交易歷史
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!address) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          limit: '100',
          chainId: '10', // Optimism
        });

        if (filters.dateRange.start) {
          params.append('fromTimestampMs', new Date(filters.dateRange.start).getTime().toString());
        }
        if (filters.dateRange.end) {
          params.append('toTimestampMs', new Date(filters.dateRange.end).getTime().toString());
        }
        if (filters.token) {
          params.append('tokenAddress', filters.token);
        }

        const response = await fetch(
          `https://1inch-vercel-proxy-pi.vercel.app/history/v2.0/history/${address}/events?${params.toString()}`,
          {
            headers: {
              'accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('獲取交易歷史失敗');
        }

        const data = await response.json();
        setTransactions(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : '發生未知錯誤');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [address, filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // 格式化金額顯示
  const formatAmount = (action: TokenAction) => {
    if (action.standard === 'ERC721') {
      return `NFT #${action.tokenId}`;
    }
    return action.amount ? `${Number(formatUnits(BigInt(action.amount), 18)).toFixed(6)} ${
      action.standard === 'Native' ? 'ETH' :
      action.standard === 'ERC20' ? 'USDC' :
      'Unknown'
    }` : 'Unknown';
  };

  // 獲取代幣名稱
  const getTokenName = (action: TokenAction) => {
    if (action.standard === 'ERC721') {
      return 'NFT';
    }
    return action.standard === 'Native' ? 'ETH' :
           action.standard === 'ERC20' ? 'USDC' :
           'Unknown';
  };

  // 獲取交易類型的中文顯示
  const getTransactionTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'Receive': '收到',
      'Send': '發送',
      'SwapExactInput': '兌換',
      'Transfer': '轉帳',
    };
    return typeMap[type] || type;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl"
    >
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">交易歷史</h2>
          <p className="text-gray-600 dark:text-gray-400">查看和管理您的所有交易記錄</p>
        </div>

        {/* 篩選器 */}
        <div className="card space-y-6">
          <h3 className="text-xl font-semibold mb-4">篩選條件</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 時間範圍 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">時間範圍</label>
              <input
                type="date"
                className="input"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              />
              <input
                type="date"
                className="input"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              />
            </div>

            {/* 金額範圍 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">金額範圍</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="最小值"
                  className="input"
                  value={filters.amountRange.min}
                  onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, min: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="最大值"
                  className="input"
                  value={filters.amountRange.max}
                  onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, max: e.target.value })}
                />
              </div>
            </div>

            {/* 代幣類型 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">代幣類型</label>
              <select
                className="select"
                value={filters.token}
                onChange={(e) => handleFilterChange('token', e.target.value)}
              >
                <option value="">全部</option>
                <option value="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee">ETH</option>
                <option value="0x7f5c764cbc14f9669b88837ca1490cca17c31607">USDC</option>
              </select>
            </div>

            {/* 交易狀態 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">交易狀態</label>
              <select
                className="select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">全部</option>
                <option value="completed">已完成</option>
                <option value="pending">處理中</option>
                <option value="failed">失敗</option>
              </select>
            </div>
          </div>
        </div>

        {/* 載入中狀態 */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">載入交易歷史中...</p>
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 交易列表 */}
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-gray-500">{tx.details.txHash}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tx.details.status === 'completed' ? 'bg-green-100 text-green-800' :
                      tx.details.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tx.details.status === 'completed' ? '已完成' :
                       tx.details.status === 'pending' ? '處理中' : '失敗'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(tx.timeMs).toLocaleString()}
                  </div>
                  <div className="text-sm font-medium">
                    {getTransactionTypeDisplay(tx.details.type)}
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 text-right">
                  {tx.details.tokenActions.map((action, index) => (
                    <div key={index} className="mb-1">
                      <div className={`text-lg font-semibold ${
                        action.direction === 'In' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {action.direction === 'In' ? '收到' : '發送'} {formatAmount(action)}
                      </div>
                      {action.standard === 'ERC721' && (
                        <div className="text-sm text-gray-500">
                          合約地址: {action.address}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="text-sm text-gray-500">
                    Gas: {formatAmount({ ...tx.details.tokenActions[0], amount: tx.details.feeInSmallestNative })} ETH
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">從：</span>
                    <span className="font-mono">{tx.details.fromAddress}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">至：</span>
                    <span className="font-mono">{tx.details.toAddress}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}; 