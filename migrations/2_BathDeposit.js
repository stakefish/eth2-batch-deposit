const DepositContract = artifacts.require("DepositContract");
const BatchDeposit = artifacts.require("BatchDeposit");

// 1 gwei
const initialFee = 1000000000;

module.exports = function (deployer) {
  deployer.deploy(DepositContract).then(function () {
    return deployer.deploy(BatchDeposit, DepositContract.address, initialFee);
  });
};
