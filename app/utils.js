var request = require('request');

const ERROR = 'Error';

/**
 * Declare class
 * @class Utils
 */
var Utils = function () {}

Utils.unlock = function (address, password, callback) {
    console.log('unlock - addr: ' + address + ', password: ' + password);
    web3.personal.unlockAccount(address, password, function (er, re) {
        if (!er) {
            return callback(true);
        }
        else {
            console.log('unlock failed, err: ' + er);
            return callback(false);
        } 
    });
}

Utils.isAddress = function (address) {
    try {
        return web3.isAddress(address);
    } catch (er) {
        return false;
    }
}

Utils.isJSON = function (s) {
    try {
        JSON.parse(s);
        return true;
    } catch (e) {
        return false;
    }
}

Utils.parseJSON = function (s) {
    try {
        s = JSON.parse(s);
        return s;
    } catch (e) {
        return null;
    }
}

Utils.httpGet = function (router, callback) {
    var self = this;
    request.get(router, (er, res, body) => {
        if (er) return callback(er, null);
        if (!self.isJSON(body)) return callback(ERROR, null);
        body = JSON.parse(body);
        return callback(null, body);
    });
}

Utils.sortArray = function (array, key, decrease) {
    return array.sort(function (a, b) {
        if (decrease) return b[key] - a[key];
        return a[key] - b[key];
    });
}

Utils.getGasPrice = function () {
    const GAS_STATION_URL = 'https://ethgasstation.info/json/predictTable.json';
    const CARED_KEY = 'expectedWait';
    const RETURNED_KEY = 'gasprice';
    const UNDER = 2 // blocks;

    return new Promise(function(resolve, reject) {
        Utils.httpGet(GAS_STATION_URL, function (er, re) {
            if (er) {
                reject(null);
            } else {
                Utils.sortArray(re, CARED_KEY, true);
                while (re.length > 0 && re[0][CARED_KEY] > UNDER) re.shift();
                if (re.length == 0) reject(null);
                var res = (re[0][RETURNED_KEY] * (10 ** 9)).toString();
                resolve(res);
            }
        });
    });
}

Utils.getNonce = function (address, status) {
    return new Promise(function(resolve, reject) {
        var actualStatus = status || 'latest';
        web3.eth.getTransactionCount(address, actualStatus, function(error, result) {
            if (!error) {
                resolve(result);
            } else {
                reject(null);
            }
        });
    });
}

Utils.getBlockNumber = function () {
    try {
        return web3.eth.blockNumber;
    } catch (er) {
        return null;
    }
}

module.exports = Utils;