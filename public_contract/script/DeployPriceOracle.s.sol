// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/oracles/TokenPriceOracle.sol";

contract DeployPriceOracle is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 部署價格預言機
        TokenPriceOracle priceOracle = new TokenPriceOracle();
        console.log("TokenPriceOracle deployed at:", address(priceOracle));

        // 設置初始預言機（這裡使用示例地址，實際部署時需要替換）
        address[] memory initialOracles = new address[](3);
        string[] memory oracleNames = new string[](3);
        
        initialOracles[0] = 0x1234567890123456789012345678901234567890; // 1inch 預言機
        initialOracles[1] = 0x5678901234567890123456789012345678901234; // Chainlink 預言機
        initialOracles[2] = 0x9AbCdEf0123456789012345678901234567890ab; // 自定義預言機
        
        oracleNames[0] = "1inch Oracle";
        oracleNames[1] = "Chainlink Oracle";
        oracleNames[2] = "Custom Oracle";
        
        for (uint256 i = 0; i < initialOracles.length; i++) {
            priceOracle.addOracle(initialOracles[i], oracleNames[i]);
            console.log("Added oracle:", oracleNames[i], "at", initialOracles[i]);
        }

        vm.stopBroadcast();
    }
} 