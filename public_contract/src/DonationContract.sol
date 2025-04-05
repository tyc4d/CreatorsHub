// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDonationContract.sol";

/**
 * @title DonationContract
 * @dev 負責處理具體的捐贈邏輯，包括接收捐贈和處理提款
 */
contract DonationContract is IDonationContract, Ownable {
    // 事件定義
    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);
    event WithdrawalProcessed(address indexed creator, uint256 amount, uint256 timestamp);

    // 狀態變量
    address public creator;
    uint256 public totalDonations;
    bool public initialized;

    // 修飾器
    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this function");
        _;
    }

    /**
     * @dev 初始化合約
     * @param _creator 創作者地址
     */
    function initialize(address _creator) external override {
        require(!initialized, "Contract already initialized");
        require(_creator != address(0), "Invalid creator address");
        
        creator = _creator;
        initialized = true;
        
        _transferOwnership(_creator);
    }

    /**
     * @dev 接收捐贈
     */
    function donate() external payable override {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        totalDonations += msg.value;
        
        emit DonationReceived(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev 提款
     */
    function withdraw() external override onlyCreator {
        uint256 amount = address(this).balance;
        require(amount > 0, "No balance to withdraw");
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit WithdrawalProcessed(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev 獲取合約餘額
     * @return 合約餘額
     */
    function getBalance() external view override returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev 接收 ETH
     */
    receive() external payable {
        donate();
    }
} 