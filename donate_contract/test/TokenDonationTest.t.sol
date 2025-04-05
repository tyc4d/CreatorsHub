// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "lib/forge-std/src/Test.sol";
import {DonationFactory} from "../src/DonationFactory.sol";
import {CreatorDonation} from "../src/CreatorDonation.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";
import {MockSwapRouter} from "../src/mocks/MockSwapRouter.sol";

contract TokenDonationTest is Test {
    DonationFactory public factory;
    CreatorDonation public donationContract;
    MockERC20 public mockToken;
    MockSwapRouter public swapRouter;
    
    address deployer = address(1);
    address creator = address(2);
    address donor = address(3);
    
    // 定義常量
    uint256 constant INITIAL_TOKEN_AMOUNT = 1000 * 10**18; // 1000個代幣
    uint256 constant DONATION_AMOUNT = 100 * 10**18;      // 100個代幣
    uint256 constant EXCHANGE_RATE = 0.01 * 10**18;       // 1代幣 = 0.01 ETH
    
    function setUp() public {
        // 部署工廠合約
        vm.startPrank(deployer);
        factory = new DonationFactory(deployer);
        vm.stopPrank();
        
        // 創作者部署捐贈合約
        vm.startPrank(creator);
        address payable donationContractAddr = payable(factory.createDonationContract());
        donationContract = CreatorDonation(donationContractAddr);
        vm.stopPrank();
        
        // 部署模擬代幣
        mockToken = new MockERC20("Mock Token", "MOCK", 18);
        
        // 部署模擬交換路由
        swapRouter = new MockSwapRouter();
        
        // 設置代幣交換率
        swapRouter.setExchangeRate(address(mockToken), EXCHANGE_RATE);
        
        // 向交換路由發送ETH
        vm.deal(address(swapRouter), 100 ether);
        
        // 鑄造代幣給捐贈者
        mockToken.mint(donor, INITIAL_TOKEN_AMOUNT);
        
        // 設置捐贈合約的交換路由
        vm.startPrank(creator);
        donationContract.setSwapRouter(address(swapRouter));
        donationContract.addSupportedToken(address(mockToken));
        vm.stopPrank();
    }
    
    function testTokenDonation() public {
        // 捐贈者授權捐贈合約使用代幣
        vm.startPrank(donor);
        mockToken.approve(address(donationContract), DONATION_AMOUNT);
        
        // 捐贈代幣但不轉換為ETH
        donationContract.donateToken(address(mockToken), DONATION_AMOUNT, false);
        vm.stopPrank();
        
        // 檢查捐贈合約收到代幣
        assertEq(mockToken.balanceOf(address(donationContract)), DONATION_AMOUNT);
        
        // 創作者提取代幣
        vm.startPrank(creator);
        donationContract.withdrawToken(address(mockToken));
        vm.stopPrank();
        
        // 檢查創作者收到代幣
        assertEq(mockToken.balanceOf(creator), DONATION_AMOUNT);
        assertEq(mockToken.balanceOf(address(donationContract)), 0);
    }
    
    function testTokenToEthSwap() public {
        // 捐贈者授權捐贈合約使用代幣
        vm.startPrank(donor);
        mockToken.approve(address(donationContract), DONATION_AMOUNT);
        
        // 捐贈代幣並轉換為ETH
        donationContract.donateToken(address(mockToken), DONATION_AMOUNT, true);
        vm.stopPrank();
        
        // 計算預期收到的ETH數量
        uint256 expectedEth = (DONATION_AMOUNT * EXCHANGE_RATE) / 10**18;
        
        // 檢查捐贈合約收到ETH
        assertEq(address(donationContract).balance, expectedEth);
        
        // 創作者提取ETH
        vm.startPrank(creator);
        uint256 creatorBalanceBefore = creator.balance;
        donationContract.withdrawEth();
        uint256 creatorBalanceAfter = creator.balance;
        vm.stopPrank();
        
        // 檢查創作者收到ETH
        assertEq(creatorBalanceAfter - creatorBalanceBefore, expectedEth);
        assertEq(address(donationContract).balance, 0);
    }
} 