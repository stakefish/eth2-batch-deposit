# Batch Deposit Contract

This contract enable to deposit to the ETH2 Deposit Contract multiple times in a single transaction.

## Usage

You can test the contract on both goerli testnet or in your local development environment.

### Test on your local blockchain

1. Clone the repository
1. Install [Ganache](https://www.trufflesuite.com/ganache) and [Truffle](https://www.trufflesuite.com/truffle)
1. Run ganache and quick start an empty workspace
1. Tun `truffle deploy` to compile & deploy, or just `truffle test` to compile, deploy and test automatically.

### Test on Goerli

1. Get some funds from the [faucet](https://faucet.goerli.mudit.blog/)
1. Replace mnemonic in `./scripts/test_goerli.js`
1. Replace fake data with some real eth2 validator informations
1. Check if the smart contract address is correct
1. Run the script with `cd scripts && node test_goerli.js`

### Functional tests

Assertion libraries supported are [chai](https://www.chaijs.com/) assertion library and [truffle-assertions](https://github.com/rkalis/truffle-assertions). Tests are written with [Mocha](https://mochajs.org/).

You can find test under `tests` folder and run all the tests using `truffle test` command

## Deploy

To deploy in production is reccomended to use Remix IDE, expected gas usage is around `492,831`.
