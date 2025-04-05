// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITokenPriceOracle
 * @dev 定義代幣價格預言機的介面
 */
interface ITokenPriceOracle {
    /**
     * @dev 獲取代幣價格
     * @param token 代幣地址
     * @return 代幣價格（以 USD 為單位，精度為 1e18）
     */
    function getPrice(address token) external view returns (uint256);

    /**
     * @dev 獲取代幣價格和最後更新時間
     * @param token 代幣地址
     * @return price 代幣價格
     * @return lastUpdate 最後更新時間
     */
    function getPriceWithTimestamp(address token) external view returns (uint256 price, uint256 lastUpdate);

    /**
     * @dev 檢查價格是否有效
     * @param token 代幣地址
     * @return 價格是否有效
     */
    function isPriceValid(address token) external view returns (bool);
} 