// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CreatorNFT
 * @dev 實現創作者身份認證和權益管理
 */
contract CreatorNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    // 事件定義
    event CreatorNFTMinted(address indexed creator, uint256 tokenId, string channelImage);
    event CreatorMetadataUpdated(uint256 indexed tokenId, uint256 totalDonations, uint256 supporterCount);

    // 狀態變量
    Counters.Counter private _tokenIds;
    mapping(uint256 => CreatorMetadata) private _creatorMetadata;
    mapping(address => uint256) public creatorToTokenId;

    // 創作者資訊結構
    struct CreatorMetadata {
        string name;          // "CreatorsHub 創作者 NFT"
        string description;   // 創作者描述
        string image;         // IPFS 上的創作者頭像
        string channelImage;  // 創作者頻道圖片
        uint256 joinDate;     // 加入時間戳
        uint256 totalDonations; // 總贊助額（以 wei 為單位）
        uint256 supporterCount; // 支持者總數
        string tier;          // 創作者等級（銅牌/銀牌/金牌/鑽石）
    }

    constructor() ERC721("CreatorsHub Creator NFT", "CCNFT") Ownable(msg.sender) {}

    /**
     * @dev 鑄造創作者 NFT
     * @param _creator 創作者地址
     * @param _channelImage 創作者頻道圖片 URL
     * @return tokenId 鑄造的 NFT ID
     */
    function mintCreatorNFT(address _creator, string memory _channelImage) external onlyOwner returns (uint256) {
        require(creatorToTokenId[_creator] == 0, "Creator already has NFT");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // 創建創作者元數據
        _creatorMetadata[newTokenId] = CreatorMetadata({
            name: "CreatorsHub 創作者 NFT",
            description: "這是一個代表 CreatorsHub 創作者身份的 NFT",
            image: "",  // 將由創作者稍後設置
            channelImage: _channelImage,
            joinDate: block.timestamp,
            totalDonations: 0,
            supporterCount: 0,
            tier: "銅牌"
        });
        
        // 鑄造 NFT
        _safeMint(_creator, newTokenId);
        creatorToTokenId[_creator] = newTokenId;
        
        emit CreatorNFTMinted(_creator, newTokenId, _channelImage);
        
        return newTokenId;
    }

    /**
     * @dev 更新創作者元數據
     * @param _tokenId NFT ID
     * @param _totalDonations 總贊助額
     * @param _supporterCount 支持者數量
     */
    function updateCreatorMetadata(
        uint256 _tokenId,
        uint256 _totalDonations,
        uint256 _supporterCount
    ) external onlyOwner {
        require(_exists(_tokenId), "NFT does not exist");
        
        CreatorMetadata storage metadata = _creatorMetadata[_tokenId];
        metadata.totalDonations = _totalDonations;
        metadata.supporterCount = _supporterCount;
        
        // 更新創作者等級
        metadata.tier = calculateTier(_totalDonations);
        
        emit CreatorMetadataUpdated(_tokenId, _totalDonations, _supporterCount);
    }

    /**
     * @dev 更新創作者頭像
     * @param _tokenId NFT ID
     * @param _image 新的頭像 URL
     */
    function updateCreatorImage(uint256 _tokenId, string memory _image) external {
        require(_exists(_tokenId), "NFT does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        
        _creatorMetadata[_tokenId].image = _image;
    }

    /**
     * @dev 計算創作者等級
     * @param _totalDonations 總贊助額
     * @return 創作者等級
     */
    function calculateTier(uint256 _totalDonations) public pure returns (string memory) {
        if (_totalDonations >= 100 ether) return "鑽石";
        if (_totalDonations >= 50 ether) return "金牌";
        if (_totalDonations >= 10 ether) return "銀牌";
        return "銅牌";
    }

    /**
     * @dev 獲取創作者元數據
     * @param _tokenId NFT ID
     * @return 創作者元數據
     */
    function getCreatorMetadata(uint256 _tokenId) external view returns (CreatorMetadata memory) {
        require(_exists(_tokenId), "NFT does not exist");
        return _creatorMetadata[_tokenId];
    }

    /**
     * @dev 獲取創作者的 NFT ID
     * @param _creator 創作者地址
     * @return NFT ID
     */
    function getCreatorTokenId(address _creator) external view returns (uint256) {
        return creatorToTokenId[_creator];
    }

    // 重寫必要的函數
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
} 