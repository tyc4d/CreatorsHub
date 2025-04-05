import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useAccount, useBalance, useContractRead } from 'wagmi';
import { FaEthereum, FaYoutube } from 'react-icons/fa';
import { HiCurrencyDollar } from 'react-icons/hi';
import { BiWallet } from 'react-icons/bi';

// 模擬數據
const mockDailyData = Array.from({ length: 7 }, (_, i) => ({
  date: format(subDays(new Date(), i), 'MM/dd', { locale: zhTW }),
  amount: Math.floor(Math.random() * 5 + 1),
})).reverse();

const mockSourceData = [
  { name: '以太坊', value: 45, color: '#627EEA' },
  { name: 'YouTube', value: 30, color: '#FF0000' },
  { name: 'Ko-fi', value: 15, color: '#13C3FF' },
  { name: 'Patreon', value: 10, color: '#FF424D' },
];

const timeRanges = [
  { id: 'day', name: '日' },
  { id: 'week', name: '週' },
  { id: 'month', name: '月' },
  { id: 'year', name: '年' },
];

interface CreatorInfo {
  name: string;
  avatar: string;
  youtubeChannel: string;
  contractAddress: string;
}

export const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo>({
    name: '數位創作者',
    avatar: 'https://i.pravatar.cc/150?img=3',
    youtubeChannel: 'UCxxxxxxxxxx',
    contractAddress: '0x1234...5678',
  });

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  // 在實際應用中，這裡會從合約讀取數據
  const totalEarnings = balance?.formatted || '0.00';
  const thisMonthEarnings = '2.5';
  const supporterCount = '42';

  const StatCard = ({ title, value, icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div
          className={`p-3 rounded-full ${color}`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          收入管理面板
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          追蹤和分析您的創作收入
        </p>
      </div>

      {/* 創作者資訊 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8"
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
              錢包地址：{address || '未連接'}
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <FaEthereum className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              贊助合約：{creatorInfo.contractAddress}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="總收入"
          value={`${totalEarnings} ETH`}
          icon={<HiCurrencyDollar className="w-6 h-6 text-white" />}
          color="bg-primary-600"
        />
        <StatCard
          title="本月收入"
          value={`${thisMonthEarnings} ETH`}
          icon={<FaEthereum className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="支持者數量"
          value={supporterCount}
          icon={<BiWallet className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 收入趨勢圖 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">收入趨勢</h3>
            <div className="flex space-x-2">
              {timeRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    timeRange === range.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {range.name}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockDailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" name="收入 (ETH)" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 收入來源分布 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-6">收入來源分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockSourceData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {mockSourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}; 