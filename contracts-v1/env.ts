// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-extraneous-dependencies
require('dotenv').config();

// ----------------
// NETWORK VARIABLES
// ----------------

// TESTNETS
const TESTNET_RPC_URL = process.env.TESTNET_RPC_URL || '';
const TESTNET_DEPLOYER_PRIVATE_KEY =
  process.env.TESTNET_DEPLOYER_PRIVATE_KEY ||
  '0000000000000000000000000000000000000000000000000000000000000000';
const TESTNET_MULTISIG_PRIVATE_KEY =
  process.env.TESTNET_MULTISIG_PRIVATE_KEY ||
  '0000000000000000000000000000000000000000000000000000000000000000';

// MAINNET
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || '';
const MAINNET_DEPLOYER_PRIVATE_KEY =
  process.env.MAINNET_DEPLOYER_PRIVATE_KEY ||
  '0000000000000000000000000000000000000000000000000000000000000000';

// ----------------
// HARDHAT VARIABLES
// ----------------
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const IS_GAS_REPORTING_ENABLED = Boolean(process.env.IS_GAS_REPORTING_ENABLED) || true;

// ----------------
// CONTRACTS ADDRESSES
// ----------------
const GNT_ADDRESS = process.env.GNT_ADDRESS || '0xE6de13D64F6036E4E3f5fC84B5EB620C5C7c1050';
const GLM_ADDRESS = process.env.GLM_ADDRESS || '0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429';
const GLM_FAUCET_ADDRESS =
  process.env.GLM_FAUCET_ADDRESS || '0xD380d54df4993FC2Cae84F3ADB77fB97694933A8';

// ----------------
// CONTRACTS VARIABLES
// ----------------
const MULTISIG_ADDRESS = process.env.MULTISIG_ADDRESS || '';
const PROPOSALS_CID = process.env.PROPOSALS_CID || '';
// List of addresses separated by commas
const PROPOSALS_ADDRESSES = process.env.PROPOSALS_ADDRESSES || '';
const EPOCHS_START = Number(process.env.EPOCHS_START);
const EPOCH_DURATION = Number(process.env.EPOCH_DURATION) || 600;
const DECISION_WINDOW = Number(process.env.DECISION_WINDOW) || 600;

export {
  PROPOSALS_CID,
  PROPOSALS_ADDRESSES,
  MULTISIG_ADDRESS,
  TESTNET_RPC_URL,
  TESTNET_DEPLOYER_PRIVATE_KEY,
  TESTNET_MULTISIG_PRIVATE_KEY,
  MAINNET_RPC_URL,
  MAINNET_DEPLOYER_PRIVATE_KEY,
  GNT_ADDRESS,
  GLM_ADDRESS,
  GLM_FAUCET_ADDRESS,
  ETHERSCAN_API_KEY,
  EPOCHS_START,
  EPOCH_DURATION,
  DECISION_WINDOW,
  IS_GAS_REPORTING_ENABLED,
};
