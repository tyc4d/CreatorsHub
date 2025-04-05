import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';

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
  creator: string;
}

interface NftAttribute {
  trait_type: string;
  value: string;
}

interface NftMetadata {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  attributes: NftAttribute[];
}

// 模擬創作者數據
const MOCK_CREATORS = [
  { address: '0x1234567890123456789012345678901234567890', name: '創作者 A', nftCount: 3 },
  { address: '0x2345678901234567890123456789012345678901', name: '創作者 B', nftCount: 5 },
  { address: '0x3456789012345678901234567890123456789012', name: '創作者 C', nftCount: 2 },
  { address: '0x4567890123456789012345678901234567890123', name: '創作者 D', nftCount: 7 },
  { address: '0x5678901234567890123456789012345678901234', name: '創作者 E', nftCount: 4 },
];

// 模擬 NFT 元數據
const MOCK_NFT_METADATA: Record<string, NftMetadata[]> = {
  '0x1234567890123456789012345678901234567890': [
    { tokenId: '1', name: '支持者 NFT #1', description: '支持創作者 A 的 NFT', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80', attributes: [{ trait_type: "贊助金額", value: "0.05 ETH" }, { trait_type: "贊助日期", value: "2023-06-15" }] },
    { tokenId: '2', name: '支持者 NFT #2', description: '支持創作者 A 的 NFT', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80', attributes: [{ trait_type: "贊助金額", value: "0.1 ETH" }, { trait_type: "贊助日期", value: "2023-07-20" }] },
    { tokenId: '3', name: '支持者 NFT #3', description: '支持創作者 A 的 NFT', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80', attributes: [{ trait_type: "贊助金額", value: "0.15 ETH" }, { trait_type: "贊助日期", value: "2023-08-10" }] },
  ],
  '0x2345678901234567890123456789012345678901': [
    { tokenId: '1', name: '支持者 NFT #1', description: '支持創作者 B 的 NFT', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80', attributes: [{ trait_type: "贊助金額", value: "0.02 ETH" }, { trait_type: "贊助日期", value: "2023-06-05" }] },
    { tokenId: '2', name: '支持者 NFT #2', description: '支持創作者 B 的 NFT', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80', attributes: [{ trait_type: "贊助金額", value: "0.05 ETH" }, { trait_type: "贊助日期", value: "2023-07-15" }] },
    { tokenId: '3', name: '支持者 NFT #3', description: '支持創作者 B 的 NFT', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80', attributes: [{ trait_type: "贊助金額", value: "0.08 ETH" }, { trait_type: "贊助日期", value: "2023-08-01" }] },
    { tokenId: '4', name: '支持者 NFT #4', description: '支持創作者 B 的 NFT', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80', attributes: [{ trait_type: "贊助金額", value: "0.12 ETH" }, { trait_type: "贊助日期", value: "2023-09-10" }] },
    { tokenId: '5', name: '支持者 NFT #5', description: '支持創作者 B 的 NFT', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80', attributes: [{ trait_type: "贊助金額", value: "0.15 ETH" }, { trait_type: "贊助日期", value: "2023-10-05" }] },
  ],
};

interface UserNft extends NftMetadata {
  creatorAddress: string;
  creatorName: string;
}

export const TransactionHistory = () => {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [userNfts, setUserNfts] = useState<UserNft[]>([]);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);
  
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
    creator: '',
  });

  // 獲取用戶的 NFT
  useEffect(() => {
    const fetchUserNfts = async () => {
      if (!address) return;
      
      setIsLoadingNfts(true);
      
      try {
        // 模擬 API 延遲
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 這裡應該從 API 獲取用戶的 NFT
        // 目前使用模擬數據
        const nfts: UserNft[] = [];
        
        // 模擬從不同創作者獲得的 NFT
        for (const creator of MOCK_CREATORS) {
          if (MOCK_NFT_METADATA[creator.address]) {
            nfts.push(...MOCK_NFT_METADATA[creator.address].map(nft => ({
              ...nft,
              creatorAddress: creator.address,
              creatorName: creator.name,
            })));
          }
        }
        
        setUserNfts(nfts);
      } catch (error) {
        console.error('Error fetching user NFTs:', error);
      } finally {
        setIsLoadingNfts(false);
      }
    };

    fetchUserNfts();
  }, [address]);

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
        if (filters.creator) {
          params.append('creatorAddress', filters.creator);
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

  const clearFilters = () => {
    setFilters({
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
      creator: '',
    });
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

  // 獲取創作者名稱
  const getCreatorName = (address: string) => {
    const creator = MOCK_CREATORS.find(c => c.address.toLowerCase() === address.toLowerCase());
    return creator ? creator.name : address;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto px-4 py-8"
    >
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">交易歷史</h2>
          <p className="text-gray-600 dark:text-gray-400">查看和管理您的所有交易記錄</p>
        </div>

        {/* NFT 收藏區域 */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">您的支持者 NFT 收藏</h3>
          
          {isLoadingNfts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">載入 NFT 收藏中...</p>
            </div>
          ) : userNfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userNfts.map((nft, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={nft.image} 
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-lg">{nft.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{nft.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">創作者: {nft.creatorName}</span>
                      <button 
                        onClick={() => handleFilterChange('creator', nft.creatorAddress)}
                        className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-1 rounded"
                      >
                        查看交易
                      </button>
                    </div>
                    {nft.attributes.map((attr: any, attrIndex: number) => (
                      <div key={attrIndex} className="mt-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{attr.trait_type}:</span>{' '}
                        <span className="font-medium">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">您還沒有支持者 NFT</p>
            </div>
          )}
        </div>

        {/* 篩選器 */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">篩選條件</h3>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-primary-600 dark:text-primary-400"
            >
              {showFilters ? <FaTimes className="mr-1" /> : <FaFilter className="mr-1" />}
              {showFilters ? '隱藏篩選' : '顯示篩選'}
            </button>
          </div>
          
          {showFilters && (
            <div className="space-y-4">
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

                {/* 創作者 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">創作者</label>
                  <select
                    className="select"
                    value={filters.creator}
                    onChange={(e) => handleFilterChange('creator', e.target.value)}
                  >
                    <option value="">全部</option>
                    {MOCK_CREATORS.map((creator, index) => (
                      <option key={index} value={creator.address}>{creator.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={clearFilters}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  清除篩選
                </button>
              </div>
            </div>
          )}
          
          {/* 當前篩選標籤 */}
          {(filters.creator || filters.token || filters.dateRange.start || filters.dateRange.end) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.creator && (
                <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-sm flex items-center">
                  <span>創作者: {getCreatorName(filters.creator)}</span>
                  <button 
                    onClick={() => handleFilterChange('creator', '')}
                    className="ml-2 text-primary-600 dark:text-primary-400"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              
              {filters.token && (
                <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-sm flex items-center">
                  <span>代幣: {filters.token === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ? 'ETH' : 'USDC'}</span>
                  <button 
                    onClick={() => handleFilterChange('token', '')}
                    className="ml-2 text-primary-600 dark:text-primary-400"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              
              {filters.dateRange.start && (
                <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-sm flex items-center">
                  <span>開始日期: {filters.dateRange.start}</span>
                  <button 
                    onClick={() => handleFilterChange('dateRange', { ...filters.dateRange, start: '' })}
                    className="ml-2 text-primary-600 dark:text-primary-400"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              
              {filters.dateRange.end && (
                <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-sm flex items-center">
                  <span>結束日期: {filters.dateRange.end}</span>
                  <button 
                    onClick={() => handleFilterChange('dateRange', { ...filters.dateRange, end: '' })}
                    className="ml-2 text-primary-600 dark:text-primary-400"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          )}
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
          {transactions.length > 0 ? (
            transactions.map((tx) => (
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
                      {MOCK_CREATORS.some(c => c.address.toLowerCase() === tx.details.fromAddress.toLowerCase()) && (
                        <span className="ml-2 text-primary-600 dark:text-primary-400">
                          ({getCreatorName(tx.details.fromAddress)})
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">至：</span>
                      <span className="font-mono">{tx.details.toAddress}</span>
                      {MOCK_CREATORS.some(c => c.address.toLowerCase() === tx.details.toAddress.toLowerCase()) && (
                        <span className="ml-2 text-primary-600 dark:text-primary-400">
                          ({getCreatorName(tx.details.toAddress)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">沒有找到符合條件的交易記錄</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}; 