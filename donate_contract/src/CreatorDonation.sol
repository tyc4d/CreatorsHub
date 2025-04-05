// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title 1inch交換路由接口
 * @dev 用於與1inch協議交互進行代幣交換
 */
interface ISwapRouter {
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut);
}

/**
 * @title 創作者捐贈合約
 * @dev 處理創作者捐贈功能，支持ETH和ERC20代幣，可將代幣轉換為ETH
 */
contract CreatorDonation is Ownable {
    // 1inch路由合約地址
    address public swapRouter;
    
    // 支持的代幣列表
    mapping(address => bool) public supportedTokens;
    
    // 捐贈事件
    event DonationReceived(address indexed donor, address indexed token, uint256 amount, uint256 ethAmount);
    event EthDonationReceived(address indexed donor, uint256 amount);
    event WithdrawFunds(address indexed token, uint256 amount);
    
    /**
     * @dev 構造函數，設置合約所有者為創作者
     * @param creator 創作者地址
     */
    constructor(address creator) Ownable(creator) {
        // 預設支持ETH (地址為0表示ETH)
        supportedTokens[address(0)] = true;
    }
    
    /**
     * @notice 設置1inch路由地址
     * @param _router 1inch路由合約地址
     */
    function setSwapRouter(address _router) external onlyOwner {
        swapRouter = _router;
    }
    
    /**
     * @notice 添加支持的代幣
     * @param tokenAddress 代幣合約地址
     */
    function addSupportedToken(address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "Cannot add ETH as token");
        supportedTokens[tokenAddress] = true;
    }
    
    /**
     * @notice 批量添加支持的代幣
     * @param tokenAddresses 代幣合約地址數組
     */
    function addSupportedTokens(address[] calldata tokenAddresses) external onlyOwner {
        for (uint i = 0; i < tokenAddresses.length; i++) {
            if (tokenAddresses[i] != address(0)) {
                supportedTokens[tokenAddresses[i]] = true;
            }
        }
    }
    
    /**
     * @notice 移除支持的代幣
     * @param tokenAddress 代幣合約地址
     */
    function removeSupportedToken(address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "Cannot remove ETH");
        supportedTokens[tokenAddress] = false;
    }
    
    /**
     * @notice 檢查代幣是否被支持
     * @param tokenAddress 代幣合約地址
     * @return 是否支持
     */
    function isTokenSupported(address tokenAddress) external view returns (bool) {
        return supportedTokens[tokenAddress];
    }
    
    /**
     * @notice 接收ETH捐贈
     */
    receive() external payable {
        emit EthDonationReceived(msg.sender, msg.value);
    }
    
    /**
     * @notice 使用代幣進行捐贈
     * @param token 代幣合約地址
     * @param amount 捐贈金額
     * @param swapToEth 是否轉換為ETH
     */
    function donateToken(address token, uint256 amount, bool swapToEth) external {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than zero");
        
        // 轉移代幣到合約
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        if (swapToEth && swapRouter != address(0)) {
            // 授權1inch路由合約使用代幣
            IERC20(token).approve(swapRouter, amount);
            
            // 調用1inch進行轉換
            uint256 ethReceived = ISwapRouter(swapRouter).swap(token, address(0), amount);
            
            emit DonationReceived(msg.sender, token, amount, ethReceived);
        } else {
            emit DonationReceived(msg.sender, token, amount, 0);
        }
    }
    
    /**
     * @notice 提取ETH
     */
    function withdrawEth() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit WithdrawFunds(address(0), balance);
    }
    
    /**
     * @notice 提取特定代幣
     * @param token 代幣合約地址
     */
    function withdrawToken(address token) external onlyOwner {
        require(token != address(0), "Use withdrawEth for ETH");
        
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        IERC20(token).transfer(owner(), balance);
        
        emit WithdrawFunds(token, balance);
    }
    
    /**
     * @notice 獲取合約ETH餘額
     * @return 合約ETH餘額
     */
    function getEthBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice 獲取合約特定代幣餘額
     * @param token 代幣合約地址
     * @return 合約代幣餘額
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
} 