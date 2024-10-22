import { ethers } from 'hardhat';
import {
  setupTokenDefaultFactory,
  setupTokenWrappedFactory,
} from '../../presets/fixtures';
import { deployERC20ExternalToken } from '../fixtures';
import { ERC20_TOKEN } from '../constants';
import { MaxUint256 } from 'ethers';

const { deployContract, getContractAt } = ethers;

export async function deployERC20TokenDefaultImpl() {
  const tokenImpl = await deployContract('ERC20TokenDefaultImpl');

  return {
    tokenImpl,
  };
}

export async function deployERC20TokenWrappedImpl() {
  const tokenImpl = await deployContract('ERC20TokenWrappedImpl');

  return {
    tokenImpl,
  };
}

export async function setupERC20TokenDefaultImpl() {
  const { tokenImpl } = await deployERC20TokenDefaultImpl();

  const result = await setupTokenDefaultFactory({
    tokenImpl,
  });

  const { computeTokenAddress } = result;

  const token = await getContractAt(
    'ERC20TokenDefaultImpl',
    await computeTokenAddress(ERC20_TOKEN.symbol),
  );

  return {
    token,
    tokenImpl,
    ...result,
  };
}

export async function setupERC20TokenWrappedImpl() {
  const { externalToken: underlyingToken } = await deployERC20ExternalToken();

  const { tokenImpl } = await deployERC20TokenWrappedImpl();

  const result = await setupTokenWrappedFactory({
    tokenImpl,
    underlyingToken,
  });

  const { computeTokenAddress } = result;

  const token = await getContractAt(
    'ERC20TokenWrappedImpl',
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
