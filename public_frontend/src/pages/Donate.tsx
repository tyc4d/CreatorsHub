import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SwapModal } from '../components/SwapModal';
import { TokenSelector } from '../components/TokenSelector';
import { FaChevronDown, FaEthereum } from 'react-icons/fa';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { useParams } from 'react-router-dom';

interface Token {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI: string;
  tags: string[];
}

// 模擬 NFT 元數據
const MOCK_NFT = {
  name: "CreatorsHub 創作者 NFT",
  description: "這是一個代表 CreatorsHub 創作者身份的 NFT，持有者可以獲得平台上的特殊權益。",
  image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
  attributes: [
    { trait_type: "等級", value: "黃金" },
    { trait_type: "加入日期", value: "2023-06-15" },
    { trait_type: "贊助總額", value: "1.5 ETH" },
    { trait_type: "支持者數量", value: "42" }
  ]
};

const NETWORKS = [
  { chainId: 1, name: 'Ethereum', iconSymbol: 'ETH', shortName: 'ETH' },
  { chainId: 10, name: 'Optimism', iconSymbol: 'OP', shortName: 'OP' },
  { chainId: 42161, name: 'Arbitrum', iconSymbol: 'ARB', shortName: 'ARB' },
  { chainId: 56, name: 'BNB Chain', iconSymbol: 'BNB', shortName: 'BSC' },
  { chainId: 137, name: 'Polygon', iconSymbol: 'MATIC', shortName: 'MATIC' },
  { chainId: 43114, name: 'Avalanche', iconSymbol: 'AVAX', shortName: 'AVAX' },
];

