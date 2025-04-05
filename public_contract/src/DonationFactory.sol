// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./interfaces/IDonationContract.sol";
import "./DonationContract.sol";
import "./CreatorNFT.sol";
import "./SupporterNFT.sol";

/**
 * @title DonationFactory
 * @dev 作為整個系統的入口點，負責創建新的捐贈合約和鑄造創作者 NFT
 */
contract DonationFactory is Ownable {
    // 事件定義
    event DonationContractCreated(
        address indexed creator,
        address contractAddress,
        string name,
        string description
    );
    event CreatorNFTMinted(
        address indexed creator,
        uint256 tokenId,
        string name,
        string description
    );
    event SupporterNFTMinted(
        address indexed supporter,
        address indexed creator,
        uint256 tokenId,
        uint256 amount
    );

    // 狀態變量
    mapping(address => bool) public isCreator;
    mapping(address => address) public creatorToContract;
    mapping(address => uint256) public creatorToNFTId;
    CreatorNFT public creatorNFT;
    SupporterNFT public supporterNFT;
    DonationContract public donationContractTemplate;
    address public priceOracle;

    // 創作者資訊結構
    struct CreatorInfo {
        string channelImage;
        uint256 joinDate;
        bool isActive;
    }

    // 創作者資訊映射
    mapping(address => CreatorInfo) public creatorInfo;

    constructor(
        address _creatorNFT,
        address _supporterNFT,
        address payable _donationContractTemplate,
        address _priceOracle
    ) Ownable(msg.sender) {
        require(_creatorNFT != address(0), "Invalid CreatorNFT address");
        require(_supporterNFT != address(0), "Invalid SupporterNFT address");
        require(_donationContractTemplate != address(0), "Invalid DonationContract template address");
        require(_priceOracle != address(0), "Invalid PriceOracle address");
        
        creatorNFT = CreatorNFT(_creatorNFT);
        supporterNFT = SupporterNFT(_supporterNFT);
        donationContractTemplate = DonationContract(payable(_donationContractTemplate));
        priceOracle = _priceOracle;
    }

    /**
     * @dev 註冊新創作者並部署捐贈合約
     * @param _channelImage 創作者的頻道圖片 URL
     * @return 新部署的捐贈合約地址
     */
    function registerCreator(string memory _channelImage) external returns (address) {
        require(!isCreator[msg.sender], "Creator already registered");
        require(bytes(_channelImage).length > 0, "Channel image cannot be empty");

        // 部署新的捐贈合約
        DonationContract newContract = new DonationContract();
        newContract.initialize(msg.sender, address(priceOracle));
        
        // 更新創作者狀態
        isCreator[msg.sender] = true;
        creatorToContract[msg.sender] = address(newContract);
        
        // 儲存創作者資訊
        creatorInfo[msg.sender] = CreatorInfo({
            channelImage: _channelImage,
            joinDate: block.timestamp,
            isActive: true
        });

        // 鑄造創作者 NFT
        uint256 tokenId = creatorNFT.mintCreatorNFT(
            msg.sender,
            "",
            ""
        );
        
        emit DonationContractCreated(
            msg.sender,
            address(newContract),
            "",
            ""
        );
        
        return address(newContract);
    }

    /**
     * @dev 創建新的捐贈合約
     * @param _name 創作者名稱
     * @param _description 創作者描述
     * @return 新創建的捐贈合約地址
     */
    function createDonationContract(
        string memory _name,
        string memory _description
    ) external returns (address) {
        require(!isCreator[msg.sender], "Creator already exists");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        // 部署新的捐贈合約
        DonationContract newContract = new DonationContract();
        newContract.initialize(msg.sender);
        
        // 更新狀態
        creatorToContract[msg.sender] = address(newContract);
        isCreator[msg.sender] = true;
        
        // 鑄造創作者 NFT
        uint256 tokenId = creatorNFT.mintCreatorNFT(
            msg.sender,
            _name,
            _description
        );
        
        emit DonationContractCreated(
            msg.sender,
            address(newContract),
            _name,
            _description
        );
        
        emit CreatorNFTMinted(
            msg.sender,
            tokenId,
            _name,
            _description
        );
        
        return address(newContract);
    }

    /**
     * @dev 鑄造支持者 NFT
     * @param _supporter 支持者地址
     * @param _creator 創作者地址
     * @param _amount 捐贈金額
     */
    function mintSupporterNFT(address _supporter, address _creator, uint256 _amount) external {
        require(msg.sender == creatorToContract[_creator], "Only donation contract can mint");
        
        // 鑄造支持者 NFT
        uint256 tokenId = supporterNFT.mintSupporterNFT(
            _supporter,
            _creator,
            _amount,
            "ETH",
            block.timestamp
        );
        
        emit SupporterNFTMinted(
            _supporter,
            _creator,
            tokenId,
            _amount
        );
    }

    /**
     * @dev 獲取創作者的捐贈合約地址
     * @param _creator 創作者地址
     * @return 捐贈合約地址
     */
    function getCreatorContract(address _creator) external view returns (address) {
        return creatorToContract[_creator];
    }

    /**
     * @dev 檢查地址是否為創作者
     * @param _address 要檢查的地址
     * @return 是否為創作者
     */
    function checkIsCreator(address _address) external view returns (bool) {
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