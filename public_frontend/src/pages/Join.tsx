import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../hooks/useWeb3';
import { useContract } from '../hooks/useContract';
import { useNavigate } from 'react-router-dom';

// Mock NFT data
const MOCK_NFT = {
  name: "CreatorsHub Membership",
  description: "Join CreatorsHub as a creator",
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
            // If already a creator, show message and delay redirect
            setShowRedirectMessage(true);
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000); // Redirect after 2 seconds
            return;
          }
        } catch (error) {
          console.error('Error checking creator status:', error);
          setError('Error checking creator status');
        }
      }
      setIsChecking(false);
    };

    checkCreatorStatus();
  }, [donationFactory, account, navigate, isConnected]);

  // If checking status or wallet not connected, show loading
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If wallet not connected, show prompt
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Please Connect Wallet</h1>
          <p className="text-gray-600 mb-6">Connect your wallet to join CreatorsHub as a creator</p>
          <button
            onClick={() => window.ethereum?.request({ method: 'eth_requestAccounts' })}
            className="btn-primary"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // If already a creator, show redirect message
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
            <h1 className="text-3xl font-bold mb-4 text-primary-600">You Are Already a Creator</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Redirecting to dashboard...
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
      setError('Please connect wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if already a creator
      const isCreatorStatus = await donationFactory.isCreator(account);
      if (isCreatorStatus) {
        setShowRedirectMessage(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        return;
      }

      // If not a creator, proceed with registration
      const tx = await donationFactory.registerCreator(channelImage);
      const receipt = await tx.wait();
      
      // Get new contract address from event
      const event = receipt.events?.find(
        (e: any) => e.event === 'DonationContractCreated'
      );
      
      if (event) {
        navigate('/dashboard');
      } else {
        setError('Unable to get contract address');
      }
    } catch (error: any) {
      console.error('Error registering creator:', error);
      if (error.message?.includes('Creator already registered')) {
        setError('You are already registered as a creator');
        setShowRedirectMessage(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(error.message || 'Error registering as creator');
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
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">Join as Creator</h2>
          <p className="text-gray-600 dark:text-gray-400">Become a creator on CreatorsHub and start your creative journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* NFT Display Area */}
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

          {/* Registration Form Area */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4">Creator Information</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Channel Cover Image URL *
                </label>
                <input
                  type="url"
                  name="channelImage"
                  value={channelImage}
                  onChange={(e) => setChannelImage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your channel cover image URL"
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
                    Processing...
                  </div>
                ) : (
                  'Register as Creator'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 