export const Donate = () => {
  const { creatorAddress } = useParams<{ creatorAddress: string }>();
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [usdValue, setUsdValue] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<{ name: string; bio: string } | null>(null);
  const [nftMetadata, setNftMetadata] = useState<any>(null);
  const [isLoadingNft, setIsLoadingNft] = useState(false);

  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
    token: selectedToken?.address as `0x${string}`,
    chainId: selectedToken?.chainId,
    watch: true,
  });

  // 獲取創作者信息
  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (!creatorAddress) return;
      
      try {
        // 這裡應該從 API 獲取創作者信息
        // 目前使用模擬數據
        setCreatorInfo({
          name: `創作者 ${creatorAddress.slice(0, 6)}...${creatorAddress.slice(-4)}`,
          bio: '這是一位優秀的創作者，支持他們的創作吧！'
        });
      } catch (error) {
        console.error('Error fetching creator info:', error);
      }
    };

    fetchCreatorInfo();
  }, [creatorAddress]);

  // 獲取 NFT 元數據
  useEffect(() => {
    const fetchNftMetadata = async () => {
      if (!creatorAddress) return;
      
      setIsLoadingNft(true);
      try {
        // 模擬 API 延遲
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 這裡應該從 API 獲取 NFT 元數據
        // 目前使用模擬數據
        setNftMetadata(MOCK_NFT);
      } catch (error) {
        console.error('Error fetching NFT metadata:', error);
      } finally {
        setIsLoadingNft(false);
      }
    };

    fetchNftMetadata();
  }, [creatorAddress]);

  // 獲取代幣 USD 價格
  useEffect(() => {
    const fetchTokenPrice = async () => {
      if (!selectedToken) return;
      setIsLoadingBalance(true);
      
      try {
        const response = await fetch('https://1inch-vercel-proxy-pi.vercel.app/price/v1.1/' + selectedToken.chainId, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            tokens: [selectedToken.address],
            currency: 'USD'
          })
        });

        const data = await response.json();
        if (data[selectedToken.address]) {
          setUsdValue(data[selectedToken.address]);
        } else {
          setUsdValue('0');
        }
      } catch (error) {
        console.error('Error fetching token price:', error);
        setUsdValue('0');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchTokenPrice();
  }, [selectedToken]);

  // 更新餘額顯示
  useEffect(() => {
    if (balance) {
      setTokenBalance(formatUnits(balance.value, balance.decimals));
    }
  }, [balance]);

  const suggestedAmounts = [
    { value: '0.01', label: '0.01 ETH', tier: '銅牌贊助' },
    { value: '0.05', label: '0.05 ETH', tier: '銀牌贊助' },
    { value: '0.1', label: '0.1 ETH', tier: '金牌贊助' },
  ];

  const handleDonateClick = () => {
    if (!amount) {
      alert('請輸入贊助金額');
      return;
    }
    if (!selectedToken?.chainId) {
      alert('請選擇代幣');
      return;
    }
    setIsSwapModalOpen(true);
  };

  const handleSwapConfirm = () => {
    setIsSwapModalOpen(false);
    // 處理贊助確認邏輯
  };

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setIsTokenSelectorOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          {creatorAddress ? `贊助 ${creatorInfo?.name || '創作者'}` : '贊助創作者'}
        </h1>
        {creatorInfo && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {creatorInfo.bio}
          </p>
        )}
        {creatorAddress && (
          <p className="text-sm text-gray-500 dark:text-gray-500">
            創作者地址: {creatorAddress}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* NFT 顯示區域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">創作者 NFT</h2>
            
            {isLoadingNft ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">載入 NFT 資料中...</p>
              </div>
            ) : nftMetadata ? (
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img 
                    src={nftMetadata.image} 
                    alt={nftMetadata.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold">{nftMetadata.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{nftMetadata.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {nftMetadata.attributes.map((attr: any, index: number) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{attr.trait_type}</p>
                      <p className="font-medium">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">無法載入 NFT 資料</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 贊助表單區域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-6">贊助表單</h2>
          
          <div className="space-y-6">
            {/* 金額輸入 */}
            <div>
              <label className="block text-sm font-medium mb-2">贊助金額</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="輸入金額"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">{selectedToken?.symbol || 'ETH'}</span>
                </div>
              </div>
              
              {/* 快速金額選擇 */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {suggestedAmounts.map((suggestion) => (
                  <button
                    key={suggestion.value}
                    onClick={() => setAmount(suggestion.value)}
                    className={`py-2 text-sm rounded-lg border ${
                      amount === suggestion.value
                        ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:border-primary-500 dark:text-primary-400'
                        : 'border-gray-200 hover:border-primary-200 dark:border-gray-700'
                    }`}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 代幣選擇 */}
            <div>
              <label className="block text-sm font-medium mb-2">選擇代幣</label>
              <button
                onClick={() => setIsTokenSelectorOpen(true)}
                className="w-full px-4 py-3 border rounded-lg flex items-center justify-between hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <div className="flex items-center">
                  {selectedToken ? (
                    <>
                      <img
                        src={selectedToken.logoURI}
                        alt={selectedToken.symbol}
                        className="w-6 h-6 mr-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/24?text=' + selectedToken.symbol.substring(0, 2);
                        }}
                      />
                      <span>{selectedToken.symbol}</span>
                    </>
                  ) : (
                    <>
                      <FaEthereum className="w-6 h-6 mr-2 text-primary-500" />
                      <span>ETH</span>
                    </>
                  )}
                </div>
                <FaChevronDown className="text-gray-400" />
              </button>
              
              {/* 餘額顯示 */}
              {selectedToken && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
                  <span>餘額: {isLoadingBalance ? '載入中...' : `${tokenBalance} ${selectedToken.symbol}`}</span>
                  <span>≈ ${isLoadingBalance ? '載入中...' : (parseFloat(tokenBalance) * parseFloat(usdValue)).toFixed(2)} USD</span>
                </div>
              )}
            </div>
            
            {/* 贊助按鈕 */}
            <button
              onClick={handleDonateClick}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              贊助
            </button>
          </div>
        </motion.div>
      </div>

      {/* Swap Modal */}
      {isSwapModalOpen && (
        <SwapModal
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          onConfirm={handleSwapConfirm}
          sourceToken={selectedToken!}
          sourceAmount={amount}
          creatorAddress={creatorAddress}
        />
      )}

      {/* Token Selector */}
      <TokenSelector
        isOpen={isTokenSelectorOpen}
        onClose={() => setIsTokenSelectorOpen(false)}
        onSelect={handleTokenSelect}
        selectedToken={selectedToken}
      />
    </div>
  );
}; 