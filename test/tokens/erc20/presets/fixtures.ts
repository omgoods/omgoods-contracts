import { ethers } from 'hardhat';
import {
  setupDefaultTokenFactory,
  setupWrappedTokenFactory,
} from '../../presets/fixtures';
import { deployERC20ExternalToken } from '../fixtures';
import { ERC20_TOKEN } from '../constants';
import { MaxUint256 } from 'ethers';

const { deployContract, getContractAt } = ethers;

export async function deployERC20DefaultTokenImpl() {
  const tokenImpl = await deployContract('ERC20DefaultTokenImpl');

  return {
    tokenImpl,
  };
}

export async function deployERC20WrappedTokenImpl() {
  const tokenImpl = await deployContract('ERC20WrappedTokenImpl');

  return {
    tokenImpl,
  };
}

export async function setupERC20DefaultTokenImpl() {
  const { tokenImpl } = await deployERC20DefaultTokenImpl();

  const result = await setupDefaultTokenFactory({
    tokenImpl,
  });

  const { computeTokenAddress } = result;

  const token = await getContractAt(
    'ERC20DefaultTokenImpl',
    await computeTokenAddress(ERC20_TOKEN.symbol),
  );

  return {
    token,
    tokenImpl,
    ...result,
  };
}

export async function setupERC20WrappedTokenImpl() {
  const { externalToken: underlyingToken } = await deployERC20ExternalToken();

  const { tokenImpl } = await deployERC20WrappedTokenImpl();

  const result = await setupWrappedTokenFactory({
    tokenImpl,
    underlyingToken,
  });

  const { computeTokenAddress } = result;

  const token = await getContractAt(
    'ERC20WrappedTokenImpl',
    await computeTokenAddress(underlyingToken),
  );

  await underlyingToken.approve(token, MaxUint256);

  await token.deposit(ERC20_TOKEN.totalSupply / 2);

  return {
    token,
    tokenImpl,
    underlyingToken,
    ...result,
  };
}
