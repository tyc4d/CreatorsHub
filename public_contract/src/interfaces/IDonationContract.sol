// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDonationContract
 * @dev 捐贈合約介面
 */
interface IDonationContract {
    /**
     * @dev 初始化捐贈合約
     * @param _creator 創作者地址
     */
    function initialize(address _creator) external;

    /**
     * @dev 接收捐贈
     */
    function donate() external payable;

    /**
     * @dev 提款
     */
    function withdraw() external;

    /**
     * @dev 獲取合約餘額
     * @return 合約餘額
     */
    function getBalance() external view returns (uint256);
} 