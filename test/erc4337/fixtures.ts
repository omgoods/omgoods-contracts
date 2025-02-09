import { viem } from 'hardhat';

const { deployContract } = viem;

export async function deployEntryPoint() {
  const entryPoint = await deployContract('EntryPoint');

  return {
    entryPoint,
  };
}
