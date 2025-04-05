// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SupporterNFT
 * @dev 實現支持者 NFT，用於記錄支持者的捐贈歷史
 */
contract SupporterNFT is ERC721, ERC721Enumerable, Ownable {
    // 狀態變量
    uint256 private _nextTokenId;
    mapping(uint256 => SupporterMetadata) private _supporterMetadata;
    mapping(address => mapping(address => uint256)) public supporterToCreatorTokenId;
    mapping(uint256 => bool) private _tokenExists;

    // 事件定義
    event SupporterNFTMinted(
        address indexed supporter,
        address indexed creator,
        uint256 tokenId,
        uint256 amount,
        uint256 timestamp
    );
    event SupporterMetadataUpdated(
        address indexed supporter,
        uint256 tokenId,
        uint256 amount,
        uint256 timestamp
    );

    // 支持者資訊結構
    struct SupporterMetadata {
        address supporter;    // 支持者地址
        address creator;      // 創作者地址
        uint256 amount;       // 捐贈金額
        string token;         // 捐贈代幣
        uint256 timestamp;    // 捐贈時間
    }

    constructor() ERC721("Supporter NFT", "SNFT") Ownable(msg.sender) {}

    /**
     * @dev 檢查代幣是否存在
     * @param tokenId 代幣 ID
     * @return 代幣是否存在
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _tokenExists[tokenId];
    }

    /**
     * @dev 鑄造支持者 NFT
     * @param _supporter 支持者地址
     * @param _creator 創作者地址
     * @param _amount 捐贈金額
     * @param _token 捐贈代幣
     * @param _timestamp 捐贈時間
     * @return tokenId 鑄造的 NFT ID
     */
    function mintSupporterNFT(
        address _supporter,
        address _creator,
        uint256 _amount,
        string memory _token,
        uint256 _timestamp
    ) external onlyOwner returns (uint256) {
        require(_supporter != address(0), "Invalid supporter address");
        require(_creator != address(0), "Invalid creator address");
        require(_amount > 0, "Amount must be greater than 0");
        
        uint256 tokenId = ++_nextTokenId;
        
        // 創建支持者元數據
        _supporterMetadata[tokenId] = SupporterMetadata({
            supporter: _supporter,
            creator: _creator,
            amount: _amount,
            token: _token,
            timestamp: _timestamp
        });
        
        // 鑄造 NFT
        _safeMint(_supporter, tokenId);
        supporterToCreatorTokenId[_supporter][_creator] = tokenId;
        _tokenExists[tokenId] = true;
        
        emit SupporterNFTMinted(
            _supporter,
            _creator,
            tokenId,
            _amount,
            _timestamp
        );
        
        return tokenId;
    }

    /**
     * @dev 更新支持者元數據
     * @param _tokenId NFT ID
     * @param _amount 新捐贈金額
     */
    function updateSupporterMetadata(
        uint256 _tokenId,
        uint256 _amount
    ) external onlyOwner {
        require(_exists(_tokenId), "NFT does not exist");
        
        SupporterMetadata storage metadata = _supporterMetadata[_tokenId];
        metadata.amount = _amount;
        
        emit SupporterMetadataUpdated(
            metadata.supporter,
            _tokenId,
            _amount,
            block.timestamp
        );
    }

    /**
     * @dev 獲取支持者元數據
     * @param _tokenId NFT ID
     * @return 支持者元數據
     */
    function getSupporterMetadata(uint256 _tokenId) external view returns (SupporterMetadata memory) {
        require(_exists(_tokenId), "NFT does not exist");
        return _supporterMetadata[_tokenId];
    }

    /**
     * @dev 獲取支持者的 NFT ID
     * @param _supporter 支持者地址
     * @param _creator 創作者地址
     * @return NFT ID
     */
    function getSupporterTokenId(address _supporter, address _creator) external view returns (uint256) {
        return supporterToCreatorTokenId[_supporter][_creator];
    }

    // 重寫必要的函數
    function _update(address to, uint256 tokenId, address auth)
        internal
        virtual
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        virtual
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
} 