//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import '../interface/IStrategy.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
contract OfflineInvestmentStrategy is IStrategy, Ownable {
    using SafeERC20 for IERC20;

    address public dispatcher;
    mapping(address => bool) operators;
    
    event ReceiveFunds(address indexed sender, address indexed to, uint256 value);
    
    modifier onlyOperator() {
        require(operators[msg.sender], "sender is not operator");
        _;
    }
    
    constructor(address _dispatcher) {
        dispatcher = _dispatcher;
        operators[msg.sender] = true;
    }

    function withdraw(uint256 _share) external override onlyOperator {
    }

    function harvest() external override onlyOperator {
    }

    function executeStrategy() external override onlyOperator {
    }

    function receiveFunds(address token, address to, uint256 amount) external onlyOperator {
         require(token != address(0), "OfflineInvestmentStrategy: token is zero address");
         require(to != address(0), "OfflineInvestmentStrategy: to is zero address");  
         require(amount !=0, "LPFarmStrategy: amount is zero");  
         IERC20(token).safeTransferFrom(dispatcher, to, amount);
         emit ReceiveFunds(msg.sender, to, amount);
    }

    function setOperator(address user, bool allow) external onlyOwner{
        require(user != address(0), "OfflineInvestmentStrategy: ZERO_ADDRESS");
        operators[user] = allow;
    }

    function setDispatcher(address _dispatcher) external onlyOwner{
        require(_dispatcher != address(0), "OfflineInvestmentStrategy: ZERO_ADDRESS");
        dispatcher = _dispatcher;
    }
}