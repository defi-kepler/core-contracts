//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import '@openzeppelin/contracts/access/Ownable.sol';
contract DispatcherAI is Ownable {

    address private dispatcher;
    mapping(address => bool) operators;

    constructor(address _dispatcher){
        operators[_msgSender()] = true;
        dispatcher = _dispatcher;
    }

    modifier onlyOperator() {
        require(operators[_msgSender()], "WithdrawalAccount: sender is not operator");
        _;
    }

    function treasuryWithdrawAndDispatch(address from) external onlyOperator {
        bytes memory payload = abi.encodeWithSignature("treasuryWithdrawAndDispatch(address)", from);
        (bool success, ) = dispatcher.call(payload);
        require(success, "DispatcherAI: treasuryWithdrawAndDispatch error ");
    }

    function chainBridgeToWithdrawalAccount(uint256 pid, address token, address withdrawalAccount) external onlyOperator {
         bytes memory payload = abi.encodeWithSignature("chainBridgeToWithdrawalAccount(uint256,address,address)", pid, token, withdrawalAccount);
        (bool success, ) = dispatcher.call(payload);
        require(success, "DispatcherAI: chainBridgeToWithdrawalAccount error ");
    }


    function setOperator(address user, bool allow) external onlyOwner{
        require(user != address(0), "Dispatcher: ZERO_ADDRESS");
        operators[user] = allow;
    }
}