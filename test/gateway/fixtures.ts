import { ethers, helpers } from 'hardhat';
import { setupAccountRegistry } from '../account/fixtures';
import { AddressLike } from 'ethers';

const { deployContract, ZeroAddress } = ethers;

const { buildSigners } = helpers;

const TYPED_DATA_DOMAIN = {
  name: 'Test Gateway',
  version: '0.0.0',
} as const;

export async function deployGatewayRecipientMock(
  options: {
    gateway?: AddressLike;
  } = {},
) {
  const signers = await buildSigners('gateway');

  const { gateway } = {
    gateway: signers.gateway,
    ...options,
  };

  const gatewayRecipientMock = await deployContract('GatewayRecipientMock', [
    gateway,
  ]);

  return {
    gatewayRecipientMock,
    signers,
  };
}

export async function deployGateway() {
  const signers = await buildSigners('owner');

  const gateway = await deployContract('Gateway', [
    ZeroAddress,
    TYPED_DATA_DOMAIN.name,
    TYPED_DATA_DOMAIN.version,
  ]);

  return {
    gateway,
    signers,
  };
}

export async function setupGateway() {
  const { gateway, signers } = await deployGateway();

  const { accountRegistry, computeAccountAddress } = await setupAccountRegistry(
    {
      gateway,
    },
  );

  const { gatewayRecipientMock } = await deployGatewayRecipientMock({
    gateway,
  });

  await gateway.initialize(accountRegistry);

  return {
    gateway,
    gatewayRecipientMock,
    accountRegistry,
    computeAccountAddress,
    signers,
  };
}
