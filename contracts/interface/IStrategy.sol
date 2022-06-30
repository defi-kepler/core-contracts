// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

interface IStrategy {

     function withdraw(uint256 _share) external;

     function harvest() external;

     function executeStrategy() external;
} 