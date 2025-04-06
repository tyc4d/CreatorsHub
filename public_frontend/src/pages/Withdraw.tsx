import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { useEnsName } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { FaEthereum, FaYoutube } from 'react-icons/fa';
import { BiWallet } from 'react-icons/bi';
import { HiArrowDown } from 'react-icons/hi';

// 這裡需要替換成實際的合約 ABI 和地址
const CONTRACT_ADDRESS = '0x1234...5678';
const CONTRACT_ABI = [
  {
    inputs: [],
    name: 'getWithdrawableAmount',
    outputs: [{ type: 'uint256', name: 'amount' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

interface CreatorInfo {
  name: string;
  avatar: string;
  youtubeChannel: string;
}

export const Withdraw = () => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [creatorInfo] = useState<CreatorInfo>({
    name: 'Digital Creator',
    avatar: 'https://i.pravatar.cc/150?img=3',
    youtubeChannel: 'UCxxxxxxxxxx',
  });

  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });

  // 獲取錢包 ETH 餘額
  const { data: walletBalance } = useBalance({
    address: address,
  });

  // 獲取合約中可提領的金額
  const { data: withdrawableAmount } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'getWithdrawableAmount',
  });

  // 提款功能
  const { writeContract, isPending } = useWriteContract();

  const handleWithdraw = async () => {
    if (!withdrawableAmount || isWithdrawing) return;
    
    try {
      setIsWithdrawing(true);
      await writeContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'withdraw',
      });
    } catch (error) {
      console.error('提款失敗:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const displayAddress = ensName || address;
  const formattedWithdrawableAmount = withdrawableAmount 
    ? formatEther(withdrawableAmount as bigint)
    : '0.00';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Withdrawal Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and withdraw your creation income
        </p>
      </div>

      {/* Creator Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex items-center space-x-4">
          <img
            src={creatorInfo.avatar}
            alt={creatorInfo.name}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h2 className="text-xl font-bold">{creatorInfo.name}</h2>
            <div className="flex items-center space-x-2 mt-2">
              <FaYoutube className="text-red-600 w-5 h-5" />
              <span className="text-gray-600 dark:text-gray-400">
                {creatorInfo.youtubeChannel}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <BiWallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {displayAddress || 'Wallet Not Connected'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 餘額和提款區域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            Withdrawable Amount
          </h3>
          <div className="flex items-center justify-center mt-4">
            <FaEthereum className="w-8 h-8 text-primary-600" />
            <span className="text-4xl font-bold ml-2">
              {formattedWithdrawableAmount}
            </span>
            <span className="text-xl ml-2">ETH</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <HiArrowDown className="w-8 h-8 text-gray-400 my-4" />
          <div className="flex items-center space-x-2 mb-4">
            <BiWallet className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              Target Wallet Balance: {walletBalance?.formatted || '0.00'} ETH
            </span>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={!withdrawableAmount || isWithdrawing || isPending || !isConnected}
            className={`w-full max-w-sm px-6 py-3 rounded-lg font-medium text-white 
              ${(!withdrawableAmount || isWithdrawing || isPending || !isConnected)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
              } transition-colors`}
          >
            {isWithdrawing || isPending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                處理中...
              </span>
            ) : !isConnected ? (
              'Please Connect Wallet First'
            ) : !withdrawableAmount || formattedWithdrawableAmount === '0.00' ? (
              'No Withdrawable Amount Available'
            ) : (
              'Withdraw to Wallet'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}; 