var BatchDeposit = artifacts.require("BatchDeposit");
const assert = require("chai").assert;
const truffleAssert = require("truffle-assertions");

// 1 gwei fee
const fee = web3.utils.toWei("1", "gwei");

contract("BatchDeposit", async (accounts) => {
  it("should not pause contract", async () => {
    let contract = await BatchDeposit.deployed();

    await truffleAssert.reverts(
      contract.pause({
        from: accounts[2],
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("should pause the contract", async () => {
    let contract = await BatchDeposit.deployed();

    var res = await contract.pause({ from: accounts[0] });

    assert.equal(
      res.receipt.rawLogs.length,
      1,
      "events are not 1 as expected!"
    );

    var paused = await contract.paused();
    assert.equal(paused, true, "contract is not paused");
  });

  it("should not deposit if contract is paused", async () => {
    let contract = await BatchDeposit.deployed();

    await truffleAssert.reverts(
      contract.batchDeposit(
        ["0x00000", "0x00000"],
        "0x00000",
        ["0x00000", "0x00000"],
        ["0x00000", "0x00000"],
        {
          value: "1000000000000",
          from: accounts[1],
        }
      ),
      "Pausable: paused"
    );
  });

  it("should not unpause contract", async () => {
    let contract = await BatchDeposit.deployed();

    await truffleAssert.reverts(
      contract.unpause({
        from: accounts[2],
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("should unpause the contract", async () => {
    let contract = await BatchDeposit.deployed();

    var res = await contract.unpause({ from: accounts[0] });

    assert.equal(
      res.receipt.rawLogs.length,
      1,
      "events are not 1 as expected!"
    );

    var paused = await contract.paused();
    assert.equal(paused, false, "contract is not paused");
  });
});
