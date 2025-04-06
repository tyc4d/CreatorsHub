import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SwapModal } from '../components/SwapModal';
import { TokenSelector } from '../components/TokenSelector';
import { FaChevronDown, FaEthereum } from 'react-icons/fa';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { useParams } from 'react-router-dom';

interface Token {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI: string;
  tags: string[];
}

// Mock NFT metadata
const MOCK_NFT = {
  name: "CreatorsHub Creator NFT",
  description: "This is an NFT representing CreatorsHub creator identity, holders can receive special benefits on the platform.",
  image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
  attributes: [
    { trait_type: "Level", value: "Gold" },
    { trait_type: "Join Date", value: "2023-06-15" },
    { trait_type: "Total Donation", value: "1.5 ETH" },
    { trait_type: "Supporter Count", value: "42" }
  ]
};

// Mock Supporter NFT metadata
const MOCK_SUPPORTER_NFT = {
  name: "CreatorsHub Supporter NFT",
  description: "This is an NFT representing CreatorsHub supporter identity, holders can receive special benefits on the platform.",
  image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
  attributes: [
    { trait_type: "Level", value: "Supporter" },
    { trait_type: "Donation Date", value: new Date().toLocaleDateString() },
    { trait_type: "Donation Amount", value: "0 ETH" },
    { trait_type: "Supported Creator", value: "Not Specified" }
  ]
};

const NETWORKS = [
  { chainId: 1, name: 'Ethereum', iconSymbol: 'ETH', shortName: 'ETH' },
  { chainId: 10, name: 'Optimism', iconSymbol: 'OP', shortName: 'OP' },
  { chainId: 42161, name: 'Arbitrum', iconSymbol: 'ARB', shortName: 'ARB' },
  { chainId: 56, name: 'BNB Chain', iconSymbol: 'BNB', shortName: 'BSC' },
  { chainId: 137, name: 'Polygon', iconSymbol: 'MATIC', shortName: 'MATIC' },
  { chainId: 43114, name: 'Avalanche', iconSymbol: 'AVAX', shortName: 'AVAX' },
];

