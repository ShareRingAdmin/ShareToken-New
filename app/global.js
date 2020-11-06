var Global = function () {}

Global.globalize = function () {

    var env = process.env.NODE_ENV;

    global.DATA_FOLDER = "./data/output";

    if (env === 'rinkeby' || env === 'ropsten') {
        
        console.log("Environment: " + env);

        global.OWNER_ADDR = "0x175FeA8857f7581B971C5a41F27Ea4BB43356298";

        global.PRIV_KEY = "c548e41cdc3f372995820c3d52fc470b2b380e1bce2a86be017b50e2f2fe82ee";

        global.SHARE_TOKEN_CONTRACT_ADDR = "0x35b8136eec3e6532ab24925df3020bb770761e2f";

        global.MAIN_SALE_CONTRACT_ADDR = "0x255381e22026f5cadff160f283361a3f0c93614b";

        // Go to https://rinkeby.etherscan.io, select the latest successful transaction and pick up its gasLimit
        global.GAS_LIMIT = 4000000;
    }
    else if (env === 'mainnet') {

        console.log("Environment: " + env);

        global.OWNER_ADDR = "";

        global.PRIV_KEY = "";

        global.SHARE_TOKEN_CONTRACT_ADDR = "";

        global.MAIN_SALE_CONTRACT_ADDR = "";

        // Go to https://etherscan.io, select the latest successful transaction and pick up its gasLimit
        global.GAS_LIMIT = 21000;
    }
    else if (env === 'development') {

        console.log("Environment: " + env);

        global.OWNER_ADDR = "";

        global.PRIV_KEY = "";

        global.SHARE_TOKEN_CONTRACT_ADDR = "";

        global.MAIN_SALE_CONTRACT_ADDR = "";
    }
    else {
        // This is not error case because for example, build is not dependent on environment
    }
}

module.exports = Global;
