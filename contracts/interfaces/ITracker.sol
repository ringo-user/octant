// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

interface ITracker {
    function processDeposit(address, uint224, uint224) external;

    function processWithdraw(
        address,
        uint224,
        uint224
    ) external returns (bool, bytes memory);
}
