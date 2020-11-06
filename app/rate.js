var MainSaleContract = artifacts.require('./MainSale.sol');
var request = require('request');
var utils = require('./utils');

global.artifacts = artifacts;
global.web3 = web3;

const URL = 'https://api.gdax.com/products/ETH-USD/ticker';

var requestGdax = function () {
    return new Promise(function (resolve, reject) {
        var options = {
            url: URL,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
            }
        }
        request.get(options, (er, res, body) => {
            if (er) return resolve(null);
            if (!utils.isJSON(body)) return resolve(null);
            var body = JSON.parse(body);
            if (!body.price) return resolve(null);

            var info = body.price;
            var price = parseFloat(info);
            return resolve(price);
        });
    });
}

var updateRate = function(MainSaleInst) {

    return new Promise(function(resolve, reject) {
        console.log("updateRate running ....");
        var rate = 0;
        requestGdax().
            then(function(res) {
                rate = res * 100; // converted into cent

                if (rate != 0) {
                    console.log("New ETH/USD rate (in cent): " + rate);
                    var done = false;
                    try {
                        MainSaleInst.setEthUsdRateInCent(rate). 
                            then(function(tx){
                                console.log("Tx: ", tx.tx, 
                                            "\nBlock: " + tx.receipt.blockNumber +
                                            ", gasUsed: " + tx.receipt.gasUsed);
                                            
                                console.log("Updated ETH/USD rate: " + rate);
                                done = true;
                                resolve(true);
                            }).catch(function(err){
                                console.error(err);
                                done = true;
                                resolve(false);
                            });
                    } 
                    catch (err) {
                        console.error(err);
                        done = true;
                        resolve(false);
                    }
                }

                require('deasync').loopWhile(function(){return !done;});

                console.log("Waiting for next update ...");

                // Update for every 1 hour
                require('sleep').sleep(60*60); // seconds

                updateRate(MainSaleInst);
            }).catch(function(err){
                console.error(err);
                resolve(false);
            });
    });
}

MainSaleContract.at(global.MAIN_SALE_CONTRACT_ADDR).
    then(function(instance){
        var MainSaleInst = instance;
        console.log("MainSale: ", MainSaleInst.address);
        updateRate(MainSaleInst).then(function(res){});
});

module.exports = function (deployer) {}
