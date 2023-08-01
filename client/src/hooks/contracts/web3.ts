import Web3, { HttpProvider } from 'web3';

import { ALCHEMY_API_URL } from 'constants/urls';
import env from 'env';

export const alchemyProvider = new HttpProvider(`${ALCHEMY_API_URL}/${env.alchemyId}`);

/**
 * By default we use alchemy provider.
 * Once user connects to the app and has correct chain set up,
 * we use their provider. Set up in App.tsx.
 */
const web3 = new Web3(alchemyProvider);

export default web3;
