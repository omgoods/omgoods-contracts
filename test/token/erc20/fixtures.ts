import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, helpers } from 'hardhat';
import { AddressLike } from 'ethers';
import {
  ERC20_TOKEN_MOCK_DATA,
  ERC20_EXTERNAL_TOKEN_MOCK_DATA,
} from './constants';

const { deployContract, ZeroAddress, MaxUint256 } = ethers;

const { buildSigners } = helpers;

export async function deployERC20TokenMock() {
  const signers = await buildSigners('owner', 'account', 'operator');

  const tokenMock = await deployContract('ERC20TokenMock');

  return {
    tokenMock,
    signers,
  };
}

export async function deployERC20ExternalTokenMock(
  options: typeof ERC20_EXTERNAL_TOKEN_MOCK_DATA = ERC20_EXTERNAL_TOKEN_MOCK_DATA,
  owner?: HardhatEthersSigner,
) {
  const signers = await buildSigners('owner');

  return deployContract(
    'ERC20ExternalTokenMock',
    [options.name, options.symbol, options.decimals, options.initialSupply],
    owner || signers.owner,
  );
}

export async function deployERC20TokenRegistry() {
  const signers = await buildSigners('owner', 'token');

  const tokenRegistry = await deployContract('ERC20TokenRegistry', [
    ZeroAddress,
  ]);

  return {
    tokenRegistry,
    signers,
  };
}

export async function setupERC20TokenMock() {
  const { tokenMock, signers } = await deployERC20TokenMock();

  const { tokenRegistry } = await setupERC20TokenRegistry({
    token: tokenMock,
  });

  await tokenMock.initialize(
    ZeroAddress,
    tokenRegistry,
    ERC20_TOKEN_MOCK_DATA.name,
    ERC20_TOKEN_MOCK_DATA.symbol,
  );

  await tokenMock.mint(signers.owner, ERC20_TOKEN_MOCK_DATA.initialSupply);

  await tokenMock.approve(signers.account, ERC20_TOKEN_MOCK_DATA.initialSupply);

  await tokenMock.approve(signers.operator, MaxUint256);

  return {
    tokenMock,
    tokenRegistry,
    signers,
  };
}

export async function setupERC20TokenRegistry(
  options: { token?: AddressLike; tokenFactory?: AddressLike } = {},
) {
  const { tokenRegistry, signers } = await deployERC20TokenRegistry();

  await tokenRegistry.initialize([]);

  await tokenRegistry.addToken(signers.token);

  const { token, tokenFactory } = options;

  if (token) {
    await tokenRegistry.addToken(token);
  }

  if (tokenFactory) {
    await tokenRegistry.addTokenFactory(tokenFactory);
  }

  return {
    tokenRegistry,
    signers,
  };
}
