/*
@IMPORTANT The refund process is executed through the scope of the refund policy, which
can be found in the #refund-policy channel.
- This contract is designed to distribute  ETH to a list of recipients, each of them might receive a different amount.
- This contract is permission-less and owner-less.
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract SendETH {

    function batchSend(address[] memory users, uint256[] memory amounts) public payable {
        uint256 numberOfUsers = users.length;
        uint256 numberOfAmounts = amounts.length;

        require(numberOfUsers == numberOfAmounts, "Not equal array lengths");

        // if totalSent < msg.value we will revert below due to insufficient balance of ETH 
        bool success;
        uint256 amt;
        address recipient;
        uint256 totalSent;
        for(uint256 i; i < numberOfUsers; i++){
            amt = amounts[i];
            recipient = users[i];
            (success, ) = recipient.call{value: amt}("");
            require(success, "Failure in sending ETH");
            totalSent += amt;
        }

        uint256 change = msg.value - totalSent;
        if(change > 0){
            (success, ) = msg.sender.call{value: change}("");
            require(success, "Failure in sending ETH");
        }
    }

}
