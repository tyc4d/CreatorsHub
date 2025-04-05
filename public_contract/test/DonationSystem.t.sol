// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DonationFactory.sol";
import "../src/DonationContract.sol";
import "../src/CreatorNFT.sol";
import "../src/SupporterNFT.sol";
import "../src/interfaces/ITokenPriceOracle.sol";

/**
 * @title DonationSystemTest
 * @dev 測試整個捐贈系統的功能
 */
contract DonationSystemTest is Test {
    // 事件定義
    event DonationContractCreated(address indexed creator, address contractAddress, string name, string description);
    event DonationReceived(address indexed supporter, uint256 amount, uint256 usdValue, uint256 timestamp);
    event SupporterNFTMinted(address indexed supporter, address indexed creator, uint256 tokenId, uint256 amount);
    event WithdrawalProcessed(address indexed creator, uint256 amount, uint256 timestamp);

    // 合約實例
    DonationFactory public factory;
    DonationContract public donationContractTemplate;
    CreatorNFT public creatorNFT;
    SupporterNFT public supporterNFT;
    
    // 測試賬戶
    address public owner;
    address public creator;
    address public supporter;
    address public priceOracle;
    
    // 測試數據
    string public creatorName = "Test Creator";
    string public creatorDescription = "This is a test creator";
    string public channelImage = "https://example.com/image.jpg";
    
    // 模擬價格預言機
    MockTokenPriceOracle public mockPriceOracle;
    
    // 設置測試環境
    function setUp() public {
        // 設置測試賬戶
        owner = address(this);
        creator = makeAddr("creator");
        supporter = makeAddr("supporter");
        priceOracle = makeAddr("priceOracle");
        
        // 部署模擬價格預言機
        mockPriceOracle = new MockTokenPriceOracle();
        
        // 部署合約模板
        donationContractTemplate = new DonationContract();
        creatorNFT = new CreatorNFT();
        supporterNFT = new SupporterNFT();
        
        // 部署工廠合約
        factory = new DonationFactory(
            address(creatorNFT),
            address(supporterNFT),
            payable(address(donationContractTemplate)),
            address(mockPriceOracle)
        );
        
        // 初始化合約模板
        donationContractTemplate.initialize(creator, address(mockPriceOracle));
        
        // 轉移合約所有權
        creatorNFT.transferOwnership(address(factory));
        supporterNFT.transferOwnership(address(factory));
    }
    
    // 測試創作者註冊
    function testRegisterCreator() public {
        // 模擬創作者註冊
        vm.startPrank(creator);
        address contractAddress = factory.registerCreator(channelImage);
        vm.stopPrank();
        
        // 驗證創作者狀態
        assertTrue(factory.isCreator(creator), "Creator should be registered");
        assertEq(factory.creatorToContract(creator), contractAddress, "Contract address should be set");
        
        // 驗證創作者 NFT
        uint256 tokenId = factory.creatorToNFTId(creator);
        assertTrue(tokenId > 0, "Creator NFT should be minted");
        
        // 驗證創作者資訊
        (string memory image, uint256 joinDate, bool isActive) = factory.getCreatorInfo(creator);
        assertEq(image, channelImage, "Channel image should be set");
        assertTrue(isActive, "Creator should be active");
    }
    
    // 測試捐贈功能
    function testDonation() public {
        // 註冊創作者
        vm.startPrank(creator);
        address contractAddress = factory.registerCreator(channelImage);
        vm.stopPrank();
        
        // 獲取捐贈合約
        DonationContract donationContract = DonationContract(payable(contractAddress));
        
        // 模擬捐贈
        vm.deal(supporter, 1 ether);
        vm.startPrank(supporter);
        donationContract.donate{value: 0.5 ether}();
        vm.stopPrank();
        
        // 驗證捐贈結果
        assertEq(donationContract.getBalance(), 0.5 ether, "Contract balance should be 0.5 ETH");
        assertEq(donationContract.totalDonations(), 0.5 ether, "Total donations should be 0.5 ETH");
        
        // 驗證 USD 價值計算
        uint256 usdValue = donationContract.getDonationUSDValue(0.5 ether);
        assertEq(usdValue, 1000 * 1e18, "USD value should be 1000 USD");
    }
    
    // 測試提款功能
    function testWithdrawal() public {
        // 註冊創作者
        vm.startPrank(creator);
        address contractAddress = factory.registerCreator(channelImage);
        vm.stopPrank();
        
        // 獲取捐贈合約
        DonationContract donationContract = DonationContract(payable(contractAddress));
        
        // 模擬捐贈
        vm.deal(supporter, 1 ether);
        vm.startPrank(supporter);
        donationContract.donate{value: 0.5 ether}();
        vm.stopPrank();
        
        // 記錄創作者初始餘額
        uint256 creatorInitialBalance = creator.balance;
        
        // 模擬提款
        vm.startPrank(creator);
        donationContract.withdraw();
        vm.stopPrank();
        
        // 驗證提款結果
        assertEq(donationContract.getBalance(), 0, "Contract balance should be 0");
        assertEq(creator.balance, creatorInitialBalance + 0.5 ether, "Creator should receive 0.5 ETH");
    }
    
    // 測試支持者 NFT 鑄造
    function testSupporterNFTMinting() public {
        // 註冊創作者
        vm.startPrank(creator);
        address contractAddress = factory.registerCreator(channelImage);
        vm.stopPrank();
        
        // 獲取捐贈合約
        DonationContract donationContract = DonationContract(payable(contractAddress));
        
        // 模擬捐贈
        vm.deal(supporter, 1 ether);
        vm.startPrank(supporter);
        donationContract.donate{value: 0.5 ether}();
        vm.stopPrank();
        
        // 鑄造支持者 NFT
        vm.startPrank(address(factory));
        factory.mintSupporterNFT(supporter, creator, 0.5 ether);
        vm.stopPrank();
        
        // 驗證 NFT 鑄造結果
        uint256 tokenId = supporterNFT.tokenOfOwnerByIndex(supporter, 0);
        assertTrue(tokenId > 0, "Supporter NFT should be minted");
        
        // 驗證 NFT 元數據
        SupporterNFT.SupporterMetadata memory metadata = supporterNFT.getSupporterMetadata(tokenId);
        assertEq(metadata.supporter, supporter, "Supporter address should be set");
        assertEq(metadata.creator, creator, "Creator address should be set");
        assertEq(metadata.amount, 0.5 ether, "Donation amount should be set");
        assertEq(metadata.token, "ETH", "Token should be ETH");
    }
    
    // 測試創作者 NFT 更新
    function testCreatorNFTUpdate() public {
        // 註冊創作者
        vm.startPrank(creator);
        address contractAddress = factory.registerCreator(channelImage);
        vm.stopPrank();
        
        // 獲取創作者 NFT ID
        uint256 tokenId = factory.creatorToNFTId(creator);
        
        // 更新創作者元數據
        vm.startPrank(creator);
        creatorNFT.updateCreatorMetadata(tokenId, "Updated Name", "Updated Description");
        creatorNFT.updateCreatorImage(tokenId, "https://example.com/new-image.jpg");
        vm.stopPrank();
        
        // 驗證更新結果
        CreatorNFT.CreatorMetadata memory metadata = creatorNFT.getCreatorMetadata(tokenId);
        assertEq(metadata.name, "Updated Name", "Name should be updated");
        assertEq(metadata.description, "Updated Description", "Description should be updated");
        assertEq(metadata.image, "https://example.com/new-image.jpg", "Image should be updated");
    }
    
    // 測試創作者等級更新
    function testCreatorTierUpdate() public {
        // 註冊創作者
        vm.startPrank(creator);
        address contractAddress = factory.registerCreator(channelImage);
        vm.stopPrank();
        
        // 獲取創作者 NFT ID
        uint256 tokenId = factory.creatorToNFTId(creator);
        
        // 更新創作者等級
        vm.startPrank(address(factory));
        creatorNFT.updateCreatorTier(tokenId, 5 ether);
        vm.stopPrank();
        
        // 驗證等級更新結果
        CreatorNFT.CreatorMetadata memory metadata = creatorNFT.getCreatorMetadata(tokenId);
        assertEq(metadata.totalDonations, 5 ether, "Total donations should be updated");
        assertEq(metadata.tier, "Bronze", "Tier should be Bronze");
        
        // 更新到銀牌等級
        vm.startPrank(address(factory));
        creatorNFT.updateCreatorTier(tokenId, 15 ether);
        vm.stopPrank();
        
        // 驗證等級更新結果
        metadata = creatorNFT.getCreatorMetadata(tokenId);
        assertEq(metadata.totalDonations, 15 ether, "Total donations should be updated");
        assertEq(metadata.tier, "Silver", "Tier should be Silver");
        
        // 更新到金牌等級
        vm.startPrank(address(factory));
        creatorNFT.updateCreatorTier(tokenId, 60 ether);
        vm.stopPrank();
        
        // 驗證等級更新結果
        metadata = creatorNFT.getCreatorMetadata(tokenId);
        assertEq(metadata.totalDonations, 60 ether, "Total donations should be updated");
        assertEq(metadata.tier, "Gold", "Tier should be Gold");
        
        // 更新到鑽石等級
        vm.startPrank(address(factory));
        creatorNFT.updateCreatorTier(tokenId, 120 ether);
        vm.stopPrank();
        
        // 驗證等級更新結果
        metadata = creatorNFT.getCreatorMetadata(tokenId);
        assertEq(metadata.totalDonations, 120 ether, "Total donations should be updated");
        assertEq(metadata.tier, "Diamond", "Tier should be Diamond");
    }
    
    // 測試事件觸發
    function testEvents() public {
        // 註冊創作者
        vm.startPrank(creator);
        vm.expectEmit(true, true, true, true);
        emit DonationContractCreated(creator, address(0), "", "");
        address contractAddress = factory.registerCreator(channelImage);
        vm.stopPrank();
        
        // 獲取捐贈合約
        DonationContract donationContract = DonationContract(payable(contractAddress));
        
        // 模擬捐贈
        vm.deal(supporter, 1 ether);
        vm.startPrank(supporter);
        vm.expectEmit(true, true, true, true);
        emit DonationReceived(supporter, 0.5 ether, 1000 * 1e18, block.timestamp);
        donationContract.donate{value: 0.5 ether}();
        vm.stopPrank();
        
        // 鑄造支持者 NFT
        vm.startPrank(address(factory));
        vm.expectEmit(true, true, true, true);
        emit SupporterNFTMinted(supporter, creator, 1, 0.5 ether);
        factory.mintSupporterNFT(supporter, creator, 0.5 ether);
        vm.stopPrank();
        
        // 模擬提款
        vm.startPrank(creator);
        vm.expectEmit(true, true, true, true);
        emit WithdrawalProcessed(creator, 0.5 ether, block.timestamp);
        donationContract.withdraw();
        vm.stopPrank();
    }
}

/**
 * @title MockTokenPriceOracle
 * @dev 模擬價格預言機合約
 */
contract MockTokenPriceOracle is ITokenPriceOracle {
    function getPrice(address token) external pure returns (uint256) {
        return 2000 * 1e18; // 固定價格：2000 USD
    }

    function getPriceWithTimestamp(address token) external view returns (uint256 price, uint256 lastUpdate) {
        return (2000 * 1e18, block.timestamp);
    }

    function isPriceValid(address token) external pure returns (bool) {
        return true;
    }
} 