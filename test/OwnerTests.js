var BatchDeposit = artifacts.require("BatchDeposit");
const assert = require("chai").assert;
const truffleAssert = require("truffle-assertions");

// 1 gwei fee
const fee = web3.utils.toWei("1", "gwei");

contract("BatchDeposit", async (accounts) => {
  it("initial fee should be 1 gwei", async () => {
    let contract = await BatchDeposit.deployed();

    var currentFee = await contract.fee();

    assert.equal(currentFee, "1000000000");
  });

  it("should change fee", async () => {
    let contract = await BatchDeposit.deployed();

    var currentFee = await contract.fee();
    var newFee = new web3.utils.BN(web3.utils.toWei("1", "ether"));

    let res = await contract.changeFee(newFee, {
      from: accounts[0],
    });

    assert.equal(
      res.receipt.rawLogs.length,
      1,
      "events are not 1 as expected!"
    );

    var updatedFee = await contract.fee();

    assert.equal(
      newFee.toString(),
      updatedFee.toString(),
      "new fee is not set correctly"
    );

    assert.notEqual(
      currentFee.toString(),
      updatedFee.toString(),
      "new fee is not set correctly"
    );
  });

  it("should not change fee", async () => {
    let contract = await BatchDeposit.deployed();

    var newFee = new web3.utils.BN(web3.utils.toWei("2", "ether"));

    await truffleAssert.reverts(
      contract.changeFee(newFee, {
        from: accounts[2],
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("should not renounce ownership", async () => {
    let contract = await BatchDeposit.deployed();

    await truffleAssert.reverts(
      contract.renounceOwnership({ from: accounts[0] }),
      "Ownable: renounceOwnership is disabled"
    );
  });
});
