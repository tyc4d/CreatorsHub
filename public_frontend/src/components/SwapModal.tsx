import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEthereum, FaTimes } from 'react-icons/fa';
import { BiTransfer } from 'react-icons/bi';
import { HiArrowDown } from 'react-icons/hi';
import { BsClock } from 'react-icons/bs';
import { Web3Icon } from '@bgd-labs/react-web3-icons';
import { formatUnits, parseUnits } from 'viem';

interface Token {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI: string;
  tags: string[];
}

interface GasPrice {
  baseFee: string;
  low: {
    maxPriorityFeePerGas: string;
    maxFeePerGas: string;
  };
  medium: {
    maxPriorityFeePerGas: string;
    maxFeePerGas: string;
  };
  high: {
    maxPriorityFeePerGas: string;
    maxFeePerGas: string;
  };
  instant: {
    maxPriorityFeePerGas: string;
    maxFeePerGas: string;
  };
}

// 模擬數據
const mockTokens = {
  'USDT': {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  },
  'USDC': {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  },
  'ETH': {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
};

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sourceAmount: string;
  sourceToken: Token;
  creatorAddress?: string;
}

export const SwapModal = ({ isOpen, onClose, onConfirm, sourceAmount, sourceToken, creatorAddress }: SwapModalProps) => {
  const [swapStatus, setSwapStatus] = useState<'quoting' | 'ready' | 'processing'>('quoting');
  const [exchangeRate, setExchangeRate] = useState<string>('0');
  const [estimatedGas, setEstimatedGas] = useState<string>('0');
  const [estimatedOutput, setEstimatedOutput] = useState<string>('0');
  const [estimatedTime, setEstimatedTime] = useState<string>('30-60 秒');
  const [error, setError] = useState<string | null>(null);

  // 獲取代幣價格和 Gas 預估
  useEffect(() => {
    const fetchPriceAndGas = async () => {
      if (!sourceToken?.chainId || !sourceAmount) return;
      setSwapStatus('quoting');

      try {
        // 獲取代幣價格
        const priceResponse = await fetch('https://1inch-vercel-proxy-pi.vercel.app/price/v1.1/' + sourceToken.chainId, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer 0ysuEh7F0SLkDFqQ2M5B9ItYTgWUvUO1',
            'accept': 'application/json',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            tokens: [sourceToken.address],
            currency: 'USD'
          })
        });
        const priceData = await priceResponse.json();
        const tokenPrice = priceData[sourceToken.address] || '0';
        setExchangeRate(tokenPrice);

        // 獲取 Gas 價格
        const gasResponse = await fetch(`https://1inch-vercel-proxy-pi.vercel.app/gas-price/v1.5/${sourceToken.chainId}`);
        const gasData: GasPrice = await gasResponse.json();
        
        // 計算預估 Gas（使用 medium 設置）
        const gasLimit = '200000'; // 預設 gas limit
        const gasPriceInEth = formatUnits(BigInt(gasData.medium.maxFeePerGas), 9); // 轉換為 Gwei
        const estimatedGasInEth = (Number(gasPriceInEth) * Number(gasLimit) / 1e9).toFixed(6);
        setEstimatedGas(estimatedGasInEth);

        // 預估交易時間
        const baseFeeGwei = Number(formatUnits(BigInt(gasData.baseFee), 9));
        const medianPriorityFeeGwei = Number(formatUnits(BigInt(gasData.medium.maxPriorityFeePerGas), 9));
        
        if (medianPriorityFeeGwei <= baseFeeGwei * 0.1) {
          setEstimatedTime('30-60 秒');
        } else if (medianPriorityFeeGwei <= baseFeeGwei * 0.2) {
          setEstimatedTime('15-30 秒');
        } else {
          setEstimatedTime('5-15 秒');
        }

        // 計算預估輸出
        const outputAmount = Number(sourceAmount) * Number(tokenPrice);
        setEstimatedOutput(outputAmount.toFixed(6));

        setSwapStatus('ready');
      } catch (error) {
        console.error('Error fetching price and gas:', error);
        setSwapStatus('error');
      }
    };

    fetchPriceAndGas();
  }, [sourceToken, sourceAmount]);

  const handleSwap = () => {
    setSwapStatus('processing');
    
    // 模擬交易處理
    setTimeout(() => {
      console.log('交易處理中', { 
        amount: sourceAmount, 
        token: sourceToken, 
        creatorAddress: creatorAddress || '未指定創作者'
      });
      
      // 這裡將來會處理實際的交易邏輯
      // 如果有創作者地址，則將資金轉給創作者
      
      onConfirm();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">確認贊助</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>

            {swapStatus === 'quoting' ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">正在獲取最佳匯率...</p>
              </div>
            ) : swapStatus === 'processing' ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">交易處理中...</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">贊助金額</span>
                    <span className="font-medium">{sourceAmount} {sourceToken.symbol}</span>
                  </div>
                  
                  {creatorAddress && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">創作者地址</span>
                      <span className="font-medium text-sm">{creatorAddress.slice(0, 6)}...{creatorAddress.slice(-4)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">預計 USD 價值</span>
                    <span className="font-medium">${(parseFloat(sourceAmount) * parseFloat(exchangeRate)).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">預計 Gas 費用</span>
                    <span className="font-medium">{estimatedGas} {sourceToken.symbol}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">預計交易時間</span>
                    <span className="font-medium flex items-center">
                      <BsClock className="mr-1" /> {estimatedTime}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSwap}
                  disabled={!!error}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  確認贊助
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 