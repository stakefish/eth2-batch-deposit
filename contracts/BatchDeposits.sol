
//                                                                           ,,---.
//                                                                         .-^^,_  `.
//                                                                    ;`, / 3 ( o\   }
//         __             __                     ___              __  \  ;   \`, /  ,'
//        /\ \__         /\ \                  /'___\ __         /\ \ ;_/^`.__.-"  ,'
//    ____\ \ ,_\    __  \ \ \/'\      __     /\ \__//\_\    ____\ \ \___     `---'
//   /',__\\ \ \/  /'__`\ \ \ , <    /'__`\   \ \ ,__\/\ \  /',__\\ \  _ `\
//  /\__, `\\ \ \_/\ \L\.\_\ \ \\`\ /\  __/  __\ \ \_/\ \ \/\__, `\\ \ \ \ \
//  \/\____/ \ \__\ \__/.\_\\ \_\ \_\ \____\/\_\\ \_\  \ \_\/\____/ \ \_\ \_\
//   \/___/   \/__/\/__/\/_/ \/_/\/_/\/____/\/_/ \/_/   \/_/\/___/   \/_/\/_/

// stakefish ETH2 Batch Deposit contract
// this contract allows deposit of multiple validators in one tx
// and also collects the validator fee for stakefish

// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.6.8;

// Needed for multi dimension arrays
pragma experimental ABIEncoderV2;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";

// Deposit contract interface
interface IDepositContract {
    /// @notice A processed deposit event.
    event DepositEvent(
        bytes pubkey,
        bytes withdrawal_credentials,
        bytes amount,
        bytes signature,
        bytes index
    );

    /// @notice Submit a Phase 0 DepositData object.
    /// @param pubkey A BLS12-381 public key.
    /// @param withdrawal_credentials Commitment to a public key for withdrawals.
    /// @param signature A BLS12-381 signature.
    /// @param deposit_data_root The SHA-256 hash of the SSZ-encoded DepositData object.
    /// Used as a protection against malformed input.
    function deposit(
        bytes calldata pubkey,
        bytes calldata withdrawal_credentials,
        bytes calldata signature,
        bytes32 deposit_data_root
    ) external payable;

    /// @notice Query the current deposit root hash.
    /// @return The deposit root hash.
    function get_deposit_root() external view returns (bytes32);

    /// @notice Query the current deposit count.
    /// @return The deposit count encoded as a little endian 64-bit number.
    function get_deposit_count() external view returns (bytes memory);
}

contract BatchDeposit is Ownable {
    using SafeMath for uint256;
    uint constant GWEI = 1e9;

    address depositContract;
    uint256 private _fee;

    event FeeChanged(uint256 previousFee, uint256 newFee);
    event Withdrawn(address indexed payee, uint256 weiAmount);
    event FeeCollected(address indexed payee, uint256 weiAmount);

    constructor(address depositContractAddr, uint256 initialFee) public {
        require(initialFee % GWEI == 0, "Fee must be a multiple of GWEI");

        depositContract = depositContractAddr;
        _fee = initialFee;
    }

    /**
     * @dev Change the validator fee (`newOwner`).
     * Can only be called by the current owner.
     */
    function changeFee(uint256 newFee) public onlyOwner {
        require(newFee != _fee, "Fee must be different from current one");
        require(newFee % GWEI == 0, "Fee must be a multiple of GWEI");

        emit FeeChanged(_fee, newFee);
        _fee = newFee;
    }

    /**
     * @dev Returns the current fee
     */
    function fee() public view returns (uint256) {
        return _fee;
    }

    /**
     * @dev Withdraw accumulated fee in the contract
     *
     * @param receiver The address where all accumulated funds will be transferred to.
     * Can only be called by the current owner.
    */
    function withdraw(address payable receiver) public virtual onlyOwner {       
        require(receiver != address(0), "You can't burn these eth directly");

        uint256 amount = address(this).balance;
        receiver.transfer(amount);
        emit Withdrawn(receiver, amount);
    }

    /**
    * @dev Performs a batch deposit, asking for an additional fee payment.
    */
    function batchDeposit(
        bytes[] calldata pubkeys, 
        bytes[] calldata withdrawal_credentials, 
        bytes[] calldata signatures, 
        bytes32[] calldata deposit_data_roots
    ) external payable {
        // sanity checks
        require(msg.value % GWEI == 0, "BatchDeposit: deposit value not multiple of gwei");
        require(msg.value >= 32 ether, "BatchDeposit: Amount is too low");
        require(pubkeys.length > 0, "BatchDeposit: You should deposit at least one validator");

        require(pubkeys.length == withdrawal_credentials.length && 
            pubkeys.length == signatures.length && 
            pubkeys.length == deposit_data_roots.length, "BatchDeposit: Inputs lengths are not the same");

        uint256 expectedAmount = _fee.add(32 ether).mul(pubkeys.length);
        require(msg.value == expectedAmount, "BatchDeposit: Amount is not aligned with pubkeys number");

        emit FeeCollected(msg.sender, _fee.mul(pubkeys.length));

        uint256 i = 0;
        while (i < pubkeys.length) { 
            IDepositContract(depositContract).deposit{value: 32 ether}(pubkeys[i], withdrawal_credentials[i], signatures[i], deposit_data_roots[i]);
            i += 1;
        }
    }
}