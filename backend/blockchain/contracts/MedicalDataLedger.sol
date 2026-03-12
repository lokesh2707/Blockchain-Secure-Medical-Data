// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MedicalDataLedger {

    struct MedicalRecord {
        address owner;
        string dataHash;
        uint256 timestamp;
    }

    mapping(bytes32 => MedicalRecord) private records;
    mapping(bytes32 => mapping(address => bool)) private accessPermissions;

    event RecordAdded(bytes32 indexed recordId, address indexed owner, string dataHash);
    event AccessGranted(bytes32 indexed recordId, address indexed grantedTo);
    event AccessRevoked(bytes32 indexed recordId, address indexed revokedFrom);

    function addMedicalRecord(string calldata dataHash) external returns (bytes32) {
        bytes32 recordId = keccak256(abi.encodePacked(msg.sender, dataHash, block.timestamp));
        records[recordId] = MedicalRecord(msg.sender, dataHash, block.timestamp);
        accessPermissions[recordId][msg.sender] = true;
        emit RecordAdded(recordId, msg.sender, dataHash);
        return recordId;
    }

    function grantAccess(bytes32 recordId, address user) external {
        require(records[recordId].owner == msg.sender, "Not owner");
        accessPermissions[recordId][user] = true;
        emit AccessGranted(recordId, user);
    }

    function revokeAccess(bytes32 recordId, address user) external {
        require(records[recordId].owner == msg.sender, "Not owner");
        accessPermissions[recordId][user] = false;
        emit AccessRevoked(recordId, user);
    }

    function getRecord(bytes32 recordId) external view returns (
        address owner,
        string memory dataHash,
        uint256 timestamp
    ) {
        require(accessPermissions[recordId][msg.sender], "Access denied");
        MedicalRecord memory record = records[recordId];
        return (record.owner, record.dataHash, record.timestamp);
    }

    function hasAccess(bytes32 recordId, address user) external view returns (bool) {
        return accessPermissions[recordId][user];
    }
}
