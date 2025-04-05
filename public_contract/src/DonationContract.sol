// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IDonationContract.sol";

/**
 * @title DonationContract
 * @dev 負責處理具體的捐贈邏輯，包括接收捐贈、管理餘額和處理提款
 */
contract DonationContract is IDonationContract, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    // 事件定義
    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);
    event WithdrawalProcessed(address indexed creator, uint256 amount, uint256 timestamp);
    event WithdrawalRequested(address indexed creator, uint256 amount, uint256 unlockTime);
    event EmergencyWithdrawal(address indexed creator, uint256 amount, uint256 timestamp);

    // 狀態變量
    address public creator;
    uint256 public totalDonations;
    uint256 public withdrawalDelay;
    uint256 public minWithdrawalAmount;
    bool public initialized;

    // 提款請求結構
    struct WithdrawalRequest {
        uint256 amount;
        uint256 requestTime;
        uint256 unlockTime;
        bool executed;
    }

    // 提款請求映射
    mapping(address => WithdrawalRequest) public withdrawalRequests;
    
    // 捐贈記錄結構
    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    // 捐贈記錄
    Donation[] public donations;
    Counters.Counter private _donationIds;

    // 修飾器
    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this function");
        _;
    }

    modifier onlyAfterDelay(uint256 _requestTime) {
        require(block.timestamp >= _requestTime + withdrawalDelay, "Withdrawal delay not met");
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
        withdrawalDelay = 2 days;
        minWithdrawalAmount = 0.01 ether;
        initialized = true;
        
        _transferOwnership(_creator);
    }

    /**
     * @dev 接收捐贈
     */
    function donate() external payable override whenNotPaused nonReentrant {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        // 記錄捐贈
        _donationIds.increment();
        donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        totalDonations += msg.value;
        
        emit DonationReceived(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev 請求提款
     * @param _amount 提款金額
     */
    function requestWithdrawal(uint256 _amount) external onlyCreator whenNotPaused {
        require(_amount >= minWithdrawalAmount, "Amount below minimum withdrawal");
        require(_amount <= address(this).balance, "Insufficient balance");
        require(withdrawalRequests[msg.sender].amount == 0, "Withdrawal already requested");
        
        uint256 unlockTime = block.timestamp + withdrawalDelay;
        
        withdrawalRequests[msg.sender] = WithdrawalRequest({
            amount: _amount,
            requestTime: block.timestamp,
            unlockTime: unlockTime,
            executed: false
        });
        
        emit WithdrawalRequested(msg.sender, _amount, unlockTime);
    }

    /**
     * @dev 執行提款
     */
    function withdraw() external override onlyCreator nonReentrant {
        WithdrawalRequest storage request = withdrawalRequests[msg.sender];
        require(request.amount > 0, "No withdrawal request");
        require(!request.executed, "Withdrawal already executed");
        require(block.timestamp >= request.unlockTime, "Withdrawal delay not met");
        
        uint256 amount = request.amount;
        request.executed = true;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit WithdrawalProcessed(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev 緊急提款（僅限合約擁有者）
     * @param _amount 提款金額
     */
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Emergency withdrawal failed");
        
        emit EmergencyWithdrawal(msg.sender, _amount, block.timestamp);
    }

    /**
     * @dev 暫停合約
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev 恢復合約
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev 設置提款延遲時間
     * @param _delay 新的延遲時間（秒）
     */
    function setWithdrawalDelay(uint256 _delay) external onlyOwner {
        withdrawalDelay = _delay;
    }

    /**
     * @dev 設置最小提款金額
     * @param _amount 新的最小提款金額
     */
    function setMinWithdrawalAmount(uint256 _amount) external onlyOwner {
        minWithdrawalAmount = _amount;
    }

    /**
     * @dev 獲取合約餘額
     * @return 合約餘額
     */
    function getBalance() external view override returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev 獲取捐贈記錄
     * @param _startIndex 起始索引
     * @param _count 記錄數量
     * @return 捐贈記錄數組
     */
    function getDonations(uint256 _startIndex, uint256 _count) external view returns (Donation[] memory) {
        require(_startIndex < donations.length, "Invalid start index");
        
        uint256 endIndex = _startIndex + _count;
        if (endIndex > donations.length) {
            endIndex = donations.length;
        }
        
        uint256 resultCount = endIndex - _startIndex;
        Donation[] memory result = new Donation[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = donations[_startIndex + i];
        }
        
        return result;
    }

    /**
     * @dev 獲取提款請求資訊
     * @param _creator 創作者地址
     * @return amount 提款金額
     * @return requestTime 請求時間
     * @return unlockTime 解鎖時間
     * @return executed 是否已執行
     */
    function getWithdrawalRequest(address _creator) external view returns (
        uint256 amount,
        uint256 requestTime,
        uint256 unlockTime,
        bool executed
    ) {
        WithdrawalRequest memory request = withdrawalRequests[_creator];
        return (request.amount, request.requestTime, request.unlockTime, request.executed);
    }

    /**
     * @dev 接收 ETH
     */
    receive() external payable {
        donate();
    }
} 