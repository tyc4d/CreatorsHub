// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CreatorDonation.sol";
import "../src/DonationFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        // 部署 DonationFactory
        DonationFactory factory = new DonationFactory(deployer);
        console.log("DonationFactory deployed at:", address(factory));

        // 部署 CreatorDonation 作為模板
        CreatorDonation template = new CreatorDonation(deployer);
        console.log("CreatorDonation template deployed at:", address(template));

        vm.stopBroadcast();
    }
} 