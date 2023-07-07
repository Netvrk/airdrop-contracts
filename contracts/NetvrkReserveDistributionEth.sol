// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

contract NetvrkReserveDistributionEth is
    ContextUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using MerkleProofUpgradeable for bytes32[];
    using AddressUpgradeable for address;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    uint256 public snapshotIndex;
    mapping(uint256 => mapping(address => bool)) private claimed;

    struct Snapshot {
        uint256 id;
        uint256 reward;
        uint256 totalClaimed;
        bytes32 merkleRoot;
    }

    mapping(uint256 => Snapshot) public snapshots;

    function initialize(address manager) public initializer {
        __UUPSUpgradeable_init();
        __Context_init_unchained();
        __ReentrancyGuard_init_unchained();
        __AccessControl_init_unchained();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MANAGER_ROLE, manager);

        snapshotIndex = 0;
    }

    function createAirdrop(
        bytes32 merkleRoot
    ) public payable onlyRole(MANAGER_ROLE) {
        require(msg.value > 0, "NO_FUNDS");
        require(merkleRoot != bytes32(0), "INVALID_MERKLE_ROOT");
        snapshotIndex++;
        snapshots[snapshotIndex] = Snapshot(
            snapshotIndex,
            address(this).balance,
            0,
            merkleRoot
        );
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
                !claimed[snapshotIndex][recipients[idx]],
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
        require(address(this).balance >= totalAmount, "INSUFFICIENT_FUNDS");

        for (uint256 i = 0; i < recipients.length; i++) {
            claimed[snapshotIndex][recipients[i]] = true;
            snapshots[snapshotIndex].totalClaimed += amounts[i];
            payable(recipients[i]).transfer(amounts[i]);
        }
    }

    // UUPS proxy function
    function _authorizeUpgrade(
        address
    ) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
