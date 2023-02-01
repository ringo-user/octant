// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

import "../interfaces/IHexagonOracle.sol";
import "./BeaconChainOracle.sol";
import "./ExecutionLayerOracle.sol";

/// @title Implementation of hexagon oracle.
///
/// @notice Trusted oracle maintained by Golem Foundation responsible for calculating ETH staking proceeds of
/// foundation's validator node on consensus layer. These proceeds include profit which validator makes on beacon chain
/// side (staking rewards for participating in Ethereum consensus) and tx inclusion fees on execution layer
/// side (tips for block proposer and eventual MEVs).
/// Please note that both values are public and verifiable.
/// They are just easily accessible to smart contracts on execution layer.
contract HexagonOracle is IHexagonOracle {
    /// @notice BeaconChainOracle contract.
    /// Provides balance of the Golem Foundation validator's account on the consensus layer.
    BeaconChainOracle public immutable beaconChainOracle;

    /// @notice ExecutionLayerOracle contract address.
    /// Provides balance of the Golem Foundation validator execution layer's account
    /// which collects fee.
    ExecutionLayerOracle public immutable executionLayerOracle;

    constructor(
        address _beaconChainOracleAddress,
        address _executionLayerOracleAddress
    ) {
        beaconChainOracle = BeaconChainOracle(_beaconChainOracleAddress);
        executionLayerOracle = ExecutionLayerOracle(
            _executionLayerOracleAddress
        );
    }

    /// @notice Checks how much yield (ETH staking proceeds) is generated by Golem Foundation at particular epoch.
    /// @param epoch - Hexagon Epoch's number.
    /// @return Total ETH staking proceeds made by foundation in wei for particular epoch.
    function getTotalETHStakingProceeds(
        uint32 epoch
    ) public view returns (uint256) {
        uint256 epochExecutionLayerBalance = executionLayerOracle
            .balanceByEpoch(epoch);
        uint256 epochBeaconChainBalance = beaconChainOracle.balanceByEpoch(
            epoch
        );

        if (epochBeaconChainBalance == 0 || epochExecutionLayerBalance == 0) {
            return 0;
        }

        uint256 previousExecutionLayerBalance = executionLayerOracle
            .balanceByEpoch(epoch - 1);
        uint256 previousBeaconChainBalance = beaconChainOracle.balanceByEpoch(
            epoch - 1
        );

        return
            (epochExecutionLayerBalance + epochBeaconChainBalance) -
            (previousBeaconChainBalance + previousExecutionLayerBalance);
    }
}
