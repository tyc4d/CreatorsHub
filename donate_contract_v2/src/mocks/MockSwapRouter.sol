// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

/**
 * @title 模擬1inch交換路由
 * @dev 用於測試代幣交換功能的模擬合約
 */
contract MockSwapRouter {
    // 模擬交換率 (1代幣換多少ETH，以wei為單位)
    mapping(address => uint256) public exchangeRates;
    
    // 設置交換率事件
    event ExchangeRateSet(address indexed token, uint256 rate);
    
    // 交換事件
    event Swap(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);
    
    /**
     * @notice 設置代幣對ETH的交換率
     * @param token 代幣地址
     * @param rate 交換率 (1代幣可兌換的ETH數量，以wei為單位)
     */
    function setExchangeRate(address token, uint256 rate) external {
        exchangeRates[token] = rate;
        emit ExchangeRateSet(token, rate);
    }
    
    /**
     * @notice 模擬代幣交換
     * @param tokenIn 輸入代幣地址
     * @param tokenOut 輸出代幣地址
     * @param amountIn 輸入代幣數量
     * @return amountOut 輸出ETH數量
     */
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut) {
        require(tokenOut == address(0), "Only support swapping to ETH");
        require(exchangeRates[tokenIn] > 0, "Exchange rate not set");
        
        // 計算輸出ETH數量
        amountOut = (amountIn * exchangeRates[tokenIn]) / 1e18;
        
        // 轉移代幣到合約
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // 發送ETH給用戶
        (bool success, ) = msg.sender.call{value: amountOut}("");
        require(success, "ETH transfer failed");
        
        emit Swap(tokenIn, tokenOut, amountIn, amountOut);
        
        return amountOut;
    }
    
    /**
     * @notice 向合約發送ETH
     */
    receive() external payable {}
} 