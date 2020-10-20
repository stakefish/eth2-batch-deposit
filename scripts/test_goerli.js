const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");

let provider = new HDWalletProvider({
  mnemonic: {
    phrase: "write your mnemonic",
  },
  providerOrUrl: "https://goerli.infura.io/v3/f52bd8e7578c435c978ab9cf68cd3a18",
});

const web3 = new Web3(provider);

// Fake deposits
var fakeData = {
  pubkeys: [
    "0x8f06be4bb07ced404c2d819c7d05fc19e8521d1f3c8742eabe4ea8883061f579040aa8dca5e153a97dadd004e468ad76",
    "0xa8720ef83e76e4b4d7399129287e7429998d3c80986574a49feba2bf1f08b84dab938d4c6d4f354fae03250a51df8191",
    //   "0x828f943e46fc8d6d16f374bdae1abee60f460e7a4e8532dbadd6a8cf6a1b503ed03c0318e0a98e5ff1f8ba9b315efb1c",
  ],

  creds: [
    "0x0013225522b595b844bc78c56bf5c9cd3450ced5bd85729ea9e5068bff383707",
    "0x00d300ca1f929c11475897de39b85959165462e1b9fc04f243f4ff07a625fa34",
    //   "0x008d1e33741a3b42a464dfd4f97b71377293101c9f78d99c51a5f82d6e6ea3ac",
  ],

  signatures: [
    "0xb83011d45b946646daa052c321130f7092cf2cbdc8818c7546a39ec40547ee4d0610dc6e243ac68b56a703938ad40f3e149f2d1dfa743ea48c7f375adc6222419f6924663ccbf72fdb30116980f482373f8bc510da69ab17fd8819ef6a2ca517",
    "0x8046287ca9b46aa5d59b06b83837fcac57084d2192fc74225b36d18a8fccc532c683fc9337649b8294c428f6643819d1038827e31dd0b90a958647cd4105c8358ec351f8d3fd5145f25687c30e7ff8f4661477926518e31e7a95434c9742fcdf",
    //   "0xa1e2f6279b84318c19bf8e1126cc48220158f182e39bc0d3e3e1d56cd4733fd8cf3f37b871aeb6efbfed074dcbdca1c908f1ac71d8da562fbab13cb74f161fb9f2c9da795c6a2ad9e3dea853f409008bace21b90700797405831b53750712290",
  ],

  dataRoots: [
    "0x85770fba05c90af9f450e2b84f39de806a554452e71bbadd000e5b31b6c4f8f4",
    "0xd52be80f9bbde54cf923b1ccbfd0d14fb592e4ad23e5cea294648586f6bfb06a",
    //   "0x7f5d997b6f6d10e15c0a5b798bfeedbef6b13203fe16c696e89b719b458267e3",
  ],
};

const batching_abi = require("../build/contracts/BatchDeposit.json");
const batching_address = "0x6652780fd987ba19fb53bc36166ac3f3888841da";

const batching_contract = new web3.eth.Contract(
  batching_abi.abi,
  batching_address
);

async function main() {
  try {
    const accounts = await web3.eth.getAccounts();

    const ether = (n) => new web3.utils.BN(web3.utils.toWei(n, "ether"));

    const depositAmount = ether(web3.utils.toBN(32 * fakeData.pubkeys.length));
    const fee = web3.utils.toBN("1000000000");
    const value = depositAmount.add(
      fee.mul(web3.utils.toBN(fakeData.pubkeys.length))
    );
    const gas_price = await web3.eth.getGasPrice();
    const gas_price_scalar = 2;
    const tx = await batching_contract.methods
      .batchDeposit(
        fakeData.pubkeys,
        fakeData.creds,
        fakeData.signatures,
        fakeData.dataRoots
      )
      .send({
        from: accounts[0],
        value: value,
        gasPrice: gas_price * gas_price_scalar,
        gas: 7999999,
      });

    console.log(tx.receipt);
    return tx;
  } catch (error) {
    console.log(error);
  }
}

main();
provider.engine.stop();
