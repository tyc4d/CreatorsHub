import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FusionSDK, NetworkEnum } from '@1inch/fusion-sdk';
import { parseUnits, formatUnits } from 'viem';
import { useAccount, useBalance, useNetwork, useWaitForTransaction } from 'wagmi';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FaEthereum } from 'react-icons/fa';
import { BiLoaderAlt } from 'react-icons/bi';

// 支援的代幣列表
const SUPPORTED_TOKENS = [
  {
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    name: 'Tether USD',
  },
  {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    name: 'USD Coin',
  },
  {
    symbol: 'DAI',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    name: 'Dai Stablecoin',
  },
] as const;

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
  targetAmount: string;
}

export const SwapModal = ({ isOpen, onClose, onSuccess, targetAmount }: SwapModalProps) => {
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [inputAmount, setInputAmount] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: tokenBalance } = useBalance({
    address,
    token: selectedToken.address as `0x${string}`,
  });

  // 監控交易狀態
  const { isLoading: isTransactionPending, isSuccess } = useWaitForTransaction({
    hash: txHash as `0x${string}`,
  });

  // 初始化 1inch SDK
  const sdk = new FusionSDK({
    url: 'https://fusion.1inch.io',
    network: NetworkEnum.ETHEREUM,
    authKey: process.env.REACT_APP_1INCH_API_KEY as string,
  });

  // 獲取報價
  const fetchQuote = async () => {
    if (!inputAmount || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      const fromTokenDecimals = selectedToken.decimals;
      const amount = parseUnits(inputAmount, fromTokenDecimals);

      const quote = await sdk.getQuote({
        fromTokenAddress: selectedToken.address,
        toTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
        amount: amount.toString(),
      });

      setQuote(quote);
    } catch (err) {
      setError('獲取報價失敗，請稍後再試');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 執行兌換
  const handleSwap = async () => {
    if (!quote || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      const order = await sdk.placeOrder({
        fromTokenAddress: selectedToken.address,
        toTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        amount: quote.fromTokenAmount,
        walletAddress: address,
      });

      setTxHash(order.hash);
    } catch (err) {
      setError('交易失敗，請稍後再試');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 監控交易成功
  useEffect(() => {
    if (isSuccess && txHash) {
      onSuccess(txHash);
      onClose();
    }
  }, [isSuccess, txHash]);

  // 當輸入金額改變時更新報價
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [inputAmount, selectedToken]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">關閉</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 dark:text-white mb-4">
                      贊助金額評估
                    </Dialog.Title>

                    {/* 代幣選擇和輸入 */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        選擇代幣
                      </label>
                      <div className="flex space-x-4">
                        {SUPPORTED_TOKENS.map((token) => (
                          <button
                            key={token.symbol}
                            onClick={() => setSelectedToken(token)}
                            className={`px-4 py-2 rounded-lg ${
                              selectedToken.symbol === token.symbol
                                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 border-2 border-primary-500'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {token.symbol}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 金額輸入 */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        輸入金額
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={inputAmount}
                          onChange={(e) => setInputAmount(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                          placeholder={`輸入 ${selectedToken.symbol} 金額`}
                        />
                        <div className="absolute right-3 top-2 text-sm text-gray-500 dark:text-gray-400">
                          餘額: {tokenBalance?.formatted || '0.00'}
                        </div>
                      </div>
                    </div>

                    {/* 兌換預覽 */}
                    {quote && (
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">預計獲得</span>
                          <div className="flex items-center">
                            <FaEthereum className="w-4 h-4 mr-1 text-primary-600" />
                            <span className="font-medium">
                              {formatUnits(BigInt(quote.toTokenAmount), 18)} ETH
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">預估 Gas 費用</span>
                          <span className="font-medium">{formatUnits(BigInt(quote.gas), 9)} Gwei</span>
                        </div>
                      </div>
                    )}

                    {/* 錯誤提示 */}
                    {error && (
                      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                        {error}
                      </div>
                    )}

                    {/* 操作按鈕 */}
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={handleSwap}
                        disabled={!quote || isLoading || isTransactionPending}
                        className={`px-6 py-2 rounded-lg font-medium text-white 
                          ${(!quote || isLoading || isTransactionPending)
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700'
                          } transition-colors`}
                      >
                        {isLoading || isTransactionPending ? (
                          <span className="flex items-center">
                            <BiLoaderAlt className="animate-spin w-5 h-5 mr-2" />
                            {isTransactionPending ? '交易處理中...' : '獲取報價中...'}
                          </span>
                        ) : (
                          '確認兌換並贊助'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}; 