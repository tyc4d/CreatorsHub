// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {CreatorDonation} from "./CreatorDonation.sol";

/**
 * @title 捐贈合約工廠
 * @dev 負責創建和管理創作者捐贈合約
 */
contract DonationFactory is Ownable {
    // 儲存創作者合約地址映射
    mapping(address => address) public creatorToContract;
    
    // 部署事件
    event DonationContractCreated(address indexed creator, address indexed contractAddress);
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    /**
     * @notice 為創作者部署新的捐贈合約
     * @dev 每個創作者只能部署一個合約
     * @return 新部署合約的地址
     */
    function createDonationContract() external returns (address) {
        require(creatorToContract[msg.sender] == address(0), "Creator already has a contract");
        
        CreatorDonation newContract = new CreatorDonation(msg.sender);
        
        creatorToContract[msg.sender] = address(newContract);
        
        emit DonationContractCreated(msg.sender, address(newContract));
        
        return address(newContract);
    }
    
    /**
     * @notice 查詢創作者的合約地址
     * @param creator 創作者地址
     * @return 創作者的捐贈合約地址
     */
    function getCreatorContract(address creator) external view returns (address) {
        return creatorToContract[creator];
    }
    
    /**
     * @notice 檢查地址是否擁有捐贈合約
     * @param creator 創作者地址
     * @return 是否擁有合約
     */
    function hasContract(address creator) external view returns (bool) {
        return creatorToContract[creator] != address(0);
    }
} 