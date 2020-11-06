const HDWalletProvider = require('@truffle/hdwallet-provider');
const privateKey = '';

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*",
            gas: 4612388
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
            gas: 0xfffffffffff, // <-- Use this high gas value
            gasPrice: 0x01      // <-- Use this low gas price
        },
        rinkeby: {
            provider: function () {
                return new HDWalletProvider(
                    privateKey,
                    'https://rinkeby.infura.io/v3/'
                );
            },
            gasPrice: 9000000000,
            network_id: '*',
            gas: 6000000,
        },
    },
    mocha: {
        reporter: 'eth-gas-reporter',
        reporterOptions : {
            currency : 'USD',
            coinmarketcap: 'f08c6759-908a-4031-b6a1-8cd3d708359e',
            gasPrice: 130,
        } // See options below
    },
    plugins: ["solidity-coverage"],
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
    compilers: {
        solc: {
            version: "0.4.26"
        }
    }
};