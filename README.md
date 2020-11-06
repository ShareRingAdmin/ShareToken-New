# README #

# ShareRing v2.0

## Description
In this repository located updated smart contracts of ShareRing (ShareToken).

The new version was created to expand the capabilities of the ShareToken, namely, to allow the transfer of tokens to the contract address. Otherwise, the new ShareToken has the same functionalities as previously.
Migrations of balances and allowances were implemented through "Lazy" migrations described in this [article](https://medium.com/bitclave/the-easy-way-to-upgrade-smart-contracts-ba30ba012784).

## Changes made

### Structure of inheritance
Structure of inheritance the same as was before, only smart contracts were changed.

**ERC20TokenExtended inherit:**
> ERC20Interface

**ShareTokenExtended inherit:**
> ERC20TokenExtended

> WhiteListManager

### Changes made in smart contracts

**For ERC20TokenExtended:**

* copy paste the code of ERC20Token:
* delete functions isContract();
* delete require(isContract);
* add migrations of balances and allowances.

**For ShareTokenExtended:**

* copy-paste the code of ShareToken;
* add old contract as variable to get all state information; 
* change constructor (initial state same as the state of old contract);
* add self-destruct function;
* add migration rewardTokenLocked.


# Start 
### Download

`git clone "link"`

### Install NodeJS and npm if not available
`curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`\
`sudo apt-get install -y nodejs`

## Install pm2 tool if not available
`npm install pm2 -g`

### Installation

`npm install`

### Compile smart contracts
`npm run build`

### Deploy smart contracts
* `npm run deploy-rinkeby` (Rinkeby testnet)
* `npm run deploy-ropsten` (Ropsten testnet)
* `npm run deploy-mainnet` (Mainnet testnet)

### Generate presale/mainsale data
* `npm run data`

**NOTE**:
All the below scripts are in the folder "./script"


## QUICK START

* Please install Truffle using *npm* as described [here](http://truffleframework.com/) or
`npm install -g truffle`

* Install Ganache as described [here](https://github.com/trufflesuite/ganache-cli) or
`npm install -g ganache-cli`
* Run Ganache as Ethereum network and expose port *8545* under *127.0.0.1* (These should be default options).
* Run `truffle test <test_file>` for each test file. They are located under `test/token` folder.

**NOTE**:

Please test each file under folder *test/token* separately, for example: `truffle test test/token/ShareTokenTest.js`\
Please restart Ganache after certain testruns to update testing accounts' balances and states

## Run test

`npm test <test_file>`