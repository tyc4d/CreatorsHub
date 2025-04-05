// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DonationFactory
 * @dev 作為整個系統的入口點，負責創建新的捐贈合約和鑄造創作者 NFT
 */
contract DonationFactory is Ownable {
    using Counters for Counters.Counter;

    // 事件定義
    event DonationContractCreated(address indexed creator, address contractAddress);
    event CreatorNFTMinted(address indexed creator, uint256 tokenId);
    event CreatorRegistered(address indexed creator, string channelImage);

    // 狀態變量
    Counters.Counter private _tokenIds;
    mapping(address => bool) public isCreator;
    mapping(address => address) public creatorToDonationContract;
    mapping(address => uint256) public creatorToNFTId;

    // 創作者資訊結構
    struct CreatorInfo {
        string channelImage;
        uint256 joinDate;
        bool isActive;
    }

    // 創作者資訊映射
    mapping(address => CreatorInfo) public creatorInfo;

    // 捐贈合約介面
    interface IDonationContract {
        function initialize(address _creator) external;
    }

    // 捐贈合約位元組碼
    bytes public donationContractBytecode;

    constructor() Ownable(msg.sender) {}

    /**
     * @dev 設置捐贈合約位元組碼
     * @param _bytecode 捐贈合約的位元組碼
     */
    function setDonationContractBytecode(bytes memory _bytecode) external onlyOwner {
        donationContractBytecode = _bytecode;
    }

    /**
     * @dev 註冊新創作者並部署捐贈合約
     * @param _channelImage 創作者的頻道圖片 URL
     * @return 新部署的捐贈合約地址
     */
    function registerCreator(string memory _channelImage) external returns (address) {
        require(!isCreator[msg.sender], "Creator already registered");
        require(donationContractBytecode.length > 0, "Donation contract bytecode not set");

        // 部署新的捐贈合約
        address newContract = deployDonationContract(msg.sender);
        
        // 更新創作者狀態
        isCreator[msg.sender] = true;
        creatorToDonationContract[msg.sender] = newContract;
        
        // 儲存創作者資訊
        creatorInfo[msg.sender] = CreatorInfo({
            channelImage: _channelImage,
            joinDate: block.timestamp,
            isActive: true
        });

        emit CreatorRegistered(msg.sender, _channelImage);
        emit DonationContractCreated(msg.sender, newContract);

        return newContract;
    }

    /**
     * @dev 部署新的捐贈合約
     * @param _creator 創作者地址
     * @return 新部署的合約地址
     */
    function deployDonationContract(address _creator) internal returns (address) {
        bytes memory bytecode = donationContractBytecode;
        address newContract;
        
        assembly {
            newContract := create(0, add(bytecode, 0x20), mload(bytecode))
        }
        
        require(newContract != address(0), "Contract deployment failed");
        
        // 初始化新合約
        IDonationContract(newContract).initialize(_creator);
        
        return newContract;
    }

    /**
     * @dev 鑄造創作者 NFT
     * @param _creator 創作者地址
     * @return tokenId 鑄造的 NFT ID
     */
    function mintCreatorNFT(address _creator) external onlyOwner returns (uint256) {
        require(isCreator[_creator], "Creator not registered");
        require(creatorToNFTId[_creator] == 0, "NFT already minted");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        creatorToNFTId[_creator] = newTokenId;
        
        emit CreatorNFTMinted(_creator, newTokenId);
        
        return newTokenId;
    }

    /**
     * @dev 獲取創作者的捐贈合約地址
     * @param _creator 創作者地址
     * @return 捐贈合約地址
     */
    function getCreatorDonationContract(address _creator) external view returns (address) {
        return creatorToDonationContract[_creator];
    }

    /**
     * @dev 檢查地址是否為已註冊創作者
     * @param _address 要檢查的地址
     * @return 是否為創作者
     */
    function isRegisteredCreator(address _address) external view returns (bool) {
        return isCreator[_address];
    }

    /**
     * @dev 獲取創作者資訊
     * @param _creator 創作者地址
     * @return channelImage 頻道圖片 URL
     * @return joinDate 加入日期
     * @return isActive 是否活躍
     */
    function getCreatorInfo(address _creator) external view returns (
        string memory channelImage,
        uint256 joinDate,
        bool isActive
    ) {
        CreatorInfo memory info = creatorInfo[_creator];
        return (info.channelImage, info.joinDate, info.isActive);
    }
} 