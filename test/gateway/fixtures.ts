import { ethers, helpers } from 'hardhat';
import { AddressLike, BigNumberish, BytesLike } from 'ethers';
import { deployERC1271AccountMock } from '../account/extensions/fixtures';
import { setupAccountRegistry } from '../account/fixtures';
import { GATEWAY_TYPED_DATA_DOMAIN } from './constants';

const { deployContract, ZeroAddress } = ethers;

const { buildSigners, createTypedDataEncoder } = helpers;

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
    GATEWAY_TYPED_DATA_DOMAIN.name,
    GATEWAY_TYPED_DATA_DOMAIN.version,
  ]);

  return {
    gateway,
    signers,
  };
}

export async function setupGateway() {
  const { erc1271AccountMock } = await deployERC1271AccountMock();
  const { gateway, signers } = await deployGateway();

  const { accountRegistry, accounts } = await setupAccountRegistry({
    gateway,
  });

  const { gatewayRecipientMock } = await deployGatewayRecipientMock({
    gateway,
  });

  await gateway.initialize(accountRegistry);

  const requestEncoder = await createTypedDataEncoder<{
    from: string;
    nonce: BigNumberish;
    to: string;
    value: BigNumberish;
    data: BytesLike;
  }>(gateway, GATEWAY_TYPED_DATA_DOMAIN, {
    Request: [
      {
        name: 'from',
        type: 'address',
      },
      {
        name: 'nonce',
        type: 'uint256',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
  });

  const requestsEncoder = await createTypedDataEncoder<{
    from: string;
    nonce: BigNumberish;
    to: Array<string>;
    value: Array<BigNumberish>;
    data: Array<BytesLike>;
  }>(gateway, GATEWAY_TYPED_DATA_DOMAIN, {
    Requests: [
      {
        name: 'from',
        type: 'address',
      },
      {
        name: 'nonce',
        type: 'uint256',
      },
      {
        name: 'to',
        type: 'address[]',
      },
      {
        name: 'value',
        type: 'uint256[]',
      },
      {
        name: 'data',
        type: 'bytes[]',
      },
    ],
  });

  return {
    gateway,
    gatewayRecipientMock,
    accountRegistry,
    accounts,
    signers,
    erc1271AccountMock,
    requestEncoder,
    requestsEncoder,
  };
}
