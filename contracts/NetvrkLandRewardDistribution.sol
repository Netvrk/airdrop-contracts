// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NetvrkLandRewardDistribution is
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using MerkleProofUpgradeable for bytes32[];

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    // Reward token
    IERC20 public rewardToken;

    uint256 public snapshotIndex;

    struct Claimed {
        uint256 id;
        uint256 reward;
        bool claimed;
    }

    mapping(address => mapping(uint256 => Claimed)) public claimed;

    struct Snapshot {
        uint256 id;
        uint256 reward;
        uint256 totalClaimed;
        bytes32 merkleRoot;
    }

    mapping(uint256 => Snapshot) public snapshots;

    function initialize(
        IERC20 _rewardToken,
        address _manager
    ) public initializer {
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init_unchained();
        __AccessControl_init_unchained();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MANAGER_ROLE, _manager);

        rewardToken = _rewardToken;
        snapshotIndex = 0;
    }

    function createAirdrop(
        bytes32 merkleRoot,
        uint256 reward
    ) public onlyRole(MANAGER_ROLE) {
        require(reward > 0, "NO_FUNDS");
        require(merkleRoot != bytes32(0), "INVALID_MERKLE_ROOT");
        snapshotIndex++;

        // Transfer reward to this contract
        rewardToken.transferFrom(msg.sender, address(this), reward);

        snapshots[snapshotIndex] = Snapshot(
            snapshotIndex,
            reward,
            0,
            merkleRoot
        );
    }

    function updateAirdrop(
        bytes32 merkleRoot,
        uint256 reward
    ) public onlyRole(MANAGER_ROLE) {
        require(merkleRoot != bytes32(0), "INVALID_MERKLE_ROOT");
        // Transfer reward to this contract
        if (reward > 0) {
            rewardToken.transferFrom(msg.sender, address(this), reward);
            snapshots[snapshotIndex].reward =
                snapshots[snapshotIndex].reward +
                reward;
        }
        snapshots[snapshotIndex].merkleRoot = merkleRoot;
    }

    function batchAirdrop(
        address[] memory recipients,
        uint256[] memory amounts,
        bytes32[][] memory merkleProofs
    ) external nonReentrant onlyRole(MANAGER_ROLE) {
        require(recipients.length == amounts.length, "INVALID_INPUT_LENGTHS");
        require(
            recipients.length == merkleProofs.length,
            "INVALID_INPUT_LENGTHS"
        );

        uint256 totalAmount = 0;
        for (uint256 idx = 0; idx < recipients.length; idx++) {
            require(
                !claimed[recipients[idx]][snapshotIndex].claimed,
                "ALREADY_CLAIMED"
            );
            require(
                MerkleProofUpgradeable.verify(
                    merkleProofs[idx],
                    snapshots[snapshotIndex].merkleRoot,
                    keccak256(abi.encodePacked(recipients[idx], amounts[idx]))
                ),
                "USER_NOT_WHITELISTED"
            );
            totalAmount += amounts[idx];
        }
        require(
            rewardToken.balanceOf(address(this)) >= totalAmount,
            "INSUFFICIENT_FUNDS"
        );

        for (uint256 idx = 0; idx < recipients.length; idx++) {
            claimed[recipients[idx]][snapshotIndex] = Claimed(
                snapshotIndex,
                amounts[idx],
                true
            );
            snapshots[snapshotIndex].totalClaimed += amounts[idx];
            // Transfer reward to user
            rewardToken.transfer(recipients[idx], amounts[idx]);
        }
    }

    // Withdraw all tokens from contract by owner
    function withdrawFunds(
        address treasury
    ) external virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 _amount = rewardToken.balanceOf(address(this));
        require(_amount > 0, "ZERO_BALANCE");
        rewardToken.transfer(treasury, _amount);
    }

    // UUPS proxy function
    function _authorizeUpgrade(
        address
    ) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
