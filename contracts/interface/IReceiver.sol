// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IReceiver {
     function withdrawToDispatcher(uint256 leaveAmount) external;
     function harvest() external;
     function totalAmount() external  view returns(uint256);
}