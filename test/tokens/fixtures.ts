import { ethers } from 'hardhat';
import { getSigners, createProxyCloneAddressFactory } from '../common';
import { TOKEN } from './constants';

const { deployContract, getContractAt } = ethers;

export async function deployTokenFactoryMock() {
  const signers = await getSigners('owner', 'gateway', 'guardian', 'token');

  const tokenFactory = await deployContract('TokenFactoryMock');

  return {
    tokenFactory,
    signers,
  };
}

export async function deployTokenImplMock() {
  const tokenImpl = await deployContract('TokenImplMock');

  return {
    tokenImpl,
  };
}

export async function setupTokenFactoryMock() {
  const { tokenImpl } = await deployTokenImplMock();

  const { tokenFactory, signers } = await deployTokenFactoryMock();

  await tokenFactory.initialize(signers.gateway, [signers.guardian], tokenImpl);

  await tokenFactory.addToken(signers.token);

  await tokenFactory.createToken(TOKEN.salt, TOKEN.name, TOKEN.symbol);

  const computeToken = await createProxyCloneAddressFactory(
    tokenFactory,
    tokenImpl,
  );

  const token = await getContractAt('TokenImpl', computeToken(TOKEN.salt));

  return {
    tokenImpl,
    tokenFactory,
    signers,
    computeToken,
    token,
  };
}
