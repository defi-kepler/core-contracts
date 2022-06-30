//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
contract WithdrawalAccount is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    event Withdrawal(address user, uint256 amount);
    address public token;
    address public dispatcher;
    mapping(address => bool) operators;
    
    modifier onlyOperator() {
        require(operators[msg.sender], "sender is not operator");
        _;
    }

    constructor(address _token, address _dispatcher) {
        token = _token;
        dispatcher = _dispatcher;
        operators[msg.sender] = true;
    }

    function withdrawal(address user, uint256 amount) external onlyOperator nonReentrant{
       require(user != address(0), "WithdrawalAccount: user is zero address");
       require(amount != 0, "WithdrawalAccount: amount is zero");
       IERC20 tokenObj = IERC20(token);
        uint256 balanceOf = tokenObj.balanceOf(address(this));
        if(balanceOf < amount) {
            tokenObj.safeTransferFrom(dispatcher, user, amount);
        } else {
            tokenObj.safeTransfer(user, amount);
        }
       emit Withdrawal(user, amount);
    }

    function setOperator(address user, bool allow) external onlyOwner{
        require(user != address(0), "WithdrawalAccount: ZERO_ADDRESS");
        operators[user] = allow;
    }

    function setDispatcher(address _dispatcher) external onlyOwner{
        require(_dispatcher != address(0), "WithdrawalAccount: ZERO_ADDRESS");
        dispatcher = _dispatcher;
    }
    
    
}