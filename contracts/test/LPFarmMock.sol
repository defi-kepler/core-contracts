// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import './interfaces/IPancakePair.sol';
contract LPFarmMock  {
     
     IPancakePair public lptoken;

     constructor(address _lptoken) {
          lptoken = IPancakePair(_lptoken);
     }

     function deposit(uint256 _pid, uint256 _amount) public  {
          lptoken.transferFrom(msg.sender, address(this), _amount);
     }

     function withdraw(uint256 _pid, uint256 _amount) public  {
          lptoken.transfer(msg.sender, _amount);
     }
    
    function userInfo(uint256 _pid, address _user) external view returns (uint256 amount, uint256 rewardDebt) {
         amount = lptoken.balanceOf(address(this));
         rewardDebt = 10;
    }
}