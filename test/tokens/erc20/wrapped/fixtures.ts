import { ethers } from 'hardhat';
import { ZeroAddress, keccak256, parseEther, MaxUint256 } from 'ethers';
import {
  getSigners,
  TYPED_DATA_DOMAIN_NAME,
  createTypedDataHelper,
  createProxyCloneAddressFactory,
} from '../../../common';
import { deployERC20ExternalTokenMock } from '../fixtures';

const { deployContract, getContractAt } = ethers;

export async function deployERC20WrappedTokenImpl() {
  const tokenImpl = await deployContract('ERC20WrappedTokenImpl');

  return {
    tokenImpl,
  };
}

export async function deployERC20WrappedTokenFactory() {
  const signers = await getSigners('owner', 'guardian');

  const tokenFactory = await deployContract('ERC20WrappedTokenFactory', [
    signers.owner,
    TYPED_DATA_DOMAIN_NAME,
  ]);

  return {
    signers,
    tokenFactory,
  };
}

export async function setupERC20WrappedTokenFactory() {
  const { tokenImpl } = await deployERC20WrappedTokenImpl();
  const { tokenFactory, signers } = await deployERC20WrappedTokenFactory();

  const { externalToken: underlyingToken } =
    await deployERC20ExternalTokenMock();

  const { externalToken: supportedToken } =
    await deployERC20ExternalTokenMock();

  const { externalToken: unsupportedToken } =
    await deployERC20ExternalTokenMock({
      decimals: 10,
    });

  await tokenFactory.initialize(ZeroAddress, [signers.guardian], tokenImpl);

  await tokenFactory.createToken(underlyingToken, '0x');

  const computeToken = await createProxyCloneAddressFactory(
    tokenFactory,
    tokenImpl,
    (underlyingToken) => keccak256(underlyingToken),
  );

  const token = await getContractAt(
    'ERC20WrappedTokenImpl',
    computeToken(await underlyingToken.getAddress()),
  );

  await underlyingToken.approve(token, MaxUint256);

  await token.deposit(parseEther('50000000'));

  const typeDataHelper = await createTypedDataHelper<{
    Token: {
      underlyingToken: string;
    };
  }>(tokenFactory, {
    Token: [
      {
        name: 'underlyingToken',
        type: 'address',
      },
    ],
  });

  return {
    tokenFactory,
    tokenImpl,
    token,
    underlyingToken,
    supportedToken,
    unsupportedToken,
    computeToken,
    signers,
    typeDataHelper,
  };
}