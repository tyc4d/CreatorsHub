import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORKS } from '../config/contracts';
import DonationFactoryABI from '../abis/DonationFactory.json';
import DonationContractABI from '../abis/DonationContract.json';
import CreatorNFTABI from '../abis/CreatorNFT.json';
import SupporterNFTABI from '../abis/SupporterNFT.json';
import TokenPriceOracleABI from '../abis/ITokenPriceOracle.json';

// 合約服務類
export class ContractService {
  private provider: ethers.BrowserProvider;
  private signer: ethers.JsonRpcSigner | null = null;
  private network: keyof typeof NETWORKS = 'mainnet';
  private factoryContract: ethers.Contract | null = null;
  private creatorNFTContract: ethers.Contract | null = null;
  private supporterNFTContract: ethers.Contract | null = null;
  private priceOracleContract: ethers.Contract | null = null;

  constructor() {
    // 初始化 Web3 提供者
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      throw new Error('Web3 provider not found');
    }
  }

  // 初始化合約
  async init() {
    try {
      // 獲取網絡
      const network = await this.provider.getNetwork();
      this.network = this.getNetworkByChainId(Number(network.chainId));
      
      // 獲取簽名者
      this.signer = await this.provider.getSigner();
      
      // 初始化合約
      this.initContracts();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      return false;
    }
  }

  // 根據鏈 ID 獲取網絡
  private getNetworkByChainId(chainId: number): keyof typeof NETWORKS {
    switch (chainId) {
      case 1:
        return 'mainnet';
      case 5:
        return 'testnet';
      case 31337:
        return 'localhost';
      default:
        return 'mainnet';
    }
  }

  // 初始化合約
  private initContracts() {
    const addresses = CONTRACT_ADDRESSES[this.network];
    
    // 初始化工廠合約
    if (addresses.factory) {
      this.factoryContract = new ethers.Contract(
        addresses.factory,
        DonationFactoryABI,
        this.signer || this.provider
      );
    }
    
    // 初始化創作者 NFT 合約
    if (addresses.creatorNFT) {
      this.creatorNFTContract = new ethers.Contract(
        addresses.creatorNFT,
        CreatorNFTABI,
        this.signer || this.provider
      );
    }
    
    // 初始化支持者 NFT 合約
    if (addresses.supporterNFT) {
      this.supporterNFTContract = new ethers.Contract(
        addresses.supporterNFT,
        SupporterNFTABI,
        this.signer || this.provider
      );
    }
    
    // 初始化價格預言機合約
    if (addresses.priceOracle) {
      this.priceOracleContract = new ethers.Contract(
        addresses.priceOracle,
        TokenPriceOracleABI,
        this.signer || this.provider
      );
    }
  }

  // 獲取當前網絡
  getCurrentNetwork() {
    return this.network;
  }

  // 獲取當前網絡配置
  getNetworkConfig() {
    return NETWORKS[this.network];
  }

  // 獲取當前合約地址
  getContractAddresses() {
    return CONTRACT_ADDRESSES[this.network];
  }

  // 切換網絡
  async switchNetwork(network: keyof typeof NETWORKS) {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${NETWORKS[network].chainId.toString(16)}` }],
        });
        
        this.network = network;
        this.initContracts();
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to switch network:', error);
      return false;
    }
  }

  // 工廠合約方法
  async createDonationContract(name: string, description: string) {
    if (!this.factoryContract || !this.signer) {
      throw new Error('Factory contract or signer not initialized');
    }
    
    try {
      const tx = await this.factoryContract.createDonationContract(name, description);
      const receipt = await tx.wait();
      
      // 從事件中獲取新合約地址
      const event = receipt.events?.find(
        (e: any) => e.event === 'DonationContractCreated'
      );
      
      if (event) {
        return {
          success: true,
          contractAddress: event.args.contractAddress,
          transactionHash: receipt.transactionHash,
        };
      }
      
      return {
        success: false,
        error: 'Failed to get contract address from event',
      };
    } catch (error) {
      console.error('Failed to create donation contract:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async registerCreator(channelImage: string) {
    if (!this.factoryContract || !this.signer) {
      throw new Error('Factory contract or signer not initialized');
    }
    
    try {
      const tx = await this.factoryContract.registerCreator(channelImage);
      const receipt = await tx.wait();
      
      // 從事件中獲取新合約地址
      const event = receipt.events?.find(
        (e: any) => e.event === 'DonationContractCreated'
      );
      
      if (event) {
        return {
          success: true,
          contractAddress: event.args.contractAddress,
          transactionHash: receipt.transactionHash,
        };
      }
      
      return {
        success: false,
        error: 'Failed to get contract address from event',
      };
    } catch (error) {
      console.error('Failed to register creator:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getCreatorContract(creatorAddress: string) {
    if (!this.factoryContract) {
      throw new Error('Factory contract not initialized');
    }
    
    try {
      const contractAddress = await this.factoryContract.getCreatorContract(creatorAddress);
      return {
        success: true,
        contractAddress,
      };
    } catch (error) {
      console.error('Failed to get creator contract:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkIsCreator(address: string) {
    if (!this.factoryContract) {
      throw new Error('Factory contract not initialized');
    }
    
    try {
      const isCreator = await this.factoryContract.checkIsCreator(address);
      return {
        success: true,
        isCreator,
      };
    } catch (error) {
      console.error('Failed to check if address is creator:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getCreatorInfo(creatorAddress: string) {
    if (!this.factoryContract) {
      throw new Error('Factory contract not initialized');
    }
    
    try {
      const info = await this.factoryContract.getCreatorInfo(creatorAddress);
      return {
        success: true,
        channelImage: info.channelImage,
        joinDate: info.joinDate.toString(),
        isActive: info.isActive,
      };
    } catch (error) {
      console.error('Failed to get creator info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 捐贈合約方法
  async getDonationContract(contractAddress: string) {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }
    
    return new ethers.Contract(
      contractAddress,
      DonationContractABI,
      this.signer
    );
  }

  async donate(contractAddress: string, amount: string) {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }
    
    try {
      const contract = await this.getDonationContract(contractAddress);
      const tx = await contract.donate({
        value: ethers.parseEther(amount),
      });
      
      const receipt = await tx.wait();
      
      // 從事件中獲取捐贈信息
      const event = receipt.events?.find(
        (e: any) => e.event === 'DonationReceived'
      );
      
      if (event) {
        return {
          success: true,
          donor: event.args.donor,
          amount: event.args.amount.toString(),
          usdValue: event.args.usdValue.toString(),
          timestamp: event.args.timestamp.toString(),
          transactionHash: receipt.transactionHash,
        };
      }
      
      return {
        success: false,
        error: 'Failed to get donation info from event',
      };
    } catch (error) {
      console.error('Failed to donate:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async withdraw(contractAddress: string) {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }
    
    try {
      const contract = await this.getDonationContract(contractAddress);
      const tx = await contract.withdraw();
      
      const receipt = await tx.wait();
      
      // 從事件中獲取提款信息
      const event = receipt.events?.find(
        (e: any) => e.event === 'WithdrawalProcessed'
      );
      
      if (event) {
        return {
          success: true,
          creator: event.args.creator,
          amount: event.args.amount.toString(),
          timestamp: event.args.timestamp.toString(),
          transactionHash: receipt.transactionHash,
        };
      }
      
      return {
        success: false,
        error: 'Failed to get withdrawal info from event',
      };
    } catch (error) {
      console.error('Failed to withdraw:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getBalance(contractAddress: string) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    try {
      const contract = new ethers.Contract(
        contractAddress,
        DonationContractABI,
        this.provider
      );
      
      const balance = await contract.getBalance();
      return {
        success: true,
        balance: balance.toString(),
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getDonationUSDValue(contractAddress: string, amount: string) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    try {
      const contract = new ethers.Contract(
        contractAddress,
        DonationContractABI,
        this.provider
      );
      
      const usdValue = await contract.getDonationUSDValue(
        ethers.parseEther(amount)
      );
      
      return {
        success: true,
        usdValue: usdValue.toString(),
      };
    } catch (error) {
      console.error('Failed to get donation USD value:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 創作者 NFT 方法
  async getCreatorNFT(tokenId: string) {
    if (!this.creatorNFTContract) {
      throw new Error('Creator NFT contract not initialized');
    }
    
    try {
      const metadata = await this.creatorNFTContract.getCreatorMetadata(tokenId);
      const tokenURI = await this.creatorNFTContract.tokenURI(tokenId);
      
      return {
        success: true,
        metadata: {
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          channelImage: metadata.channelImage,
          joinDate: metadata.joinDate.toString(),
          totalDonations: metadata.totalDonations.toString(),
          supporterCount: metadata.supporterCount.toString(),
          tier: metadata.tier,
        },
        tokenURI,
      };
    } catch (error) {
      console.error('Failed to get creator NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getCreatorTokenId(creatorAddress: string) {
    if (!this.creatorNFTContract) {
      throw new Error('Creator NFT contract not initialized');
    }
    
    try {
      const tokenId = await this.creatorNFTContract.getCreatorTokenId(creatorAddress);
      return {
        success: true,
        tokenId: tokenId.toString(),
      };
    } catch (error) {
      console.error('Failed to get creator token ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 支持者 NFT 方法
  async getSupporterNFT(tokenId: string) {
    if (!this.supporterNFTContract) {
      throw new Error('Supporter NFT contract not initialized');
    }
    
    try {
      const metadata = await this.supporterNFTContract.getSupporterMetadata(tokenId);
      
      return {
        success: true,
        metadata: {
          supporter: metadata.supporter,
          creator: metadata.creator,
          amount: metadata.amount.toString(),
          token: metadata.token,
          timestamp: metadata.timestamp.toString(),
        },
      };
    } catch (error) {
      console.error('Failed to get supporter NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getSupporterTokenId(supporterAddress: string, creatorAddress: string) {
    if (!this.supporterNFTContract) {
      throw new Error('Supporter NFT contract not initialized');
    }
    
    try {
      const tokenId = await this.supporterNFTContract.getSupporterTokenId(
        supporterAddress,
        creatorAddress
      );
      
      return {
        success: true,
        tokenId: tokenId.toString(),
      };
    } catch (error) {
      console.error('Failed to get supporter token ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getSupporterNFTs(supporterAddress: string) {
    if (!this.supporterNFTContract) {
      throw new Error('Supporter NFT contract not initialized');
    }
    
    try {
      const balance = await this.supporterNFTContract.balanceOf(supporterAddress);
      const tokenIds = [];
      
      for (let i = 0; i < balance.toNumber(); i++) {
        const tokenId = await this.supporterNFTContract.tokenOfOwnerByIndex(
          supporterAddress,
          i
        );
        tokenIds.push(tokenId.toString());
      }
      
      return {
        success: true,
        tokenIds,
      };
    } catch (error) {
      console.error('Failed to get supporter NFTs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 價格預言機方法
  async getTokenPrice(tokenAddress: string) {
    if (!this.priceOracleContract) {
      throw new Error('Price oracle contract not initialized');
    }
    
    try {
      const price = await this.priceOracleContract.getPrice(tokenAddress);
      return {
        success: true,
        price: price.toString(),
      };
    } catch (error) {
      console.error('Failed to get token price:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getTokenPriceWithTimestamp(tokenAddress: string) {
    if (!this.priceOracleContract) {
      throw new Error('Price oracle contract not initialized');
    }
    
    try {
      const [price, lastUpdate] = await this.priceOracleContract.getPriceWithTimestamp(
        tokenAddress
      );
      
      return {
        success: true,
        price: price.toString(),
        lastUpdate: lastUpdate.toString(),
      };
    } catch (error) {
      console.error('Failed to get token price with timestamp:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async isPriceValid(tokenAddress: string) {
    if (!this.priceOracleContract) {
      throw new Error('Price oracle contract not initialized');
    }
    
    try {
      const isValid = await this.priceOracleContract.isPriceValid(tokenAddress);
      return {
        success: true,
        isValid,
      };
    } catch (error) {
      console.error('Failed to check if price is valid:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// 創建合約服務實例
export const contractService = new ContractService(); 