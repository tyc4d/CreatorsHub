// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CreatorNFT
 * @dev 實現創作者身份驗證和權益管理
 */
contract CreatorNFT is ERC721, ERC721URIStorage, Ownable {
    // 狀態變量
    uint256 private _nextTokenId;
    mapping(uint256 => CreatorMetadata) private _creatorMetadata;
    mapping(address => uint256) public creatorToTokenId;
    mapping(uint256 => bool) private _tokenExists;

    // 事件定義
    event CreatorNFTMinted(
        address indexed creator,
        uint256 tokenId,
        string name,
        string description,
        uint256 timestamp
    );
    event CreatorMetadataUpdated(
        address indexed creator,
        uint256 tokenId,
        string name,
        string description,
        uint256 timestamp
    );
    event CreatorImageUpdated(
        address indexed creator,
        uint256 tokenId,
        string image,
        uint256 timestamp
    );

    // 創作者資訊結構
    struct CreatorMetadata {
        string name;          // 創作者名稱
        string description;   // 創作者描述
        string image;         // 創作者 NFT 圖片
        string channelImage;  // 頻道封面圖片
        uint256 joinDate;     // 加入時間
        uint256 totalDonations; // 總捐贈金額
        uint256 supporterCount; // 支持者數量
        string tier;          // 創作者等級
    }

    constructor() ERC721("CreatorsHub Creator NFT", "CCNFT") Ownable(msg.sender) {}

    /**
     * @dev 檢查代幣是否存在
     * @param tokenId 代幣 ID
     * @return 代幣是否存在
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _tokenExists[tokenId];
    }

    /**
     * @dev 鑄造創作者 NFT
     * @param _creator 創作者地址
     * @param _name 創作者名稱
     * @param _description 創作者描述
     * @return tokenId 鑄造的 NFT ID
     */
    function mintCreatorNFT(
        address _creator,
        string memory _name,
        string memory _description
    ) external onlyOwner returns (uint256) {
        require(_creator != address(0), "Invalid creator address");
        require(creatorToTokenId[_creator] == 0, "NFT already minted");
        
        uint256 tokenId = ++_nextTokenId;
        
        // 創建創作者元數據
        _creatorMetadata[tokenId] = CreatorMetadata({
            name: _name,
            description: _description,
            image: "",
            channelImage: "",
            joinDate: block.timestamp,
            totalDonations: 0,
            supporterCount: 0,
            tier: "Bronze"
        });
        
        // 鑄造 NFT
        _safeMint(_creator, tokenId);
        creatorToTokenId[_creator] = tokenId;
        _tokenExists[tokenId] = true;
        
        emit CreatorNFTMinted(
            _creator,
            tokenId,
            _name,
            _description,
            block.timestamp
        );
        
        return tokenId;
    }

    /**
     * @dev 更新創作者元數據
     * @param _tokenId NFT ID
     * @param _name 新名稱
     * @param _description 新描述
     */
    function updateCreatorMetadata(
        uint256 _tokenId,
        string memory _name,
        string memory _description
    ) external {
        require(_exists(_tokenId), "NFT does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Not token owner");
        
        CreatorMetadata storage metadata = _creatorMetadata[_tokenId];
        metadata.name = _name;
        metadata.description = _description;
        
        emit CreatorMetadataUpdated(
            msg.sender,
            _tokenId,
            _name,
            _description,
            block.timestamp
        );
    }

    /**
     * @dev 更新創作者圖片
     * @param _tokenId NFT ID
     * @param _image 新圖片 URL
     */
    function updateCreatorImage(
        uint256 _tokenId,
        string memory _image
    ) external {
        require(_exists(_tokenId), "NFT does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Not token owner");
        
        _creatorMetadata[_tokenId].image = _image;
        
        emit CreatorImageUpdated(
            msg.sender,
            _tokenId,
            _image,
            block.timestamp
        );
    }

    /**
     * @dev 更新創作者等級
     * @param _tokenId NFT ID
     * @param _totalDonations 總捐贈金額
     */
    function updateCreatorTier(uint256 _tokenId, uint256 _totalDonations) external onlyOwner {
        require(_exists(_tokenId), "NFT does not exist");
        
        CreatorMetadata storage metadata = _creatorMetadata[_tokenId];
        metadata.totalDonations = _totalDonations;
        metadata.tier = calculateTier(_totalDonations);
    }

    /**
     * @dev 計算創作者等級
     * @param _totalDonations 總捐贈金額
     * @return 創作者等級
     */
    function calculateTier(uint256 _totalDonations) public pure returns (string memory) {
        if (_totalDonations >= 100 ether) return "Diamond";
        if (_totalDonations >= 50 ether) return "Gold";
        if (_totalDonations >= 10 ether) return "Silver";
        return "Bronze";
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