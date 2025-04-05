import { Layout } from './components/layout/Layout';
import { Donate } from './pages/Donate';
import { TransactionHistory } from './pages/TransactionHistory';
import { CreatorGallery } from './pages/CreatorGallery';
import { QRGenerator } from './pages/QRGenerator';
import { Dashboard } from './pages/Dashboard';
import { Withdraw } from './pages/Withdraw';
import { Join } from './pages/Join';
import { WagmiConfig, createConfig, http } from 'wagmi';
import { sepolia, mainnet, optimism, polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
                <Route path="/join" element={<Join />} />
                <Route path="/history" element={<TransactionHistory />} />
                <Route path="/gallery" element={<CreatorGallery />} />
                <Route path="/qr" element={<QRGenerator />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/withdraw" element={<Withdraw />} />
                <Route path="/s/:creatorAddress" element={<Donate />} />
                <Route path="/donate/:creatorAddress" element={<Navigate to="/s/:creatorAddress" replace />} />
              </Routes>
            </Layout>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
