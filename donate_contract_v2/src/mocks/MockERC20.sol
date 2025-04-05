// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

/**
 * @title 模擬ERC20代幣
 * @dev 用於測試的簡單ERC20代幣
 */
contract MockERC20 is ERC20 {
    uint8 private _decimals;
    
    /**
     * @dev 構造函數
     * @param name 代幣名稱
     * @param symbol 代幣符號
     * @param decimals_ 代幣小數位
     */
    constructor(string memory name, string memory symbol, uint8 decimals_) ERC20(name, symbol) {
        _decimals = decimals_;
    }
    
    /**
     * @notice 返回代幣小數位
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @notice 鑄造代幣
     * @param to 接收代幣的地址
     * @param amount 代幣數量
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
} 