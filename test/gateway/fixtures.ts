import { ethers } from 'hardhat';
import { setupAccountRegistry } from '../account/fixtures';

const { deployContract, ZeroAddress } = ethers;

const TYPED_DATA_DOMAIN = {
  name: 'Test Gateway',
  version: '0.0.0',
} as const;

export async function deployGateway() {
  const gateway = await deployContract('Gateway', [
    ZeroAddress,
    TYPED_DATA_DOMAIN.name,
    TYPED_DATA_DOMAIN.version,
  ]);

  return {
    gateway,
  };
}

export async function setupGateway() {
  const { gateway } = await deployGateway();

  const { accountRegistry } = await setupAccountRegistry({
    gateway,
  });

  await gateway.initialize(accountRegistry);

  return {
    gateway,
    accountRegistry,
  };
}
