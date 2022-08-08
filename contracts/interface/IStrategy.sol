// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import '../interface/IReceiver.sol';

interface IStrategy is IReceiver {
     function executeStrategy() external;
} 