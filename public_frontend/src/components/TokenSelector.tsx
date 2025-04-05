import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';

interface Network {
  chainId: number;
  name: string;
  iconSymbol: string;
  shortName: string;
  iconFileName?: string;
}

interface Token {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI: string;
  tags: string[];
}

interface TokenWithNetworks extends Token {
  networks: Network[];
}

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  selectedToken?: Token;
}

// 常用代幣列表（按優先順序排序）
const POPULAR_TOKENS = ['ETH', 'WETH', 'USDT', 'USDC', 'DAI', 'WBTC', 'BNB', 'MATIC'];

const NETWORKS: Network[] = [
  { 
    chainId: 1, 
    name: 'Ethereum', 
    iconSymbol: 'ETH', 
    shortName: 'ETH',
    iconFileName: 'ethereum.svg'
  },
  { 
    chainId: 10, 
    name: 'Optimism', 
    iconSymbol: 'OP', 
    shortName: 'OP',
    iconFileName: 'optimism.svg'
  },
  { 
    chainId: 42161, 
    name: 'Arbitrum', 
    iconSymbol: 'ARB', 
    shortName: 'ARB',
    iconFileName: 'arbitrum.svg'
  },
  { 
    chainId: 56, 
    name: 'BNB Chain', 
    iconSymbol: 'BNB', 
    shortName: 'BSC',
    iconFileName: 'bnb.svg'
  },
  { 
    chainId: 137, 
    name: 'Polygon', 
    iconSymbol: 'MATIC', 
    shortName: 'MATIC',
    iconFileName: 'polygon.svg'
  },
  { 
    chainId: 43114, 
    name: 'Avalanche', 
    iconSymbol: 'AVAX', 
    shortName: 'AVAX',
    iconFileName: 'avalanche.svg'
  },
  { 
    chainId: 250, 
    name: 'Fantom', 
    iconSymbol: 'FTM', 
    shortName: 'FTM',
    iconFileName: 'fantom.svg'
  },
  { 
    chainId: 100, 
    name: 'Gnosis', 
    iconSymbol: 'XDAI', 
    shortName: 'XDAI',
    iconFileName: 'gnosis.svg'
  },
  { 
    chainId: 1313161554, 
    name: 'Aurora', 
    iconSymbol: 'AURORA', 
    shortName: 'AURORA',
    iconFileName: 'aurora.svg'
  },
  { 
    chainId: 8217, 
    name: 'Klaytn', 
    iconSymbol: 'KLAY', 
    shortName: 'KLAY',
    iconFileName: 'klaytn.svg'
  },
  { 
    chainId: 42220, 
    name: 'Celo', 
    iconSymbol: 'CELO', 
    shortName: 'CELO',
    iconFileName: 'celo.svg'
  }
];

const NetworkIcon = ({ network }: { network: Network }) => {
  const [fallbackError, setFallbackError] = useState(false);

  if (!fallbackError) {
    return (
      <Web3Icon
        symbol={network.iconSymbol}
        className="w-full h-full"
        onError={() => setFallbackError(true)}
      />
    );
  }

  return network.iconFileName ? (
    <img
      src={`https://app.1inch.io/assets/images/network-logos/${network.iconFileName}`}
      alt={network.name}
      className="w-full h-full"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = 'https://via.placeholder.com/32?text=' + network.shortName.substring(0, 2);
      }}
    />
  ) : (
    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
      {network.shortName.substring(0, 2)}
    </div>
  );
};

