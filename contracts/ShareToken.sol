pragma solidity 0.6.6;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract ShareToken is IERC20{

    mapping(address => bool) public rewardTokenLocked;
    bool public mainSaleTokenLocked = true;
    uint256 public airDropTokenIssuedTotal;
    uint256 public bountyTokenIssuedTotal;

    uint256 public seedAndPresaleTokenIssuedTotal;


    function totalMainSaleTokenIssued() public returns (uint256) {

    }
}
