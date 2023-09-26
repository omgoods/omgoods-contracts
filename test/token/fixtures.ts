import { ethers } from 'hardhat';
import {
  getSigners,
  createProxyCloneAddressFactory,
  TYPED_DATA_DOMAIN,
} from '../common';
import { TOKEN_MOCK } from './constants';

const { deployContract, getContractAt } = ethers;

export async function deployTokenFactoryMock() {
  const signers = await getSigners('owner', 'gateway', 'guardian', 'token');

  const tokenFactoryMock = await deployContract('TokenFactoryMock', [
    signers.owner,
    TYPED_DATA_DOMAIN.name,
    TYPED_DATA_DOMAIN.version,
  ]);

  return {
    tokenFactoryMock,
    signers,
  };
}

export async function deployTokenImplMock() {
  const tokenImplMock = await deployContract('TokenImplMock');

  return {
    tokenImplMock,
  };
}

export async function setupTokenFactoryMock() {
  const { tokenImplMock } = await deployTokenImplMock();

  const { tokenFactoryMock, signers } = await deployTokenFactoryMock();

  await tokenFactoryMock.initialize(
    signers.gateway,
    [signers.guardian],
    tokenImplMock,
  );

  await tokenFactoryMock.addToken(signers.token);

  await tokenFactoryMock.createToken(
    TOKEN_MOCK.salt,
    TOKEN_MOCK.name,
    TOKEN_MOCK.symbol,
    signers.owner,
  );

  const computeTokenMock = await createProxyCloneAddressFactory(
    tokenFactoryMock,
    tokenImplMock,
  );

  const tokenMock = await getContractAt(
    'TokenImplMock',
    computeTokenMock(TOKEN_MOCK.salt),
  );

  return {
    tokenImplMock,
    tokenFactoryMock,
    signers,
    computeTokenMock,
    tokenMock,
  };
}
