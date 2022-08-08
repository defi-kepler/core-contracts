// SPDX-License-Identifier: MIT

pragma solidity 0.8.1;
import './IReceiver.sol';
interface IChainBridgeStrategy is IReceiver{
     function harvest(address token) external  returns (uint256);
     function receiveFunds(address token, address to, uint256 amount) external;
}