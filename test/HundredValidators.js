/*
  This is disabled because hard to implement in the pipeline. To run it manually:
  npx ganache-cli --defaultBalanceEther 35000 -l 8000000
  truffle test --network coverage
*/

// var BatchDeposit = artifacts.require("BatchDeposit");
// const assert = require("chai").assert;
// const truffleAssert = require("truffle-assertions");

// // 1 gwei fee
// const fee = web3.utils.toWei("1", "gwei");

// // Fake deposits
// var fakeData = {
//   pubkey:
//     "b397443cf61fbb6286550d9ef9b58a033deeb0378fe504ec09978d94eb87aedea244892853b994e27d6f77133fce723e",

//   creds: "0x00e53ca56e7f6412ca6024989d8a37cb0520d70d7e3472bf08fc629816603b5c",

//   signature:
//     "a45d0dd7c44a73209d2377fbc3ded47e5af5ee38ade2e08c53551dd34b98248b8a1e1feb1912fb024033435927d47ad70adf10b1ee4a65bfc8ae1501962dee655bfeb5cefdff3389c2d9eadcc6fdc4e8ed340f0414b684168146c15aa4edbfed",

//   dataRoots:
//     "0x2c16c5739ec31a951e5551e828ef57ee2d6944b36cf674db9f884173289c7946",
// };

// contract("BatchDeposit", async (accounts) => {
//   it("can deposit 100 validators in one shot", async () => {
//     let contract = await BatchDeposit.deployed();

//     var amountEth = web3.utils.toBN(32 * 100);
//     var amountWei = new web3.utils.BN(web3.utils.toWei(amountEth, "ether"));

//     var stakefishFee = new web3.utils.BN(fee).mul(
//       // web3.utils.toBN(fakeData.pubkeys.length)
//       web3.utils.toBN("100")
//     );

//     amountWei = amountWei.add(stakefishFee);

//     var pubkeys = "0x";
//     var signatures = "0x";
//     var dataRoots = [];

//     for (var i = 0; i < 100; i++) {
//       pubkeys += fakeData.pubkey;
//       signatures += fakeData.signature;
//       dataRoots.push(fakeData.dataRoots);
//     }

//     let res = await contract.batchDeposit(
//       pubkeys,
//       fakeData.creds,
//       signatures,
//       dataRoots,
//       {
//         value: amountWei,
//         from: accounts[1],
//       }
//     );

//     assert.equal(
//       res.receipt.rawLogs.length,
//       101,
//       "events are not 101 as expected!"
//     );

//     // Check that we have fee in the contract balance
//     assert.equal(
//       await web3.eth.getBalance(contract.address),
//       stakefishFee,
//       "fee was not collected by the smart contract"
//     );
//   });
// });
