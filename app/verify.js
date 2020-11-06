var ShrTokenContract = artifacts.require('./ShareToken.sol');

global.artifacts = artifacts;
global.web3 = web3;

const fs = require('fs');
var dateFormat = require('dateformat');

// Prepare the list of data files
var dataset = [];
try {
    fs.readdirSync(global.DATA_FOLDER).forEach(filename => {
        var file = global.DATA_FOLDER + '/' + filename;
        console.log('Required file: ' + file);
        dataset.push({
            file: file,
            dat: require(file)     
        });
    });
}
catch (err) {
    console.log(err);
}

var printInfo = function(file) {
    var ts = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
    console.log("------------------------------------" + 
                "\nTime: " + ts +
                "\nData file: " + file
    );
}

var veriSync = function(ShrTokenInst, i) {
    
    return new Promise(function(resolve, reject) {

        if (i >= dataset.length) {
            console.log("\nDone\n");
            resolve(true);
        }

        var myData = dataset[i];

        printInfo(myData.file);

        var cntMisMatch = 0;

        for (var j = 0; j < myData.dat.addrList.length; j++) {
            var addr = myData.dat.addrList[j];

            var done = false;

            try {
                ShrTokenInst.balanceOf(addr). 
                    then(function(res){
                        var returnedTokens = res.c[0];
                        var tokens = myData.dat.tokenList[j];

                        if (tokens != returnedTokens) {
                            console.error("Mismatched tokens (addr: " +
                                addr + ", expectedTokens: " + tokens + 
                                ", returnedTokens: " +  returnedTokens);
                            cntMisMatch++;
                        }

                        done = true;
                    }).catch(function(err){
                        console.error(err);
                        done = true;
                    });
            } 
            catch (err) {
                console.error(err);
                done = true;
            }

            require('deasync').loopWhile(function(){return !done;});
        }

        console.log("Verified ..... with " + cntMisMatch + " mismatch");

        veriSync(ShrTokenInst, i+1);
    });
}

ShrTokenContract.at(global.SHARE_TOKEN_CONTRACT_ADDR).
    then(function(instance){
        var ShrTokenInst = instance;
        var ts = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
        console.log("Time: " + ts);
        console.log("ShareToken: ", ShrTokenInst.address);
        console.log("Total number of data files: " + dataset.length);

        veriSync(ShrTokenInst, 0);
    });

module.exports = function (deployer) {}
