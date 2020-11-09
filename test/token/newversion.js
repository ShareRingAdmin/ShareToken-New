let assertRevert = require('../helpers/assertRevert.js');
let expectEvent = require('../helpers/expectEvent.js');
let utilities = require('../helpers/utilities.js');
let constants = require('../config/ShareTokenFigures.js');

let ShareTokenExtended = artifacts.require('./newVersion/ShareTokenExtended.sol');
let ShareTokenMock = artifacts.require('./mock/ShareTokenMock.sol');
const MainSale = artifacts.require('./mock/MainSaleMock.sol');


//*****************************************************************************************
//                          UTILITIES
//*****************************************************************************************
let getBalance = utilities.getBalance
let sellToAccount = utilities.sellToAccount

//*****************************************************************************************
//                         TEST CASES
//*****************************************************************************************

contract('ShareToken Testcase', function ([OWNER, NEW_OWNER, RECIPIENT, ANOTHER_ACCOUNT]) {
    let accounts = [OWNER, NEW_OWNER, RECIPIENT, ANOTHER_ACCOUNT];
    console.log("OWNER: ", OWNER);
    console.log("NEW OWNER: ", NEW_OWNER);
    console.log("RECIPIENT: ", RECIPIENT);
    console.log("ANOTHER ACCOUNT:", ANOTHER_ACCOUNT);

    beforeEach(async function () {
        this.token = await ShareTokenMock.new();
        this.newToken = await ShareTokenExtended.new(this.token.address);

        this.mainsale = await MainSale.new()
        await this.mainsale.startICO(constants.ETH_USD_RATE, this.token.address);

        // set ico


        // add to whitelist
        for (let i = 0; i < accounts.length; i++) {
            await this.token.set(accounts[i]);
        }

    });

    it('check  tokens migration and balance', async function(){
        const totalSupply = await this.token.totalSupply();
        assert.equal(totalSupply.toNumber(), 0);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 0);
        await this.token.setIcoContract(accounts[2],{from:accounts[0]});
        await this.token.sell(accounts[1], 300,{from:accounts[2]})
        assert.equal(await this.token.balanceOf.call(accounts[1]), 300);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 300);
        assert.equal(await this.newToken.migratedBalances.call(accounts[1]), false);
    })

    it('check tokens transfer ', async function(){
        const totalSupply = await this.token.totalSupply();
        assert.equal(totalSupply.toNumber(), 0);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 0);
        await this.token.setIcoContract(accounts[2],{from:accounts[0]});
        await this.token.sell(accounts[1], 300,{from:accounts[2]})


        assert.equal(await this.token.balanceOf.call(accounts[1]), 300);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 300);
        await this.token.unlockMainSaleToken( {from:accounts[0]});
        await this.token.transfer(accounts[2], 200, {from:accounts[1]});
        assert.equal(await this.newToken.balanceOf.call(accounts[2]), 200);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 100);
    })

    it('check tokens transfer with  rebase ', async function(){
        const totalSupply = await this.token.totalSupply();
        assert.equal(totalSupply.toNumber(), 0);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 0);
        await this.token.setIcoContract(accounts[2],{from:accounts[0]});
        await this.token.sell(accounts[1], 300,{from:accounts[2]})


        assert.equal(await this.token.balanceOf.call(accounts[1]), 300);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 300);
        await this.token.unlockMainSaleToken( {from:accounts[0]});
        await this.token.transfer(accounts[2], 100, {from:accounts[1]});
        assert.equal(await this.newToken.balanceOf.call(accounts[2]), 100);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 200);
        await this.newToken.unlockMainSaleToken( {from:accounts[0]});
        await this.newToken.transfer(accounts[3], 50, {from:accounts[1]});
        await this.token.transfer(accounts[3], 50, {from:accounts[1]});
        assert.equal(await this.newToken.balanceOf.call(accounts[2]), 100);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 150);
        assert.equal(await this.newToken.balanceOf.call(accounts[3]), 50);
        assert.equal(await this.token.balanceOf.call(accounts[2]), 100);
        assert.equal(await this.token.balanceOf.call(accounts[1]), 150);
        assert.equal(await this.token.balanceOf.call(accounts[3]), 50);
    })

    it('check tokens allowance', async function(){
        const totalSupply = await this.token.totalSupply();
        assert.equal(totalSupply.toNumber(), 0);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 0);
        await this.token.setIcoContract(accounts[2],{from:accounts[0]});
        await this.token.sell(accounts[1], 300,{from:accounts[2]})



        assert.equal(await this.token.balanceOf.call(accounts[1]), 300);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 300);
        await this.token.approve(accounts[2], 200, {from:accounts[1]});
        assert.equal(await this.token.allowance(accounts[1], accounts[2]), 200);
        assert.equal(await this.newToken.allowance(accounts[1], accounts[2]), 200);
    })
    it('check tokens allowance+ transferFrom', async function(){
        const totalSupply = await this.token.totalSupply();
        assert.equal(totalSupply.toNumber(), 0);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 0);
        await this.token.setIcoContract(accounts[2],{from:accounts[0]});
        await this.token.sell(accounts[1], 300,{from:accounts[2]})
        await this.token.sell(accounts[3], 50,{from:accounts[2]})

        assert.equal(await this.token.balanceOf.call(accounts[1]), 300);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 300);
        await this.token.approve(accounts[2], 200, {from:accounts[1]});
        assert.equal(await this.token.allowance.call(accounts[1], accounts[2]), 200);
        assert.equal(await this.newToken.allowance(accounts[1], accounts[2]), 200);
        await this.newToken.unlockMainSaleToken( {from:accounts[0]});
        await this.newToken.transferFrom(
            accounts[1],
            accounts[3],
            100,
            {from: accounts[2]}
        );
        assert.equal(await this.newToken.balanceOf.call(accounts[3]), 150);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 200);
        assert.equal(await this.newToken.balanceOf.call(accounts[2]), 0);
        await this.newToken.transferFrom(
            accounts[1],
            accounts[3],
            20,
            {from: accounts[2]}
        );
        assert.equal(await this.newToken.balanceOf.call(accounts[3]), 170);
        assert.equal(await this.newToken.balanceOf.call(accounts[1]), 180);
        assert.equal(await this.newToken.balanceOf.call(accounts[2]), 0);
    })

});
