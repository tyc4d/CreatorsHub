import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaEthereum, FaWallet, FaExchangeAlt, FaGlobe, FaChartLine, FaLock } from 'react-icons/fa';

export const Home = () => {
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: <FaWallet className="w-8 h-8 text-primary-500" />,
      title: "無痛收款",
      description: "只需連接錢包，即可開始接收來自全球的支持者贊助，無需複雜設置。"
    },
    {
      icon: <FaExchangeAlt className="w-8 h-8 text-primary-500" />,
      title: "智能兌換",
      description: "利用 1inch Fusion+ 技術，自動將不同資產以最佳路徑、最低手續費兌換為您想要的資產。"
    },
    {
      icon: <FaGlobe className="w-8 h-8 text-primary-500" />,
      title: "全球支持",
      description: "突破地域限制，接收來自世界各地的贊助，擴大您的支持者基礎。"
    },
    {
      icon: <FaChartLine className="w-8 h-8 text-primary-500" />,
      title: "透明追蹤",
      description: "所有交易記錄公開透明，支持者可以追蹤他們的贊助流向，建立信任關係。"
    },
    {
      icon: <FaLock className="w-8 h-8 text-primary-500" />,
      title: "安全可靠",
      description: "基於區塊鏈技術，確保資金安全，無需信任第三方平台。"
    },
    {
      icon: <FaEthereum className="w-8 h-8 text-primary-500" />,
      title: "低手續費",
      description: "僅需支付網絡 gas 費用，無平台抽成，讓您的收入最大化。"
    }
  ];

  const comparisons = [
    {
      feature: "手續費",
      creatorsHub: "僅需支付網絡 gas 費用",
      others: "平台抽成 5-20% + 支付處理費"
    },
    {
      feature: "收款方式",
      creatorsHub: "支持多種加密貨幣，自動兌換",
      others: "僅支持法定貨幣或特定加密貨幣"
    },
    {
      feature: "資金到賬",
      creatorsHub: "即時到賬，無需等待平台處理",
      others: "通常需要 3-7 個工作日"
    },
    {
      feature: "全球支持",
      creatorsHub: "無地域限制，全球支持者可直接贊助",
      others: "受地域限制，部分國家無法使用"
    },
    {
      feature: "透明度",
      creatorsHub: "所有交易公開透明，可追蹤",
      others: "資金流向不透明，難以追蹤"
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              <span className="gradient-text">CreatorsHub</span>
              <br />
              創作者的 Web3 贊助平台
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              連接錢包，立即開始接收來自全球的支持者贊助。無需複雜設置，無需高額手續費。
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link 
                to="/join" 
                className="px-8 py-4 bg-primary-600 text-white rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                加入創作者
              </Link>
              <Link 
                to="/explore" 
                className="px-8 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
              >
                探索創作者
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">為什麼選擇 CreatorsHub？</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              我們為創作者提供最簡單、最經濟、最全球化的贊助解決方案
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">與傳統平台比較</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              CreatorsHub 提供更低的費用、更快的到賬和更全球化的支持
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-primary-50 dark:bg-primary-900/30">
                  <th className="py-4 px-6 text-left text-gray-900 dark:text-white font-medium">功能</th>
                  <th className="py-4 px-6 text-left text-gray-900 dark:text-white font-medium">CreatorsHub</th>
                  <th className="py-4 px-6 text-left text-gray-900 dark:text-white font-medium">其他平台</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((comparison, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : ''}>
                    <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">{comparison.feature}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{comparison.creatorsHub}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{comparison.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">如何運作</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              只需三個簡單步驟，即可開始接收全球贊助
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">連接錢包</h3>
              <p className="text-gray-600 dark:text-gray-300">使用您的加密錢包登錄平台，無需註冊帳號</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">設置收款偏好</h3>
              <p className="text-gray-600 dark:text-gray-300">選擇您希望接收的資產類型（目前支持 ETH）</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">開始收款</h3>
              <p className="text-gray-600 dark:text-gray-300">分享您的個人頁面，讓支持者直接向您贊助</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-white to-primary-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            準備好開始您的 Web3 贊助之旅了嗎？
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            加入 CreatorsHub，連接您的錢包，立即開始接收來自全球的支持者贊助。
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link 
              to="/join" 
              className="px-8 py-4 bg-primary-600 text-white rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              立即加入
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}; 