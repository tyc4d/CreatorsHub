import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../hooks/useWeb3';
import { useContract } from '../hooks/useContract';
import { useNavigate } from 'react-router-dom';

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
  const { donationFactory } = useContract();
  const { account, isConnected } = useWeb3();
  const navigate = useNavigate();
  const [channelImage, setChannelImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  useEffect(() => {
    const checkCreatorStatus = async () => {
      if (!isConnected) {
        setIsChecking(false);
        return;
      }

      if (donationFactory && account) {
        try {
          const isCreatorStatus = await donationFactory.isCreator(account);
          setIsCreator(isCreatorStatus);
          
          if (isCreatorStatus) {
            // 如果已經是創作者，顯示提示訊息並延遲跳轉
            setShowRedirectMessage(true);
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000); // 2秒後跳轉
            return;
          }
        } catch (error) {
          console.error('Error checking creator status:', error);
          setError('檢查創作者狀態時發生錯誤');
        }
      }
      setIsChecking(false);
    };

    checkCreatorStatus();
  }, [donationFactory, account, navigate, isConnected]);

  // 如果正在檢查狀態或未連接錢包，顯示加載中
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // 如果未連接錢包，顯示提示
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">請先連接錢包</h1>
          <p className="text-gray-600 mb-6">連接錢包後即可加入 CreatorsHub 成為創作者</p>
          <button
            onClick={() => window.ethereum?.request({ method: 'eth_requestAccounts' })}
            className="btn-primary"
          >
            連接錢包
          </button>
        </div>
      </div>
    );
  }

  // 如果已經是創作者，顯示提示訊息
  if (showRedirectMessage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
          >
            <h1 className="text-3xl font-bold mb-4 text-primary-600">您已經是創作者</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              正在為您跳轉到收入管理頁面...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationFactory || !account) {
      setError('請先連接錢包');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 先檢查是否已經是創作者
      const isCreatorStatus = await donationFactory.isCreator(account);
      if (isCreatorStatus) {
        setShowRedirectMessage(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        return;
      }

      // 如果不是創作者，則進行註冊
      const tx = await donationFactory.registerCreator(channelImage);
      const receipt = await tx.wait();
      
      // 從事件中獲取新合約地址
      const event = receipt.events?.find(
        (e: any) => e.event === 'DonationContractCreated'
      );
      
      if (event) {
        navigate('/dashboard');
      } else {
        setError('無法獲取合約地址');
      }
    } catch (error: any) {
      console.error('Error registering creator:', error);
      if (error.message?.includes('Creator already registered')) {
        setError('您已經註冊為創作者');
        setShowRedirectMessage(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(error.message || '註冊創作者時發生錯誤');
      }
    } finally {
      setIsLoading(false);
    }
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

          {/* 註冊表單區域 */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4">創作者資訊</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  頻道封面圖片 URL *
                </label>
                <input
                  type="url"
                  name="channelImage"
                  value={channelImage}
                  onChange={(e) => setChannelImage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="請輸入您的頻道封面圖片 URL"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`btn-primary w-full ${
                  isLoading ? 'bg-gray-400 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    處理中...
                  </div>
                ) : (
                  '註冊為創作者'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 