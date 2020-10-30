var BatchDeposit = artifacts.require("BatchDeposit");
const assert = require("chai").assert;
const truffleAssert = require("truffle-assertions");

// 1 gwei fee
const fee = web3.utils.toWei("1", "gwei");

// Fake deposits
var fakeData = {
  pubkeys:
    "0xb397443cf61fbb6286550d9ef9b58a033deeb0378fe504ec09978d94eb87aedea244892853b994e27d6f77133fce723ea50e1dfc528fe61d7c0b3bc118f94e7090e1b0b80328a8ec66783cecd74d3fc51459c76f2940dc905b9a32b34220945b881e7056817dce7ac795b592f309c7b681ea7e5eadc5cfd39871112b69103e396ce91d0a3a9a333cb4f213ed43add094",
  creds: "0x00e53ca56e7f6412ca6024989d8a37cb0520d70d7e3472bf08fc629816603b5c",

  signatures:
    "0xa45d0dd7c44a73209d2377fbc3ded47e5af5ee38ade2e08c53551dd34b98248b8a1e1feb1912fb024033435927d47ad70adf10b1ee4a65bfc8ae1501962dee655bfeb5cefdff3389c2d9eadcc6fdc4e8ed340f0414b684168146c15aa4edbfeda84fdfaceb817187a4436a8deafa6071bb32ae2510224d2423298de9e15a61dcdbbed42b1afded00c8ce5e8c02a8ba7b01b31a9a19e2fdb8b5c57859a481ffdd946271ca019b76b47cead66b05b8fd3422bbbeaf719da75f3d2e67bd215ae954829b742e94203e5df52403bbd07a119abc67fa0b14326de99997f4619d3d62fbf122027a71fc6bae13f402380658fa32008d5c43b121a46d8417e99556f95c129da2763ab44ad4d9c657c8a59d1fe1783d732b2a28d77efc42bc648cf8cf21c1",

  dataRoots: [
    "0x2c16c5739ec31a951e5551e828ef57ee2d6944b36cf674db9f884173289c7946",
    "0xae358f6ef71c4eaa96cbb68b6e8e304c2348cce8f53424409a5bd76f29d357f3",
    "0xb2bd009079582e1f6992c04773c867bf39ce1cfb9edd56ca22d7889f2eba508b",
  ],
};

contract("BatchDeposit", async (accounts) => {
  it("can perform multiple deposits in one tx", async () => {
    let contract = await BatchDeposit.deployed();

    var amountEth = web3.utils.toBN(32 * 3);
    var amountWei = new web3.utils.BN(web3.utils.toWei(amountEth, "ether"));

    var stakefishFee = new web3.utils.BN(fee).mul(
      // web3.utils.toBN(fakeData.pubkeys.length)
      web3.utils.toBN("3")
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
