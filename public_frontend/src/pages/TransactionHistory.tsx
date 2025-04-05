import { useState } from 'react';
import { motion } from 'framer-motion';

interface Transaction {
  hash: string;
  timestamp: number;
  amount: string;
  token: string;
  gas: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  from: string;
  to: string;
}

interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  amountRange: {
    min: string;
    max: string;
  };
  token: string;
  status: string;
}

export const TransactionHistory = () => {
  // 篩選狀態
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      start: '',
      end: '',
    },
    amountRange: {
      min: '',
      max: '',
    },
    token: '',
    status: '',
  });

  // 模擬交易數據
  const transactions: Transaction[] = [
    {
      hash: '0x1234...5678',
      timestamp: Date.now() - 3600000,
      amount: '0.1',
      token: 'ETH',
      gas: '0.002',
      status: 'confirmed',
      confirmations: 12,
      from: '0x9876...4321',
      to: '0x5432...8765',
    },
    // 可以添加更多模擬數據
  ];

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl"
    >
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">交易歷史</h2>
          <p className="text-gray-600 dark:text-gray-400">查看和管理您的所有交易記錄</p>
        </div>

        {/* 篩選器 */}
        <div className="card space-y-6">
          <h3 className="text-xl font-semibold mb-4">篩選條件</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 時間範圍 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">時間範圍</label>
              <input
                type="date"
                className="input"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              />
              <input
                type="date"
                className="input"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              />
            </div>

            {/* 金額範圍 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">金額範圍</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="最小值"
                  className="input"
                  value={filters.amountRange.min}
                  onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, min: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="最大值"
                  className="input"
                  value={filters.amountRange.max}
                  onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, max: e.target.value })}
                />
              </div>
            </div>

            {/* 代幣類型 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">代幣類型</label>
              <select
                className="select"
                value={filters.token}
                onChange={(e) => handleFilterChange('token', e.target.value)}
              >
                <option value="">全部</option>
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
              </select>
            </div>

            {/* 交易狀態 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">交易狀態</label>
              <select
                className="select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">全部</option>
                <option value="pending">處理中</option>
                <option value="confirmed">已確認</option>
                <option value="failed">失敗</option>
              </select>
            </div>
          </div>
        </div>

        {/* 交易列表 */}
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.hash} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-gray-500">{tx.hash}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tx.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tx.status === 'confirmed' ? '已確認' :
                       tx.status === 'pending' ? '處理中' : '失敗'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 text-right">
                  <div className="text-lg font-semibold">
                    {tx.amount} {tx.token}
                  </div>
                  <div className="text-sm text-gray-500">
                    Gas: {tx.gas} ETH
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">從：</span>
                    <span className="font-mono">{tx.from}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">至：</span>
                    <span className="font-mono">{tx.to}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}; 