// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title SupporterNFT
 * @dev 實現支持者獎勵和身份認證系統
 */
contract SupporterNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    // 事件定義
    event SupporterNFTMinted(
        address indexed supporter,
        address indexed creator,
        uint256 tokenId,
        uint256 amount,
        string tokenSymbol,
        uint256 tokenPrice
    );

    // 狀態變量
    Counters.Counter private _tokenIds;
    mapping(uint256 => SupporterMetadata) private _supporterMetadata;
    mapping(address => mapping(address => uint256[])) public supporterToCreatorTokens;

    // 支持者資訊結構
    struct SupporterMetadata {
        string name;          // "CreatorsHub 支持者 NFT"
        string description;   // 支持者描述
        string image;         // 支持者 NFT 圖片（可根據等級變化）
        address creator;      // 支持的創作者地址
        uint256 donateDate;   // 捐贈時間戳
        uint256 amount;       // 捐贈金額（以 wei 為單位）
        string tokenSymbol;   // 捐贈代幣符號
        uint256 tokenPrice;   // 捐贈時的代幣價格（以 USD 為單位）
        string tier;          // 支持者等級
    }

    constructor() ERC721("CreatorsHub Supporter NFT", "CSNFT") Ownable(msg.sender) {}

    /**
     * @dev 鑄造支持者 NFT
     * @param _supporter 支持者地址
     * @param _creator 創作者地址
     * @param _amount 捐贈金額
     * @param _tokenSymbol 代幣符號
     * @param _tokenPrice 代幣價格（USD）
     * @return tokenId 鑄造的 NFT ID
     */
    function mintSupporterNFT(
        address _supporter,
        address _creator,
        uint256 _amount,
        string memory _tokenSymbol,
        uint256 _tokenPrice
    ) external onlyOwner returns (uint256) {
        require(_supporter != address(0), "Invalid supporter address");
        require(_creator != address(0), "Invalid creator address");
        require(_amount > 0, "Amount must be greater than 0");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // 創建支持者元數據
        _supporterMetadata[newTokenId] = SupporterMetadata({
            name: "CreatorsHub Supporter NFT",
            description: "This NFT represents your support for a creator",
            image: "",  // 將根據等級動態生成
            creator: _creator,
            donateDate: block.timestamp,
            amount: _amount,
            tokenSymbol: _tokenSymbol,
            tokenPrice: _tokenPrice,
            tier: calculateTier(_amount)
        });
        
        // 鑄造 NFT
        _safeMint(_supporter, newTokenId);
        
        // 記錄支持者與創作者的關係
        supporterToCreatorTokens[_supporter][_creator].push(newTokenId);
        
        emit SupporterNFTMinted(_supporter, _creator, newTokenId, _amount, _tokenSymbol, _tokenPrice);
        
        return newTokenId;
    }

    /**
     * @dev 計算支持者等級
     * @param _amount 捐贈金額（以 wei 為單位）
     * @return 支持者等級
     */
    function calculateTier(uint256 _amount) public pure returns (string memory) {
        if (_amount >= 1 ether) return "Diamond";
        if (_amount >= 0.5 ether) return "Gold";
        if (_amount >= 0.1 ether) return "Silver";
        return "Bronze";
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
     * @dev 獲取支持者的所有 NFT
     * @param _supporter 支持者地址
     * @param _creator 創作者地址
     * @return 支持者的 NFT ID 數組
     */
    function getSupporterTokens(address _supporter, address _creator) external view returns (uint256[] memory) {
        return supporterToCreatorTokens[_supporter][_creator];
    }

    /**
     * @dev 獲取支持者的所有 NFT 數量
     * @param _supporter 支持者地址
     * @param _creator 創作者地址
     * @return NFT 數量
     */
    function getSupporterTokenCount(address _supporter, address _creator) external view returns (uint256) {
        return supporterToCreatorTokens[_supporter][_creator].length;
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