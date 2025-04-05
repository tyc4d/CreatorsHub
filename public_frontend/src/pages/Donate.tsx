import { useState } from 'react';
import { motion } from 'framer-motion';

export const Donate = () => {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');

  const suggestedAmounts = [
    { value: '0.01', label: '0.01 ETH', tier: '銅牌贊助' },
    { value: '0.05', label: '0.05 ETH', tier: '銀牌贊助' },
    { value: '0.1', label: '0.1 ETH', tier: '金牌贊助' },
  ];

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
                  <span className="text-gray-500">ETH</span>
                </div>
              </div>
            </div>

            {/* 代幣選擇 */}
            <div className="space-y-4">
              <label className="block text-lg font-medium mb-2">選擇代幣</label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="select"
              >
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
              </select>
            </div>

            {/* 捐贈按鈕 */}
            <button className="btn btn-primary w-full text-lg py-4">
              確認贊助
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 