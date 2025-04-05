// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenPriceOracle
 * @dev 實現代幣價格查詢和更新機制
 */
contract TokenPriceOracle is Ownable {
    // 事件定義
    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);
    event OracleAdded(address indexed oracle, string name);
    event OracleRemoved(address indexed oracle);

    // 結構定義
    struct OracleInfo {
        string name;
        bool isActive;
        uint256 lastUpdateTime;
    }

    // 狀態變量
    mapping(address => OracleInfo) public oracles;
    mapping(address => uint256) public tokenPrices;
    mapping(address => uint256) public lastUpdateTimes;
    
    uint256 public constant PRICE_PRECISION = 1e18;
    uint256 public constant UPDATE_INTERVAL = 1 hours;
    uint256 public constant MIN_VALID_PRICE = 1e6; // 最小有效價格（0.000001 USD）

    constructor() Ownable(msg.sender) {}

    /**
     * @dev 添加新的價格預言機
     * @param _oracle 預言機地址
     * @param _name 預言機名稱
     */
    function addOracle(address _oracle, string memory _name) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        require(!oracles[_oracle].isActive, "Oracle already exists");
        
        oracles[_oracle] = OracleInfo({
            name: _name,
            isActive: true,
            lastUpdateTime: block.timestamp
        });
        
        emit OracleAdded(_oracle, _name);
    }

    /**
     * @dev 移除價格預言機
     * @param _oracle 預言機地址
     */
    function removeOracle(address _oracle) external onlyOwner {
        require(oracles[_oracle].isActive, "Oracle does not exist");
        
        delete oracles[_oracle];
        emit OracleRemoved(_oracle);
    }

    /**
     * @dev 更新代幣價格
     * @param _token 代幣地址
     * @param _price 新價格（以 USD 為單位，精度為 1e18）
     */
    function updatePrice(address _token, uint256 _price) external {
        require(oracles[msg.sender].isActive, "Not authorized");
        require(_price >= MIN_VALID_PRICE, "Price too low");
        
        tokenPrices[_token] = _price;
        lastUpdateTimes[_token] = block.timestamp;
        oracles[msg.sender].lastUpdateTime = block.timestamp;
        
        emit PriceUpdated(_token, _price, block.timestamp);
    }

    /**
     * @dev 獲取代幣價格
     * @param _token 代幣地址
     * @return 代幣價格（以 USD 為單位，精度為 1e18）
     */
    function getPrice(address _token) external view returns (uint256) {
        require(tokenPrices[_token] > 0, "Price not available");
        require(
            block.timestamp - lastUpdateTimes[_token] <= UPDATE_INTERVAL,
            "Price too old"
        );
        
        return tokenPrices[_token];
    }

    /**
     * @dev 獲取代幣價格和最後更新時間
     * @param _token 代幣地址
     * @return price 代幣價格
     * @return lastUpdate 最後更新時間
     */
    function getPriceWithTimestamp(address _token) external view returns (uint256 price, uint256 lastUpdate) {
        price = tokenPrices[_token];
        lastUpdate = lastUpdateTimes[_token];
        require(price > 0, "Price not available");
        require(
            block.timestamp - lastUpdate <= UPDATE_INTERVAL,
            "Price too old"
        );
    }

    /**
     * @dev 檢查價格是否有效
     * @param _token 代幣地址
     * @return 價格是否有效
     */
    function isPriceValid(address _token) external view returns (bool) {
        return tokenPrices[_token] > 0 && 
               block.timestamp - lastUpdateTimes[_token] <= UPDATE_INTERVAL;
    }
} 