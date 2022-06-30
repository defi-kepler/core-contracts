//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
//
contract Treasury is Ownable, ReentrancyGuard {
     
    using SafeERC20 for IERC20;

    event Deposit(address user, uint256 amount);
    event Withdraw(address recipient, uint256 amount);
    event Sweep(address token, address recipient, uint256 amount);

    address public token;

    constructor(address _token) {
        token = _token;
    }
    
    function deposit(uint256 amount) external nonReentrant{
        require(amount != 0, "Treasury: amount is zero");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount);
    }

    function withdraw(address recipient) external onlyOwner{
         require(recipient != address(0), "Treasury: recipient is zero address");
         uint256 balanceOf = IERC20(token).balanceOf(address(this));
         if(balanceOf > 0) {
             IERC20(token).safeTransfer(recipient, balanceOf);
         }
         emit Withdraw(recipient, balanceOf);
    }

    function sweep(address stoken, address recipient) external onlyOwner{
       uint256 balance = IERC20(stoken).balanceOf(address(this));
       if(balance > 0) {
           IERC20(stoken).safeTransfer(recipient, balance);
           emit Sweep(stoken, recipient, balance);
       }
    }

}