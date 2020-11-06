pragma solidity 0.6.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract ERC20TokenExtended is IERC20 {

    using SafeMath for uint256;

    // Total amount of tokens issued

    mapping(address => bool) public migratedBalances;
    mapping(address => mapping( address => bool)) public migratedAllowances;
    uint256 internal totalTokenIssued;
    mapping(address => uint256) internal balances;
    mapping(address => mapping (address => uint256)) internal allowed;
    IERC20 prevContract;

    modifier migrateBalance(address _owner) {
        if ( !migratedBalances[_owner] ) {
            migratedBalances[_owner] = true;
            balances[_owner] = balances[_owner].add(prevContract.balanceOf(_owner));
        }
        _;
    }

    modifier migrateAllowance(address _owner, address _spender) {
        if (!migratedAllowances[_owner][_spender]) {
            migratedAllowances[_owner][_spender] = true;
            allowed[_owner][_spender] = allowed[_owner][_spender].add(
                prevContract.allowance(_owner, _spender)
            );
        }
        _;
    }

    constructor(address _prevContract) public {
        prevContract = IERC20(_prevContract);
    }

    function totalSupply() public virtual override view returns (uint256) {
        return totalTokenIssued;
    }

    /* Get the account balance for an address */
    function balanceOf(address _owner)
    public
    override
    view
    returns (uint256) {

        if (!migratedBalances[_owner]) {
            return prevContract.balanceOf(_owner).add(balances[_owner]);
        }
        return balances[_owner];

    }

    /* Transfer the balance from owner's account to another account */
    function transfer(address _to, uint256 _amount)
        public
        override
        virtual
        migrateBalance(msg.sender)
        migrateBalance(_to)
        returns (bool)
    {

        require(_to != address(0x0));

        // amount sent cannot exceed balance
        require(balances[msg.sender] >= _amount);

        
        // update balances
        balances[msg.sender] = balances[msg.sender].sub(_amount);
        balances[_to]        = balances[_to].add(_amount);

        // log event
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }
    

    /* Allow _spender to withdraw from your account up to _amount */
    function approve(address _spender, uint256 _amount)
        public
        override
        returns (bool)
    {

        require(_spender != address(0x0));

        // update allowed amount
        allowed[msg.sender][_spender] = _amount;

        // log event
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    /* Spender of tokens transfers tokens from the owner's balance */
    /* Must be pre-approved by owner */
    function transferFrom(address _from, address _to, uint256 _amount)
        public
        override
        virtual
        migrateAllowance(_from, msg.sender)
        migrateBalance(msg.sender)
        migrateBalance(_from)
        migrateBalance(_to)
        returns (bool)
    {
        
        require(_to != address(0));
        
        // balance checks
        require(balances[_from] >= _amount);
        require(allowed[_from][msg.sender] >= _amount);

        // update balances and allowed amount
        balances[_from]            = balances[_from].sub(_amount);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_amount);
        balances[_to]              = balances[_to].add(_amount);

        // log event
        emit Transfer(_from, _to, _amount);
        return true;
    }

    /* Returns the amount of tokens approved by the owner */
    /* that can be transferred by spender */
    function allowance(address _owner, address _spender)
    public
    override
    view
    returns (uint256) {

        if (!migratedAllowances[_owner][_spender]) {
            return prevContract.allowance(_owner, _spender).add(allowed[_owner][_spender]);
        }
        return allowed[_owner][_spender];

    }
}