export const TokenSelector = ({ isOpen, onClose, onSelect, selectedToken }: TokenSelectorProps) => {
  const { address: userAddress } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens, setTokens] = useState<TokenWithNetworks[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTokenForNetwork, setSelectedTokenForNetwork] = useState<TokenWithNetworks | null>(null);
  const [displayedToken, setDisplayedToken] = useState<Token | undefined>(selectedToken);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  // 當 selectedToken 改變時更新 displayedToken
  useEffect(() => {
    if (selectedToken) {
      setDisplayedToken(selectedToken);
    }
  }, [selectedToken]);

  // 過濾代幣
  const filteredTokens = useMemo(() => 
    tokens.filter(token => 
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [tokens, searchQuery]
  );

  // 虛擬滾動設置
  const rowVirtualizer = useVirtualizer({
    count: filteredTokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // 每個項目的預估高度
    overscan: 5, // 預加載的項目數量
  });

  useEffect(() => {
    if (isOpen) {
      fetchTokens();
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSelectedTokenForNetwork(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://1inch-vercel-proxy-pi.vercel.app/token/v1.2/multi-chain/token-list');
      const data = await response.json();
      
      // 收集所有可用的 chainId
      const availableChainIds = new Set<number>(data.tokens.map((token: Token) => token.chainId));
      
      // 更新 NETWORKS 以包含所有可用的鏈
      const updatedNetworks = Array.from(availableChainIds).map(chainId => {
        const existingNetwork = NETWORKS.find(n => n.chainId === chainId);
        if (existingNetwork) return existingNetwork;
        return null; // 如果找不到對應的網路配置，返回 null
      }).filter((network): network is Network => network !== null);
      
      // 將代幣按照符號分組，合併不同鏈上的同一代幣
      const tokenMap = new Map<string, TokenWithNetworks>();
      
      data.tokens.forEach((token: Token) => {
        const existingToken = tokenMap.get(token.symbol);
        const network = updatedNetworks.find(n => n.chainId === token.chainId);
        
        if (network) {
          if (existingToken) {
            existingToken.networks.push(network);
          } else {
            tokenMap.set(token.symbol, {
              ...token,
              networks: [network]
            });
          }
        }
      });
      
      // 將代幣轉換為數組並排序
      const sortedTokens = Array.from(tokenMap.values()).sort((a, b) => {
        // 檢查是否為常用代幣
        const aPopularIndex = POPULAR_TOKENS.indexOf(a.symbol);
        const bPopularIndex = POPULAR_TOKENS.indexOf(b.symbol);
        
        // 如果兩個都是常用代幣，按照常用代幣列表的順序排序
        if (aPopularIndex !== -1 && bPopularIndex !== -1) {
          return aPopularIndex - bPopularIndex;
        }
        
        // 如果只有一個是常用代幣，將其排在前面
        if (aPopularIndex !== -1) return -1;
        if (bPopularIndex !== -1) return 1;
        
        // 如果都不是常用代幣，按照代幣符號字母順序排序
        return a.symbol.localeCompare(b.symbol);
      });
      
      setTokens(sortedTokens);
    } catch (err) {
      setError('無法載入代幣列表');
      console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenClick = (token: TokenWithNetworks) => {
    if (token.networks.length === 1) {
      const selectedToken = { ...token, chainId: token.networks[0].chainId };
      setDisplayedToken(selectedToken);
      onSelect(selectedToken);
      onClose();
    } else {
      setSelectedTokenForNetwork(token);
    }
  };

  const handleNetworkSelect = (token: TokenWithNetworks, network: Network) => {
    const selectedToken = {
      ...token,
      chainId: network.chainId
    };
    setDisplayedToken(selectedToken);
    onSelect(selectedToken);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* 標題列 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedTokenForNetwork ? '選擇網路' : '選擇代幣'}
              </h3>
              <button
                onClick={selectedTokenForNetwork ? () => setSelectedTokenForNetwork(null) : onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* 搜尋框 */}
            {!selectedTokenForNetwork && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋代幣名稱或符號"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}

            {/* 代幣列表或網路列表 */}
            <div 
              ref={parentRef}
              className="max-h-96 overflow-y-auto"
              style={{
                height: '400px',
                width: '100%',
                overflow: 'auto',
              }}
            >
              {loading ? (
                <div className="p-4 text-center text-gray-500">載入中...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : selectedTokenForNetwork ? (
                // 網路列表
                <div className="space-y-2 p-4">
                  {selectedTokenForNetwork.networks.map((network) => (
                    <button
                      key={network.chainId}
                      onClick={() => handleNetworkSelect(selectedTokenForNetwork, network)}
                      className="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="w-6 h-6 mr-3">
                        <NetworkIcon network={network} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{network.name}</div>
                        <div className="text-sm text-gray-500">{network.shortName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // 代幣列表
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const token = filteredTokens[virtualRow.index];
                    return (
                      <div
                        key={token.symbol}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <button
                          onClick={() => handleTokenClick(token)}
                          className="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 mr-3 flex-shrink-0">
                            {token.logoURI ? (
                              <img
                                src={token.logoURI}
                                alt={token.symbol}
                                className="w-full h-full rounded-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/32?text=' + token.symbol.substring(0, 2);
                                }}
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                                {token.symbol.substring(0, 2)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-[120px] mr-4">
                            <div className="font-medium text-left">{token.symbol}</div>
                            <div className="text-sm text-gray-500 text-left truncate">
                              {token.name}
                              {displayedToken && token.symbol === displayedToken.symbol && (
                                <span className="ml-1 text-primary-500">
                                  on {NETWORKS.find(n => n.chainId === displayedToken.chainId)?.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-1" />
                          <div className="flex gap-1 flex-shrink-0">
                            {token.networks.map(network => (
                              <div key={network.chainId} title={network.name} className="w-5 h-5">
                                <NetworkIcon network={network} />
                              </div>
                            ))}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 