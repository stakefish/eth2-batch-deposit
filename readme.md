# Batch Deposit Contract

[![pipeline status](https://gitlab.fish/stakefish/eth2-batch-deposit/badges/master/pipeline.svg)](https://gitlab.fish/stakefish/eth2-batch-deposit/-/commits/master) [![coverage report](https://gitlab.fish/stakefish/eth2-batch-deposit/badges/master/coverage.svg)](https://gitlab.fish/stakefish/eth2-batch-deposit/-/commits/master)

This contract enables depositing to the ETH2 Deposit Contract multiple times in a single transaction.

## Setup

This project uses [Hardhat](https://hardhat.org/).

1. Clone the repository
1. `npm install`

## Usage

### Compile

```sh
npx hardhat compile
```

### Test

Run the full test suite against the built-in Hardhat network:

```sh
npm test
# or
npx hardhat test
```

### Local node

Start a local Hardhat node, then deploy or interact with it:

```sh
npx hardhat node
```

### Deploy

Deployment is handled by `scripts/deploy.js`, which deploys `BatchDeposit`,
waits for confirmations, and verifies the contract on Etherscan. Supported
networks are configured in `hardhat.config.js` (`mainnet`, `hoodi`, `holesky`).

```sh
npx hardhat run scripts/deploy.js --network <network>
```

The script reads RPC URLs, private keys, and the Etherscan API key from
environment variables (see `.env`):

- `MAINNET_RPC_URL` / `MAINNET_PRIVATE_KEY`
- `HOODI_RPC_URL` / `HOODI_PRIVATE_KEY`
- `HOLESKY_RPC_URL` / `HOLESKY_PRIVATE_KEY`
- `ETHERSCAN_API_KEY`

## Functional tests

The supported assertion libraries are the [chai](https://www.chaijs.com/)
assertion library and [hardhat-chai-matchers](https://hardhat.org/hardhat-chai-matchers/docs/overview)
(bundled with `@nomicfoundation/hardhat-toolbox`). Tests are written with
[Mocha](https://mochajs.org/).

You can find the tests under the `test` folder and run them all with `npm test`.

## Code coverage

Run code coverage with:

```sh
npm run coverage
# or
npx hardhat coverage
```

## Formatting

```sh
npm run format
```

## Use older version of solidity

Refer to https://github.com/crytic/solc-select

## Security testing

Refer to https://github.com/crytic/slither
