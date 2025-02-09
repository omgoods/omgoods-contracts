import { viem } from 'hardhat';
import { getAddress, zeroAddress } from 'viem';

const { deployContract } = viem;

export async function deployRegistry() {
  const registry = await deployContract('ACTRegistry', [zeroAddress]);

  await registry.write.initialize([zeroAddress, zeroAddress, [], 20]);

  registry.address = getAddress(registry.address);

  return {
    registry,
  };
}
