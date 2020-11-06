pragma solidity 0.6.6;

import "./ERC20TokenExtended.sol";
import "./WhiteListManager.sol";
import "../ShareToken.sol";

contract ShareTokenExtended is ERC20TokenExtended, WhiteListManager {


    string public constant name = "ShareToken";
    string public constant symbol = "SHR";
    uint8  public constant decimals = 2;
    ShareToken public prevShareToken;

    address public icoContract;

    // Any token amount must be multiplied by this const to reflect decimals
    uint256 constant E2 = 10 ** 2;

    mapping(address => bool) public rewardTokenLocked;
    mapping(address => bool) public migratedRewardTokenLocked;
    bool public mainSaleTokenLocked = true;

    uint256 public constant TOKEN_SUPPLY_MAINSALE_LIMIT = 1000000000 * E2; // 1,000,000,000 tokens (1 billion)
    uint256 public constant TOKEN_SUPPLY_AIRDROP_LIMIT = 6666666667; // 66,666,666.67 tokens (0.066 billion)
    uint256 public constant TOKEN_SUPPLY_BOUNTY_LIMIT = 33333333333; // 333,333,333.33 tokens (0.333 billion)

    uint256 public airDropTokenIssuedTotal;
    uint256 public bountyTokenIssuedTotal;

    uint256 public constant TOKEN_SUPPLY_SEED_LIMIT = 500000000 * E2; // 500,000,000 tokens (0.5 billion)
    uint256 public constant TOKEN_SUPPLY_PRESALE_LIMIT = 2500000000 * E2; // 2,500,000,000.00 tokens (2.5 billion)
    uint256 public constant TOKEN_SUPPLY_SEED_PRESALE_LIMIT = TOKEN_SUPPLY_SEED_LIMIT + TOKEN_SUPPLY_PRESALE_LIMIT;

    uint256 public seedAndPresaleTokenIssuedTotal;

    uint8 private constant PRESALE_EVENT = 0;
    uint8 private constant MAINSALE_EVENT = 1;
    uint8 private constant BOUNTY_EVENT = 2;
    uint8 private constant AIRDROP_EVENT = 3;

    modifier migrateRewardTokenLocked(address _addr) {
        // This requires the legacy ShareToken is completely locked
        // no change made on *rewardTokenLocked* variable
        if (!migratedRewardTokenLocked[_addr]) {
            migratedRewardTokenLocked[_addr] = true;
            rewardTokenLocked[_addr] = prevShareToken.rewardTokenLocked(_addr);
        }
        _;
    }

    //0xee5fe244406f35d9b4ddb488a64d51456630befc
    constructor(address _prevContract)
        public
        ERC20TokenExtended(_prevContract)
    {
        prevShareToken = ShareToken(_prevContract);
        totalTokenIssued = prevShareToken.totalMainSaleTokenIssued();
        airDropTokenIssuedTotal = prevShareToken.airDropTokenIssuedTotal();
        bountyTokenIssuedTotal = prevShareToken.bountyTokenIssuedTotal();
        seedAndPresaleTokenIssuedTotal = prevShareToken.seedAndPresaleTokenIssuedTotal();
        mainSaleTokenLocked = true;
    }

    function unlockMainSaleToken() public onlyOwner {

        mainSaleTokenLocked = false;
    }

    function lockMainSaleToken() public onlyOwner {

        mainSaleTokenLocked = true;
    }

    function unlockRewardToken(address addr) public onlyOwner {
        rewardTokenLocked[addr] = false;
        migratedRewardTokenLocked[addr] = true;
    }

    function unlockRewardTokenMany(address[] memory addrList) public onlyOwner {

        for (uint256 i = 0; i < addrList.length; i++) {

            unlockRewardToken(addrList[i]);
        }
    }

    function lockRewardToken(address addr) public onlyOwner {
        rewardTokenLocked[addr] = true;
        migratedRewardTokenLocked[addr] = true;
    }

    function lockRewardTokenMany(address[] memory addrList) public onlyOwner {

        for (uint256 i = 0; i < addrList.length; i++) {

            lockRewardToken(addrList[i]);
        }
    }

    // Check if a given address is locked. The address can be in the whitelist or in the reward
    function isLocked(address addr)
    public
    view
    returns (bool)
    {
        // Main sale is running, any addr is locked
        if (mainSaleTokenLocked) {
            return true;
        }
        // Main sale is ended and thus any whitelist addr is unlocked
        if (isWhitelisted(addr)) {
            return false;
        }
        // If the addr is in the reward, it must be checked if locked
        // If the addr is not in the reward, it is considered unlocked
        if (!migratedRewardTokenLocked[addr]) {
            return prevShareToken.rewardTokenLocked(addr);
        }
        return rewardTokenLocked[addr];

    }

    function totalSupply() public override view returns (uint256) {

        return totalTokenIssued.add(seedAndPresaleTokenIssuedTotal).add(airDropTokenIssuedTotal).add(bountyTokenIssuedTotal);
    }

    function totalMainSaleTokenIssued() public view returns (uint256) {

        return totalTokenIssued;
    }

    function totalMainSaleTokenLimit() public pure returns (uint256) {

        return TOKEN_SUPPLY_MAINSALE_LIMIT;
    }

    function totalPreSaleTokenIssued() public view returns (uint256) {

        return seedAndPresaleTokenIssuedTotal;
    }

    function transfer(address _to, uint256 _amount)
        public
        override
        migrateRewardTokenLocked(msg.sender)
        migrateRewardTokenLocked(_to)
        returns (bool success)
    {

        require(isLocked(msg.sender) == false);
        require(isLocked(_to) == false);

        return super.transfer(_to, _amount);
    }

    function transferFrom(address _from, address _to, uint256 _amount)
        public
        override
        migrateRewardTokenLocked(msg.sender)
        migrateRewardTokenLocked(_from)
        migrateRewardTokenLocked(_to)
        returns (bool success)
    {

        require(isLocked(_from) == false);
        require(isLocked(_to) == false);

        return super.transferFrom(_from, _to, _amount);
    }

    function setIcoContract(address _icoContract) public onlyOwner {

        // Allow to set the ICO contract only once
        require(icoContract == address(0));
        require(_icoContract != address(0));

        icoContract = _icoContract;
    }

    function sell(address buyer, uint256 tokens) public returns (bool success) {

        require(icoContract != address(0));
        // The sell() method can only be called by the fixedly-set ICO contract
        require(msg.sender == icoContract);
        require(tokens > 0);
        require(buyer != address(0));

        // Only whitelisted address can buy tokens. Otherwise, refund
        require(isWhitelisted(buyer));

        require(totalTokenIssued.add(tokens) <= TOKEN_SUPPLY_MAINSALE_LIMIT);

        // Register tokens issued to the buyer
        balances[buyer] = balances[buyer].add(tokens);

        // Update total amount of tokens issued
        totalTokenIssued = totalTokenIssued.add(tokens);

        emit Transfer(address(MAINSALE_EVENT), buyer, tokens);

        return true;
    }

    function rewardAirdrop(address _to, uint256 _amount) public onlyOwner {

        // this check also ascertains _amount is positive
        require(_amount <= TOKEN_SUPPLY_AIRDROP_LIMIT);

        require(airDropTokenIssuedTotal < TOKEN_SUPPLY_AIRDROP_LIMIT);

        uint256 remainingTokens = TOKEN_SUPPLY_AIRDROP_LIMIT.sub(airDropTokenIssuedTotal);
        if (_amount > remainingTokens) {
            _amount = remainingTokens;
        }

        // Register tokens to the receiver
        balances[_to] = balances[_to].add(_amount);

        // Update total amount of tokens issued
        airDropTokenIssuedTotal = airDropTokenIssuedTotal.add(_amount);

        // Lock the receiver
        migratedRewardTokenLocked[_to] = true;
        rewardTokenLocked[_to] = true;

        emit Transfer(address(AIRDROP_EVENT), _to, _amount);
    }

    function rewardBounty(address _to, uint256 _amount) public onlyOwner {
        // this check also ascertains _amount is positive
        require(_amount <= TOKEN_SUPPLY_BOUNTY_LIMIT);

        require(bountyTokenIssuedTotal < TOKEN_SUPPLY_BOUNTY_LIMIT);

        uint256 remainingTokens = TOKEN_SUPPLY_BOUNTY_LIMIT.sub(bountyTokenIssuedTotal);
        if (_amount > remainingTokens) {
            _amount = remainingTokens;
        }

        // Register tokens to the receiver
        balances[_to] = balances[_to].add(_amount);

        // Update total amount of tokens issued
        bountyTokenIssuedTotal = bountyTokenIssuedTotal.add(_amount);

        // Lock the receiver
        migratedRewardTokenLocked[_to] = true;
        rewardTokenLocked[_to] = true;

        emit Transfer(address(BOUNTY_EVENT), _to, _amount);
    }

    function rewardBountyMany(address[] memory addrList, uint256[] memory amountList) public onlyOwner {

        require(addrList.length == amountList.length);

        for (uint256 i = 0; i < addrList.length; i++) {

            rewardBounty(addrList[i], amountList[i]);
        }
    }

    function rewardAirdropMany(address[] memory addrList, uint256[] memory amountList) public onlyOwner {

        require(addrList.length == amountList.length);

        for (uint256 i = 0; i < addrList.length; i++) {

            rewardAirdrop(addrList[i], amountList[i]);
        }
    }

    function handlePresaleToken(address _to, uint256 _amount) public onlyOwner {

        require(_amount <= TOKEN_SUPPLY_SEED_PRESALE_LIMIT);

        require(seedAndPresaleTokenIssuedTotal < TOKEN_SUPPLY_SEED_PRESALE_LIMIT);

        uint256 remainingTokens = TOKEN_SUPPLY_SEED_PRESALE_LIMIT.sub(seedAndPresaleTokenIssuedTotal);
        require(_amount <= remainingTokens);

        // Register tokens to the receiver
        balances[_to] = balances[_to].add(_amount);

        // Update total amount of tokens issued
        seedAndPresaleTokenIssuedTotal = seedAndPresaleTokenIssuedTotal.add(_amount);

        emit Transfer(address(PRESALE_EVENT), _to, _amount);

        // Also add to whitelist
        set(_to);
    }

    function handlePresaleTokenMany(address[] memory addrList, uint256[] memory amountList) public onlyOwner {

        require(addrList.length == amountList.length);

        for (uint256 i = 0; i < addrList.length; i++) {

            handlePresaleToken(addrList[i], amountList[i]);
        }
    }

    // add a selfdestruct function
    function kill() public onlyOwner {
        selfdestruct(msg.sender);
    }
}
