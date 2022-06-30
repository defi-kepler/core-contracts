//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import './interface/IStrategy.sol';
/**
 * Distribute funds to strategic contracts
 *
 */
contract Dispatcher is Ownable, ReentrancyGuard {

    event Dispatch(address strategy, uint256 token0Amount, uint256 token1Amount);
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
   
    address public  token0;
    address public token1;
    uint256 public tokenPoint;
    Strategy[] public strategys; 

    struct Strategy {
        address strategy;
        uint256 point;
    }

    constructor(address _token0, address _token1) {
        token0 = _token0;
        token1 = _token1;  
    }
    
    function addStrategys(address strategy,  uint256 point) external onlyOwner{
        require(strategy != address(0), "Dispatcher: strategy is zero address");
        tokenPoint = tokenPoint.add(point);
        strategys.push(Strategy ({
            strategy: strategy,
            point: point
        }));
    }

    function updateStrategys(uint256 index, uint256 point) external onlyOwner {
        tokenPoint = tokenPoint.sub(strategys[index].point).add(point);
        strategys[index].point = point;
    }

    function sweep(address stoken, address recipient) external onlyOwner {
       require(stoken != address(0), "Dispatcher: stoken is zero address");
       require(recipient != address(0), "Dispatcher: recipient is zero address");
       uint256 balance = IERC20(stoken).balanceOf(address(this));
       if(balance > 0) {
           IERC20(stoken).safeTransfer(recipient, balance);
       }
    }

    //Distribute funds to individual strategies
    //First call the setOperator method of the strategy
    function dispatch() external onlyOwner nonReentrant {
        IERC20 token0C = IERC20(token0);
        IERC20 token1C = IERC20(token1);
        for (uint256 i = 0 ; i< strategys.length; i++) {
            Strategy memory s = strategys[i];
            if(s.point == 0) continue;
            uint256 token0Balance =token0C.balanceOf(address(this));
            uint256 token1Balance = token1C.balanceOf(address(this));
            uint256 token0Amount = s.point.mul(token0Balance).div(tokenPoint);
            token0C.approve(s.strategy, token0Amount);
            uint256 token1Amount = s.point.mul(token1Balance).div(tokenPoint);
            token1C.approve(s.strategy, token1Amount);
            emit Dispatch(s.strategy, token0Amount, token1Amount );  
        }
    }

    function execute(uint256 i) external onlyOwner nonReentrant{
         Strategy memory s = strategys[i];
         require(s.point != 0, "Dispatcher: point is zero");
         require(s.strategy != address(0), "Dispatcher: strategy is zero address");
         IStrategy(s.strategy).executeStrategy(); 
    }

    function approveERC20(address stoken, address spender, uint256 amount) external onlyOwner{
       require(stoken != address(0), "Dispatcher: stoken is zero address");
       require(spender != address(0), "Dispatcher: recipient is zero address");
       require(amount != 0, "Dispatcher: amount is zero ");
       IERC20(stoken).approve(spender, amount);
    }

}