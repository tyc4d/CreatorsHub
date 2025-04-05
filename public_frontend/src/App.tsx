import { Layout } from './components/layout/Layout';
import { Donate } from './pages/Donate';
import { TransactionHistory } from './pages/TransactionHistory';
import { WagmiConfig, createConfig, http } from 'wagmi';
import { sepolia, mainnet, optimism, polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: 'CreatorsHub',
  projectId: 'YOUR_PROJECT_ID', // 需要從 WalletConnect 獲取
  chains: [sepolia, mainnet, optimism, polygon],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Donate />} />
                <Route path="/history" element={<TransactionHistory />} />
              </Routes>
            </Layout>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
