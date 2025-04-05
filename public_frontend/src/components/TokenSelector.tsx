import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { Web3Icon } from '@bgd-labs/react-web3-icons';

interface Token {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI: string;
  tags: string[];
}

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  selectedToken?: Token;
  chainId?: number;
}

export const TokenSelector = ({ isOpen, onClose, onSelect, selectedToken, chainId = 1 }: TokenSelectorProps) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 獲取代幣列表
  useEffect(() => {
    const fetchTokens = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('https://1inch-vercel-proxy-pi.vercel.app/token/v1.2/multi-chain/token-list');
        
        if (!response.ok) {
          throw new Error('無法獲取代幣列表');
        }
        
        const data = await response.json();
        
        // 過濾指定鏈上的代幣
        const chainTokens = data.tokens.filter((token: Token) => token.chainId === chainId);
        
        // 按標籤排序，優先顯示原生代幣和常用代幣
        const sortedTokens = chainTokens.sort((a: Token, b: Token) => {
          // 原生代幣優先
          const aIsNative = a.tags.includes('native');
          const bIsNative = b.tags.includes('native');
          if (aIsNative && !bIsNative) return -1;
          if (!aIsNative && bIsNative) return 1;
          
          // 常用代幣優先
          const commonTokens = ['ETH', 'USDT', 'USDC', 'DAI', 'WBTC', 'WETH'];
          const aIsCommon = commonTokens.includes(a.symbol);
          const bIsCommon = commonTokens.includes(b.symbol);
          if (aIsCommon && !bIsCommon) return -1;
          if (!aIsCommon && bIsCommon) return 1;
          
          // 按符號字母順序排序
          return a.symbol.localeCompare(b.symbol);
        });
        
        setTokens(sortedTokens);
        setFilteredTokens(sortedTokens);
      } catch (err) {
        console.error('獲取代幣列表失敗:', err);
        setError('獲取代幣列表失敗，請稍後重試');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTokens();
  }, [isOpen, chainId]);

  // 當搜索框打開時自動聚焦
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // 處理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredTokens(tokens);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = tokens.filter(token => 
      token.symbol.toLowerCase().includes(lowerQuery) || 
      token.name.toLowerCase().includes(lowerQuery)
    );
    
    setFilteredTokens(filtered);
  };

  // 處理代幣選擇
  const handleTokenSelect = (token: Token) => {
    onSelect(token);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">選擇代幣</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* 搜索框 */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索代幣名稱或符號"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* 代幣列表 */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 p-4">{error}</div>
              ) : filteredTokens.length === 0 ? (
                <div className="text-center text-gray-500 p-4">未找到匹配的代幣</div>
              ) : (
                <div className="space-y-1">
                  {filteredTokens.map((token) => (
                    <button
                      key={`${token.chainId}-${token.address}`}
                      onClick={() => handleTokenSelect(token)}
                      className={`w-full p-3 flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        selectedToken?.address === token.address ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <div className="w-8 h-8 mr-3 flex-shrink-0">
                        {token.logoURI ? (
                          <img
                            src={token.logoURI}
                            alt={token.symbol}
                            className="w-full h-full rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token.address}/logo.png`;
                              target.onerror = () => {
                                target.src = 'https://via.placeholder.com/32?text=' + token.symbol.substring(0, 2);
                              };
                            }}
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                            {token.symbol.substring(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{token.name}</div>
                      </div>
                      {selectedToken?.address === token.address && (
                        <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 