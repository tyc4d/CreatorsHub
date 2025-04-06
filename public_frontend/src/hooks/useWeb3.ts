import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useWeb3 = () => {
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        try {
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Error checking accounts:', error);
        }
      }
    };

    init();
  }, []);

  const connect = async () => {
    if (!provider) {
      alert('請安裝 MetaMask!');
      return;
    }

    try {
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return {
    account,
    isConnected,
    provider,
    connect
  };
}; 