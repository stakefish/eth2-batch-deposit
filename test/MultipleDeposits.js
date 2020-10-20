var BatchDeposit = artifacts.require("BatchDeposit");
const assert = require("chai").assert;
const truffleAssert = require("truffle-assertions");

// 1 gwei fee
const fee = web3.utils.toWei("1", "gwei");

// Fake deposits
var fakeData = {
  pubkeys: [
    "0x8f06be4bb07ced404c2d819c7d05fc19e8521d1f3c8742eabe4ea8883061f579040aa8dca5e153a97dadd004e468ad76",
    "0xa8720ef83e76e4b4d7399129287e7429998d3c80986574a49feba2bf1f08b84dab938d4c6d4f354fae03250a51df8191",
    "0x828f943e46fc8d6d16f374bdae1abee60f460e7a4e8532dbadd6a8cf6a1b503ed03c0318e0a98e5ff1f8ba9b315efb1c",
  ],

  creds: [
    "0x0013225522b595b844bc78c56bf5c9cd3450ced5bd85729ea9e5068bff383707",
    "0x00d300ca1f929c11475897de39b85959165462e1b9fc04f243f4ff07a625fa34",
    "0x008d1e33741a3b42a464dfd4f97b71377293101c9f78d99c51a5f82d6e6ea3ac",
  ],

  signatures: [
    "0xb83011d45b946646daa052c321130f7092cf2cbdc8818c7546a39ec40547ee4d0610dc6e243ac68b56a703938ad40f3e149f2d1dfa743ea48c7f375adc6222419f6924663ccbf72fdb30116980f482373f8bc510da69ab17fd8819ef6a2ca517",
    "0x8046287ca9b46aa5d59b06b83837fcac57084d2192fc74225b36d18a8fccc532c683fc9337649b8294c428f6643819d1038827e31dd0b90a958647cd4105c8358ec351f8d3fd5145f25687c30e7ff8f4661477926518e31e7a95434c9742fcdf",
    "0xa1e2f6279b84318c19bf8e1126cc48220158f182e39bc0d3e3e1d56cd4733fd8cf3f37b871aeb6efbfed074dcbdca1c908f1ac71d8da562fbab13cb74f161fb9f2c9da795c6a2ad9e3dea853f409008bace21b90700797405831b53750712290",
  ],

  dataRoots: [
    "0x85770fba05c90af9f450e2b84f39de806a554452e71bbadd000e5b31b6c4f8f4",
    "0xd52be80f9bbde54cf923b1ccbfd0d14fb592e4ad23e5cea294648586f6bfb06a",
    "0x7f5d997b6f6d10e15c0a5b798bfeedbef6b13203fe16c696e89b719b458267e3",
  ],
};

contract("BatchDeposit", async (accounts) => {
  it("can perform multiple deposits in one tx", async () => {
    let contract = await BatchDeposit.deployed();

    var amountEth = web3.utils.toBN(32 * 3);
    var amountWei = new web3.utils.BN(web3.utils.toWei(amountEth, "ether"));

    var stakefishFee = new web3.utils.BN(fee).mul(
      web3.utils.toBN(fakeData.pubkeys.length)
    );

    amountWei = amountWei.add(stakefishFee);

    let res = await contract.batchDeposit(
      fakeData.pubkeys,
      fakeData.creds,
      fakeData.signatures,
      fakeData.dataRoots,
      {
        value: amountWei,
        from: accounts[1],
      }
    );

    assert.equal(
      res.receipt.rawLogs.length,
      4,
      "events are not 4 as expected!"
    );

    // Check that we have fee in the contract balance
    assert.equal(
      await web3.eth.getBalance(contract.address),
      stakefishFee,
      "fee was not collected by the smart contract"
    );

    // check owner is account 0
    assert.equal(
      await contract.owner(),
      accounts[0],
      "contract owner is wrong"
    );
  });

  it("should revert if amount is not enough", async () => {
    let contract = await BatchDeposit.deployed();

    var amountEth = web3.utils.toBN(10);
    var amountWei = new web3.utils.BN(web3.utils.toWei(amountEth, "ether"));

    await truffleAssert.reverts(
      contract.batchDeposit(
        fakeData.pubkeys,
        fakeData.creds,
        fakeData.signatures,
        fakeData.dataRoots,
        {
          value: amountWei,
          from: accounts[2],
        }
      ),
      "BatchDeposit: Amount is too low"
    );
  });

  it("should revert if fee is missing", async () => {
    let contract = await BatchDeposit.deployed();

    var amountEth = web3.utils.toBN(32 * 3);
    var amountWei = new web3.utils.BN(web3.utils.toWei(amountEth, "ether"));

    await truffleAssert.reverts(
      contract.batchDeposit(
        fakeData.pubkeys,
        fakeData.creds,
        fakeData.signatures,
        fakeData.dataRoots,
        {
          value: amountWei,
          from: accounts[2],
        }
      ),
      "BatchDeposit: Amount is not aligned with pubkeys number"
    );
  });

  it("should change owner", async () => {
    let contract = await BatchDeposit.deployed();

    // check owner is account 0
    assert.equal(
      await contract.owner(),
      accounts[0],
      "contract owner is wrong"
    );

    // transfer ownershipt to account 2
    let res = await contract.transferOwnership(accounts[2], {
      from: accounts[0],
    });

    // check owner is account 2
    assert.equal(
      await contract.owner(),
      accounts[2],
      "contract owner is not changed"
    );
  });

  it("should not withdraw", async () => {
    let contract = await BatchDeposit.deployed();

    await truffleAssert.reverts(
      contract.withdraw(accounts[6], { from: accounts[1] }),
      "Ownable: caller is not the owner"
    );
  });

  it("should withdraw the fees", async () => {
    let contract = await BatchDeposit.deployed();

    let fees = await web3.eth.getBalance(contract.address);
    let curBal = await web3.eth.getBalance(accounts[6]);

    let res = await contract.withdraw(accounts[6], { from: accounts[2] });
    assert.equal(
      res.receipt.rawLogs.length,
      1,
      "events are not 1 as expected!"
    );

    // Check that we have fee in the contract balance
    assert.equal(
      await web3.eth.getBalance(contract.address),
      0,
      "contract balance is not 0"
    );

    let newBal = await web3.eth.getBalance(accounts[6]);

    let diff = web3.utils.toBN(newBal).sub(web3.utils.toBN(curBal));

    assert.equal(diff.toString(), fees, "eth has not been trasfered");
  });
});
