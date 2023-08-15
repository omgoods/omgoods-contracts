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

  const erc20TokenMock = await deployContract('ERC20TokenMock');

  return {
    erc20TokenMock,
    signers,
  };
}

export async function deployERC20ExternalTokenMock() {
  const signers = await buildSigners('owner');

  const erc20ExternalTokenMock = await deployContract(
    'ERC20ExternalTokenMock',
    [
      ERC20_EXTERNAL_TOKEN_MOCK_DATA.name,
      ERC20_EXTERNAL_TOKEN_MOCK_DATA.symbol,
      ERC20_EXTERNAL_TOKEN_MOCK_DATA.decimals,
      ERC20_EXTERNAL_TOKEN_MOCK_DATA.initialSupply,
    ],
  );

  return {
    erc20ExternalTokenMock,
    signers,
  };
}

export async function deployERC20TokenRegistry() {
  const signers = await buildSigners('owner', 'token');

  const erc20TokenRegistry = await deployContract('ERC20TokenRegistry', [
    ZeroAddress,
  ]);

  return {
    erc20TokenRegistry,
    signers,
  };
}

export async function setupERC20TokenMock() {
  const { erc20TokenMock, signers } = await deployERC20TokenMock();

  const { erc20TokenRegistry } = await setupERC20TokenRegistry({
    token: erc20TokenMock,
  });

  await erc20TokenMock.initialize(
    ZeroAddress,
    erc20TokenRegistry,
    ERC20_TOKEN_MOCK_DATA.name,
    ERC20_TOKEN_MOCK_DATA.symbol,
  );

  await erc20TokenMock.mint(signers.owner, ERC20_TOKEN_MOCK_DATA.initialSupply);

  await erc20TokenMock.approve(
    signers.account,
    ERC20_TOKEN_MOCK_DATA.initialSupply,
  );

  await erc20TokenMock.approve(signers.operator, MaxUint256);

  return {
    erc20TokenMock,
    erc20TokenRegistry,
    signers,
  };
}

export async function setupERC20TokenRegistry(
  options: { token?: AddressLike; tokenFactory?: AddressLike } = {},
) {
  const { erc20TokenRegistry, signers } = await deployERC20TokenRegistry();

  await erc20TokenRegistry.initialize([]);

  await erc20TokenRegistry.addToken(signers.token);

  const { token, tokenFactory } = options;

  if (token) {
    await erc20TokenRegistry.addToken(token);
  }

  if (tokenFactory) {
    await erc20TokenRegistry.addTokenFactory(tokenFactory);
  }

  return {
    erc20TokenRegistry,
    signers,
  };
}