export const Donate = () => {
  const { creatorAddress } = useParams<{ creatorAddress: string }>();
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [usdValue, setUsdValue] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<{ name: string; bio: string } | null>(null);
  const [nftMetadata, setNftMetadata] = useState<any>(null);
  const [supporterNftMetadata, setSupporterNftMetadata] = useState<any>(null);
  const [isLoadingNft, setIsLoadingNft] = useState(false);
  const [isLoadingSupporterNft, setIsLoadingSupporterNft] = useState(false);
  const [showSupporterNft, setShowSupporterNft] = useState(false);

  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
    token: selectedToken?.address as `0x${string}`,
    chainId: selectedToken?.chainId,
    watch: true,
  });

  // Get creator information
  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (!creatorAddress) return;
      
      try {
        // Here should fetch creator info from API
        // Currently using mock data
        setCreatorInfo({
          name: `Creator ${creatorAddress.slice(0, 6)}...${creatorAddress.slice(-4)}`,
          bio: 'This is an excellent creator, support their creation!'
        });
      } catch (error) {
        console.error('Error fetching creator info:', error);
      }
    };

    fetchCreatorInfo();
  }, [creatorAddress]);

  // Get NFT metadata
  useEffect(() => {
    const fetchNftMetadata = async () => {
      if (!creatorAddress) return;
      
      setIsLoadingNft(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Here should fetch NFT metadata from API
        // Currently using mock data
        setNftMetadata(MOCK_NFT);
      } catch (error) {
        console.error('Error fetching NFT metadata:', error);
      } finally {
        setIsLoadingNft(false);
      }
    };

    fetchNftMetadata();
  }, [creatorAddress]);

  // Get token USD price
  useEffect(() => {
    const fetchTokenPrice = async () => {
      if (!selectedToken) return;
      setIsLoadingBalance(true);
      
      try {
        const response = await fetch('https://1inch-vercel-proxy-pi.vercel.app/price/v1.1/' + selectedToken.chainId, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            tokens: [selectedToken.address],
            currency: 'USD'
          })
        });

        const data = await response.json();
        if (data[selectedToken.address]) {
          setUsdValue(data[selectedToken.address]);
        } else {
          setUsdValue('0');
        }
      } catch (error) {
        console.error('Error fetching token price:', error);
        setUsdValue('0');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchTokenPrice();
  }, [selectedToken]);

  // Update balance display
  useEffect(() => {
    if (balance) {
      setTokenBalance(formatUnits(balance.value, balance.decimals));
    }
  }, [balance]);

  // Update supporter NFT metadata
  useEffect(() => {
    if (amount && selectedToken && creatorInfo) {
      setIsLoadingSupporterNft(true);
      
      // Simulate API delay
      setTimeout(() => {
        const updatedNft = {
          ...MOCK_SUPPORTER_NFT,
          attributes: [
            { trait_type: "Level", value: getSupporterTier(parseFloat(amount)) },
            { trait_type: "Donation Date", value: new Date().toLocaleDateString() },
            { trait_type: "Donation Amount", value: `${amount} ${selectedToken.symbol}` },
            { trait_type: "Supported Creator", value: creatorInfo.name }
          ]
        };
        
        setSupporterNftMetadata(updatedNft);
        setIsLoadingSupporterNft(false);
      }, 1000);
    }
  }, [amount, selectedToken, creatorInfo]);

  // Get supporter tier based on donation amount
  const getSupporterTier = (amount: number) => {
    if (amount >= 0.1) return "Diamond Supporter";
    if (amount >= 0.05) return "Gold Supporter";
    if (amount >= 0.01) return "Silver Supporter";
    return "Bronze Supporter";
  };

  const suggestedAmounts = [
    { value: '0.01', label: '0.01 ETH', tier: 'Bronze Donation' },
    { value: '0.05', label: '0.05 ETH', tier: 'Silver Donation' },
    { value: '0.1', label: '0.1 ETH', tier: 'Gold Donation' },
  ];

  const handleDonateClick = () => {
    if (!amount) {
      alert('Please enter donation amount');
      return;
    }
    if (!selectedToken?.chainId) {
      alert('Please select token');
      return;
    }
    setIsSwapModalOpen(true);
  };

  const handleSwapConfirm = () => {
    setIsSwapModalOpen(false);
    // Process donation confirmation logic
  };

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setIsTokenSelectorOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          {creatorAddress ? `Donate to ${creatorInfo?.name || 'Creator'}` : 'Donate to Creator'}
        </h1>
        {creatorInfo && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {creatorInfo.bio}
          </p>
        )}
        {creatorAddress && (
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Creator Address: {creatorAddress}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* NFT Display Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">NFT Preview</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowSupporterNft(false)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    !showSupporterNft
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Creator NFT
                </button>
                <button
                  onClick={() => setShowSupporterNft(true)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    showSupporterNft
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Supporter NFT
                </button>
              </div>
            </div>
            
            {!showSupporterNft ? (
              isLoadingNft ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading NFT data...</p>
                </div>
              ) : nftMetadata ? (
                <div className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img 
                      src={nftMetadata.image} 
                      alt={nftMetadata.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold">{nftMetadata.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{nftMetadata.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {nftMetadata.attributes.map((attr: any, index: number) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{attr.trait_type}</p>
                        <p className="font-medium">{attr.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">Unable to load NFT data</p>
                </div>
              )
            ) : (
              isLoadingSupporterNft ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading Supporter NFT data...</p>
                </div>
              ) : supporterNftMetadata ? (
                <div className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img 
                      src={supporterNftMetadata.image} 
                      alt={supporterNftMetadata.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold">{supporterNftMetadata.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{supporterNftMetadata.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {supporterNftMetadata.attributes.map((attr: any, index: number) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{attr.trait_type}</p>
                        <p className="font-medium">{attr.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">Please enter donation amount to preview your NFT</p>
                </div>
              )
            )}
          </div>
        </motion.div>

        {/* Donation Form Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-6">Donation Form</h2>
          
          <div className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Donation Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">{selectedToken?.symbol || 'ETH'}</span>
                </div>
              </div>
              
              {/* Quick Amount Selection */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {suggestedAmounts.map((suggestion) => (
                  <button
                    key={suggestion.value}
                    onClick={() => setAmount(suggestion.value)}
                    className={`py-2 text-sm rounded-lg border ${
                      amount === suggestion.value
                        ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:border-primary-500 dark:text-primary-400'
                        : 'border-gray-200 hover:border-primary-200 dark:border-gray-700'
                    }`}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Token Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Token</label>
              <button
                onClick={() => setIsTokenSelectorOpen(true)}
                className="w-full px-4 py-3 border rounded-lg flex items-center justify-between hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <div className="flex items-center">
                  {selectedToken ? (
                    <>
                      <img
                        src={selectedToken.logoURI}
                        alt={selectedToken.symbol}
                        className="w-6 h-6 mr-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/24?text=' + selectedToken.symbol.substring(0, 2);
                        }}
                      />
                      <span>{selectedToken.symbol}</span>
                    </>
                  ) : (
                    <>
                      <FaEthereum className="w-6 h-6 mr-2 text-primary-500" />
                      <span>ETH</span>
                    </>
                  )}
                </div>
                <FaChevronDown className="text-gray-400" />
              </button>
              
              {/* Balance Display */}
              {selectedToken && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
                  <span>Balance: {isLoadingBalance ? 'Loading...' : `${tokenBalance} ${selectedToken.symbol}`}</span>
                  <span>≈ ${isLoadingBalance ? 'Loading...' : (parseFloat(tokenBalance) * parseFloat(usdValue)).toFixed(2)} USD</span>
                </div>
              )}
            </div>
            
            {/* Donate Button */}
            <button
              onClick={handleDonateClick}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Donate
            </button>
          </div>
        </motion.div>
      </div>

      {/* Swap Modal */}
      {isSwapModalOpen && (
        <SwapModal
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          onConfirm={handleSwapConfirm}
          sourceToken={selectedToken!}
          sourceAmount={amount}
          creatorAddress={creatorAddress}
        />
      )}

      {/* Token Selector */}
      <TokenSelector
        isOpen={isTokenSelectorOpen}
        onClose={() => setIsTokenSelectorOpen(false)}
        onSelect={handleTokenSelect}
        selectedToken={selectedToken}
      />
    </div>
  );
}; 