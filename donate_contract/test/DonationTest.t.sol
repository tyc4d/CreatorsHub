// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "lib/forge-std/src/Test.sol";
import {DonationFactory} from "../src/DonationFactory.sol";
import {CreatorDonation} from "../src/CreatorDonation.sol";

contract DonationTest is Test {
    DonationFactory public factory;
    address deployer = address(1);
    address creator = address(2);
    address donor = address(3);

    function setUp() public {
        vm.startPrank(deployer);
        factory = new DonationFactory(deployer);
        vm.stopPrank();
    }

    function testCreateDonationContract() public {
        vm.startPrank(creator);
        address donationContract = factory.createDonationContract();
        vm.stopPrank();

        assertEq(factory.getCreatorContract(creator), donationContract);
        assertTrue(factory.hasContract(creator));
    }

    function testOnlyOneContractPerCreator() public {
        vm.startPrank(creator);
        factory.createDonationContract();
        
        vm.expectRevert("Creator already has a contract");
        factory.createDonationContract();
        vm.stopPrank();
    }

    function testEthDonation() public {
        vm.startPrank(creator);
        address donationContractAddr = factory.createDonationContract();
        vm.stopPrank();

        CreatorDonation donationContract = CreatorDonation(donationContractAddr);
        
        // 模擬ETH捐贈
        vm.deal(donor, 1 ether);
        vm.startPrank(donor);
        (bool success, ) = address(donationContract).call{value: 0.5 ether}("");
        vm.stopPrank();
        
        assertTrue(success);
        assertEq(address(donationContract).balance, 0.5 ether);
        
        // 模擬提取ETH
        vm.startPrank(creator);
        uint256 creatorBalanceBefore = creator.balance;
        donationContract.withdrawEth();
        uint256 creatorBalanceAfter = creator.balance;
        vm.stopPrank();
        
        assertEq(creatorBalanceAfter - creatorBalanceBefore, 0.5 ether);
        assertEq(address(donationContract).balance, 0);
    }
} 