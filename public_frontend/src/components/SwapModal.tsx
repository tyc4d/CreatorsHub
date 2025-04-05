import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEthereum, FaTimes } from 'react-icons/fa';
import { BiTransfer } from 'react-icons/bi';
import { HiArrowDown } from 'react-icons/hi';
import { 1inch } from '@bgd-labs/react-web3-icons';
import { BsClock } from 'react-icons/bs';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sourceAmount: string;
  sourceToken: string;
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

export const SwapModal = ({ isOpen, onClose, onConfirm, sourceAmount, sourceToken }: SwapModalProps) => {
  const [swapStatus, setSwapStatus] = useState<'initial' | 'quoting' | 'ready' | 'swapping' | 'error'>('initial');
  const [estimatedGas, setEstimatedGas] = useState('0.005');
  const [exchangeRate, setExchangeRate] = useState('1850.75');
  const [estimatedOutput, setEstimatedOutput] = useState('0');
  const [estimatedTime, setEstimatedTime] = useState('15-30 秒');

  // 模擬獲取報價
  useEffect(() => {
    if (isOpen && sourceAmount && sourceToken) {
      setSwapStatus('quoting');
      // 模擬 API 調用延遲
      setTimeout(() => {
        const mockOutput = Number(sourceAmount) * Number(exchangeRate);
        setEstimatedOutput(mockOutput.toFixed(4));
        setSwapStatus('ready');
      }, 1500);
    }
  }, [isOpen, sourceAmount, sourceToken]);

  const handleSwap = () => {
    setSwapStatus('swapping');
    // 模擬交換過程
    setTimeout(() => {
      onConfirm();
      setSwapStatus('initial');
      onClose();
    }, 2000);
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">確認贊助</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* 代幣轉換預覽 */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={mockTokens[sourceToken as keyof typeof mockTokens]?.logo}
                      alt={sourceToken}
                      className="w-8 h-8"
                    />
                    <div>
                      <p className="font-medium">{sourceAmount} {sourceToken}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        您支付
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-full">
                  <HiArrowDown className="w-6 h-6 text-primary-600" />
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaEthereum className="w-8 h-8 text-primary-600" />
                    <div>
                      <p className="font-medium">{estimatedOutput} ETH</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        創作者收到
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 轉換詳情 */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">兌換率</span>
                  <span>1 {sourceToken} ≈ {exchangeRate} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">預估 Gas</span>
                  <span>{estimatedGas} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">預估時間</span>
                  <span className="flex items-center">
                    <BsClock className="w-4 h-4 mr-1" />
                    {estimatedTime}
                  </span>
                </div>
              </div>

              {/* 路徑提供者 */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>最佳路徑由</span>
                <div className="flex items-center space-x-1">
                  <Si1InchProtocol className="w-4 h-4" />
                  <span className="font-medium">1inch</span>
                </div>
                <span>提供</span>
              </div>
            </div>

            {/* 狀態和按鈕 */}
            <div className="mt-6">
              {swapStatus === 'quoting' && (
                <div className="text-center text-gray-600 dark:text-gray-400 mb-4">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mb-2"></div>
                  <p>正在獲取最佳兌換路徑...</p>
                </div>
              )}

              {swapStatus === 'swapping' && (
                <div className="text-center text-gray-600 dark:text-gray-400 mb-4">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mb-2"></div>
                  <p>正在處理交易...</p>
                </div>
              )}

              <button
                onClick={handleSwap}
                disabled={swapStatus !== 'ready'}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white 
                  ${swapStatus === 'ready'
                    ? 'bg-primary-600 hover:bg-primary-700'
                    : 'bg-gray-400 cursor-not-allowed'
                  } transition-colors`}
              >
                {swapStatus === 'ready' ? '確認贊助' : '準備中...'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 