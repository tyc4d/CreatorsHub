import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SwapModal } from '../components/SwapModal';
import { TokenSelector } from '../components/TokenSelector';
import { FaChevronDown } from 'react-icons/fa';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

interface Token {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI: string;
  tags: string[];
}

const NETWORKS = [
  { chainId: 1, name: 'Ethereum', iconSymbol: 'ETH', shortName: 'ETH' },
  { chainId: 10, name: 'Optimism', iconSymbol: 'OP', shortName: 'OP' },
  { chainId: 42161, name: 'Arbitrum', iconSymbol: 'ARB', shortName: 'ARB' },
  { chainId: 56, name: 'BNB Chain', iconSymbol: 'BNB', shortName: 'BSC' },
  { chainId: 137, name: 'Polygon', iconSymbol: 'MATIC', shortName: 'MATIC' },
  { chainId: 43114, name: 'Avalanche', iconSymbol: 'AVAX', shortName: 'AVAX' },
];

export const Donate = () => {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [usdValue, setUsdValue] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
    token: selectedToken?.address as `0x${string}`,
    chainId: selectedToken?.chainId,
  });

  // 獲取代幣 USD 價格
  useEffect(() => {
    const fetchTokenPrice = async () => {
      if (!selectedToken) return;
      setIsLoadingBalance(true);
      
      try {
        const response = await fetch('https://1inch-vercel-proxy-pi.vercel.app/price/v1.1/' + selectedToken.chainId, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer 0ysuEh7F0SLkDFqQ2M5B9ItYTgWUvUO1',
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
    if (!selectedToken) {
      alert('請選擇代幣');
      return;
    }
    setIsSwapModalOpen(true);
  };

  const handleSwapConfirm = () => {
    // 這裡將來會處理實際的交易邏輯
    console.log('交易確認', { amount, selectedToken });
  };

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
  };

  return (
    <div className="flex justify-center w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">支持創作者</h2>
            <p className="text-gray-600 dark:text-gray-400">您的支持是創作者持續創作的動力</p>
          </div>

          <div className="card space-y-8">
            {/* 創作者信息 */}
            <div className="creator-card">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-xl sm:text-2xl text-white">C</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1">創作者名稱</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">0x1234...5678</p>
              </div>
            </div>

            {/* 捐贈金額選擇 */}
            <div className="space-y-4">
              <label className="block text-lg font-medium mb-2">選擇贊助金額</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {suggestedAmounts.map((suggestion) => (
                  <button
                    key={suggestion.value}
                    onClick={() => setAmount(suggestion.value)}
                    className={`amount-button flex flex-col items-center ${
                      amount === suggestion.value ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    <span className="text-lg font-medium">{suggestion.label}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {suggestion.tier}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative mt-4">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="自訂金額"
                  className="input pr-16"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <span className="text-gray-500">{selectedToken?.symbol || 'ETH'}</span>
                </div>
              </div>
            </div>

            {/* 代幣選擇 */}
            <div className="space-y-4">
              <label className="block text-lg font-medium mb-2">選擇代幣</label>
              <div className="space-y-2">
                <button
                  onClick={() => setIsTokenSelectorOpen(true)}
                  className="w-full p-3 flex items-center justify-between border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    {selectedToken ? (
                      <>
                        <div className="w-8 h-8 mr-3">
                          {selectedToken.logoURI ? (
                            <img
                              src={selectedToken.logoURI}
                              alt={selectedToken.symbol}
                              className="w-full h-full rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/32?text=' + selectedToken.symbol.substring(0, 2);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                              {selectedToken.symbol.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{selectedToken.symbol}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedToken.name}
                            {selectedToken.chainId && (
                              <span className="ml-1 text-primary-500">
                                on {NETWORKS.find(n => n.chainId === selectedToken.chainId)?.name || 'Unknown Network'}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center">
                        <div className="w-8 h-8 mr-3 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-xs font-medium">ETH</span>
                        </div>
                        <div>
                          <div className="font-medium">ETH</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Ethereum</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <FaChevronDown className="text-gray-400" />
                </button>
                
                {/* 餘額和 USD 價值顯示 */}
                {selectedToken && (
                  <div className="flex justify-between items-center px-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <span>餘額:</span>
                      {isLoadingBalance ? (
                        <span className="animate-pulse">載入中...</span>
                      ) : (
                        <span>{Number(tokenBalance).toFixed(6)} {selectedToken.symbol}</span>
                      )}
                    </div>
                    <div>
                      {isLoadingBalance ? (
                        <span className="animate-pulse">載入中...</span>
                      ) : (
                        <span>≈ ${(Number(tokenBalance) * Number(usdValue)).toFixed(2)} USD</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 捐贈按鈕 */}
            <button 
              onClick={handleDonateClick}
              className="btn btn-primary w-full text-lg py-4"
            >
              確認贊助
            </button>
          </div>
        </div>
      </motion.div>

      {/* Swap Modal */}
      <SwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        onConfirm={handleSwapConfirm}
        sourceAmount={amount}
        sourceToken={selectedToken?.symbol || 'ETH'}
      />

      {/* Token Selector */}
      <TokenSelector
        isOpen={isTokenSelectorOpen}
        onClose={() => setIsTokenSelectorOpen(false)}
        onSelect={setSelectedToken}
      />
    </div>
  );
}; 