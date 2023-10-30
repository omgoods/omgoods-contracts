import { ethers } from 'hardhat';
import { deployERC20ExternalToken } from '../tokens/erc20/fixtures';
import { deployERC721ExternalToken } from '../tokens/erc721/fixtures';

const { deployContract } = ethers;

export async function deployBytesMock() {
  const bytes = await deployContract('BytesMock');

  return {
    bytes,
  };
}

export async function deployInitializableMock() {
  const initializable = await deployContract('InitializableMock');

  return {
    initializable,
  };
}

export async function deployStaticCaller() {
  const staticCaller = await deployContract('StaticCaller');

  const { externalToken: erc20Token } = await deployERC20ExternalToken();

  const { externalToken: erc721Token } = await deployERC721ExternalToken();

  return {
    staticCaller,
    erc20Token,
    erc721Token,
  };
}
