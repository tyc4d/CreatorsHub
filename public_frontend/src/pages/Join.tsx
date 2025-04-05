import { useState } from 'react';
import { motion } from 'framer-motion';

// 模擬 NFT 數據
const MOCK_NFT = {
  name: "CreatorsHub Membership",
  description: "加入 CreatorsHub 成為創作者",
  image: "https://placehold.co/400x400/png",
  attributes: [
    { trait_type: "Level", value: "Creator" },
    { trait_type: "Benefits", value: "Premium" }
  ]
};

export const Join = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    setIsLoading(true);
    // 模擬加入過程
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    alert('成功加入 CreatorsHub！');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl"
    >
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">加入創作者</h2>
          <p className="text-gray-600 dark:text-gray-400">成為 CreatorsHub 的創作者，開啟您的創作之旅</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* NFT 顯示區域 */}
          <div className="card p-6">
            <div className="aspect-square rounded-lg overflow-hidden mb-4">
              <img
                src={MOCK_NFT.image}
                alt={MOCK_NFT.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">{MOCK_NFT.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{MOCK_NFT.description}</p>
            <div className="space-y-2">
              {MOCK_NFT.attributes.map((attr, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-500">{attr.trait_type}:</span>
                  <span className="font-medium">{attr.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 加入按鈕區域 */}
          <div className="card p-6 flex flex-col justify-center items-center">
            <h3 className="text-xl font-semibold mb-4">立即加入</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              成為 CreatorsHub 的創作者，享受以下權益：
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <span className="text-primary-500 mr-2">✓</span>
                獲得創作者 NFT
              </li>
              <li className="flex items-center">
                <span className="text-primary-500 mr-2">✓</span>
                優先展示作品
              </li>
              <li className="flex items-center">
                <span className="text-primary-500 mr-2">✓</span>
                去中心化贊助收款平台
              </li>
            </ul>
            <button
              onClick={handleJoin}
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  處理中...
                </div>
              ) : (
                '加入 CreatorsHub'
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 