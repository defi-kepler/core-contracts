// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IPuppetOfDispatcher {
    function setDispatcher(address from) external;
    function setOperator(address user, bool allow) external;
}