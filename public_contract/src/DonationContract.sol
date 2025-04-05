// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITokenPriceOracle.sol";

/**
 * @title DonationContract
 * @dev 處理捐贈邏輯和餘額管理
 */
contract DonationContract is Ownable {
    // 事件定義
    event DonationReceived(
        address indexed donor,
        uint256 amount,
        uint256 usdValue,
        uint256 timestamp
    );
    event WithdrawalProcessed(
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );
    event PriceUpdated(
        address indexed token,
        uint256 price,
        uint256 timestamp
    );

    // 狀態變量
    address public creator;
    uint256 public totalDonations;
    bool public initialized;
    ITokenPriceOracle public priceOracle;
    address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; // Ethereum mainnet WETH

    constructor() Ownable(msg.sender) {}

    /**
     * @dev 初始化合約
     * @param _creator 創作者地址
     * @param _priceOracle 價格預言機地址
     */
    function initialize(address _creator, address _priceOracle) external onlyOwner {
        require(!initialized, "Already initialized");
        require(_creator != address(0), "Invalid creator address");
        require(_priceOracle != address(0), "Invalid price oracle address");
        
        creator = _creator;
        priceOracle = ITokenPriceOracle(_priceOracle);
        initialized = true;
    }

    /**
     * @dev 接收捐贈
     */
    function donate() public payable {
        require(initialized, "Not initialized");
        require(msg.value > 0, "Amount must be greater than 0");
        
        // 獲取 ETH 價格
        uint256 ethPrice = priceOracle.getPrice(WETH);
        uint256 usdValue = (msg.value * ethPrice) / 1e18;
        
        totalDonations += msg.value;
        
        emit DonationReceived(
            msg.sender,
            msg.value,
            usdValue,
            block.timestamp
        );
    }

    /**
     * @dev 提款
     */
    function withdraw() external {
        require(msg.sender == creator, "Only creator can withdraw");
        require(address(this).balance > 0, "No balance to withdraw");
        
        uint256 amount = address(this).balance;
        (bool success, ) = creator.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit WithdrawalProcessed(
            creator,
            amount,
            block.timestamp
        );
    }

    /**
     * @dev 獲取合約餘額
     * @return 合約餘額（以 wei 為單位）
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev 獲取當前捐贈的 USD 價值
     * @param amount 捐贈金額（以 wei 為單位）
     * @return usdValue USD 價值（以 USD 為單位，精度為 1e18）
     */
    function getDonationUSDValue(uint256 amount) external view returns (uint256) {
        uint256 ethPrice = priceOracle.getPrice(WETH);
        return (amount * ethPrice) / 1e18;
    }

    // 接收 ETH
    receive() external payable {
        donate();
    }
} 