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

var runSync = function(ShrTokenInst, i) {
    if (i >= dataset.length) {
        return;
    }

    var myData = dataset[i];
    try {
        ShrTokenInst.setMany(myData.dat.addrList). 
            then(function(tx){
                printInfo(myData.file);
                console.log("Tx: ", tx.tx, 
                            "\nBlock: " + tx.receipt.blockNumber +
                            ", gasUsed: " + tx.receipt.gasUsed);

                runSync(ShrTokenInst, i+1);
            }).catch(function(err){
                printInfo(myData.file);
                console.error(err);
                runSync(ShrTokenInst, i+1);
            });
    } 
    catch (err) {
        printInfo(myData.file);
        console.error(err);
        runSync(ShrTokenInst, i+1);
    }
}

ShrTokenContract.at(global.SHARE_TOKEN_CONTRACT_ADDR).
    then(function(instance){
        var ShrTokenInst = instance;
        var ts = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
        console.log("Time: " + ts);
        console.log("ShareToken: ", ShrTokenInst.address);
        console.log("Total number of data files: " + dataset.length);

        runSync(ShrTokenInst, 0);
    });

module.exports = function (deployer) {}
