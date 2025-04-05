import { useState } from 'react';
import { motion } from 'framer-motion';
import { SwapModal } from '../components/SwapModal';
import { useAccount } from 'wagmi';

export const Donate = () => {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const { address } = useAccount();

  const handleDonationSuccess = (txHash: string) => {
    console.log('Donation successful:', txHash);
    // 這裡可以添加成功後的處理邏輯，例如顯示成功訊息或重置表單
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          贊助創作者
        </h1>

        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
          <div className="space-y-6">
            {/* 贊助金額輸入 */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                贊助金額 (ETH)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md"
                  placeholder="0.0"
                />
              </div>
            </div>

            {/* 贊助按鈕 */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsSwapModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                使用其他代幣贊助
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                直接使用 ETH 贊助
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Modal */}
      <SwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        onSuccess={handleDonationSuccess}
        targetAmount={donationAmount}
      />
    </div>
  );
}; 