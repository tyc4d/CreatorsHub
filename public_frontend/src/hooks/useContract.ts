import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';
import DonationFactoryABI from '../abis/DonationFactory.json';
import DonationContractABI from '../abis/DonationContract.json';

export const useContract = () => {
  const { provider, account } = useWeb3();
  const [donationFactory, setDonationFactory] = useState<ethers.Contract | null>(null);
  const [donationContract, setDonationContract] = useState<ethers.Contract | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const initContract = async () => {
      if (provider && account) {
        const signer = await provider.getSigner();
        const factory = new ethers.Contract(
          import.meta.env.VITE_DONATION_FACTORY_ADDRESS,
          DonationFactoryABI,
          signer
        );
        setDonationFactory(factory);

        // 監聽 DonationContractCreated 事件
        factory.on('DonationContractCreated', (creator, contractAddress, name, description) => {
          setEvents(prev => [...prev, {
            type: 'DonationContractCreated',
            creator,
            contractAddress,
            name,
            description,
            timestamp: Date.now()
          }]);
        });

        // 監聽 CreatorNFTMinted 事件
        factory.on('CreatorNFTMinted', (creator, tokenId, name, description) => {
          setEvents(prev => [...prev, {
            type: 'CreatorNFTMinted',
            creator,
            tokenId,
            name,
            description,
            timestamp: Date.now()
          }]);
        });
      }
    };

    initContract();

    return () => {
      if (donationFactory) {
        donationFactory.removeAllListeners();
      }
      if (donationContract) {
        donationContract.removeAllListeners();
      }
    };
  }, [provider, account]);

  const initDonationContract = async (contractAddress: string) => {
    if (provider && account) {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        DonationContractABI,
        signer
      );
      setDonationContract(contract);

      // 監聽 DonationReceived 事件
      contract.on('DonationReceived', (donor, amount, usdValue, timestamp) => {
        setEvents(prev => [...prev, {
          type: 'DonationReceived',
          donor,
          amount: amount.toString(),
          usdValue: usdValue.toString(),
          timestamp: timestamp.toString(),
          contractAddress
        }]);
      });

      // 監聽 WithdrawalProcessed 事件
      contract.on('WithdrawalProcessed', (creator, amount, timestamp) => {
        setEvents(prev => [...prev, {
          type: 'WithdrawalProcessed',
          creator,
          amount: amount.toString(),
          timestamp: timestamp.toString(),
          contractAddress
        }]);
      });
    }
  };

  return {
    donationFactory,
    donationContract,
    events,
    initDonationContract
  };
}; 