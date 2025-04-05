// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DonationFactory.sol";
import "../src/DonationContract.sol";
import "../src/CreatorNFT.sol";
import "../src/SupporterNFT.sol";
import "../src/interfaces/ITokenPriceOracle.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 部署 NFT 合約
        CreatorNFT creatorNFT = new CreatorNFT();
        SupporterNFT supporterNFT = new SupporterNFT();

        // 部署捐贈合約模板
        DonationContract donationContractTemplate = new DonationContract();

        // 部署價格預言機（這裡使用 1inch 的價格預言機）
        address priceOracle = 0x7f069DF72B7a39bCE3226d6822B74FCAa0E6513d; // Sepolia 測試網上的 1inch 價格預言機

        // 部署工廠合約
        DonationFactory factory = new DonationFactory(
            address(creatorNFT),
            address(supporterNFT),
            payable(address(donationContractTemplate)),
            priceOracle
        );

        // 初始化合約模板
        donationContractTemplate.initialize(address(factory), priceOracle);

        // 轉移 NFT 合約所有權
        creatorNFT.transferOwnership(address(factory));
        supporterNFT.transferOwnership(address(factory));

        vm.stopBroadcast();

        // 輸出部署的合約地址
        console.log("CreatorNFT deployed to:", address(creatorNFT));
        console.log("SupporterNFT deployed to:", address(supporterNFT));
        console.log("DonationContractTemplate deployed to:", address(donationContractTemplate));
        console.log("DonationFactory deployed to:", address(factory));
    }
} 