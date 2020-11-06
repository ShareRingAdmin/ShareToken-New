var ShrTokenContract = artifacts.require('./ShareToken.sol');
var MainSaleContract = artifacts.require('./MainSale.sol');

global.artifacts = artifacts;
global.web3 = web3;

var setIco = function(ShrTokenInst) {

    return new Promise(function(resolve, reject) {
        try {
            ShrTokenInst.setIcoContract(global.MAIN_SALE_CONTRACT_ADDR). 
                then(function(){
                    console.log("Set ICO contract OK (" + global.MAIN_SALE_CONTRACT_ADDR + ")");
                    resolve(true);
                }).catch(function(err){
                    console.error(err);
                    resolve(false);
                });
        } 
        catch (err) {
            console.error(err);
            resolve(false);
        }
    });
}

var startIco = function(MainSaleInst) {

    return new Promise(function(resolve, reject) {
        try {
            MainSaleInst.startICO(40000, global.SHARE_TOKEN_CONTRACT_ADDR). 
                then(function(){
                    console.log("Start ICO OK");
                    resolve(true);
                }).catch(function(err){
                    console.error(err);
                    resolve(false);
                });
        } 
        catch (err) {
            console.error(err);
            resolve(false);
        }
    });
}

ShrTokenContract.at(global.SHARE_TOKEN_CONTRACT_ADDR).
    then(function(instance){
        var ShrTokenInst = instance;
        console.log("ShareToken: ", ShrTokenInst.address);
        setIco(ShrTokenInst).then(function(res){
            if (res == true) {
                MainSaleContract.at(global.MAIN_SALE_CONTRACT_ADDR).
                    then(function(instance){
                        var MainSaleInst = instance;
                        console.log("MainSale: ", MainSaleInst.address);
                        startIco(MainSaleInst)
                            .then(function(res){})
                            .catch(function(err){
                                    console.error(err);
                                });
                    });
            }
        }).catch(function(err){
            console.error(err);
        });
    });

module.exports = function (deployer) {}
