import { ethers, testing } from 'hardhat';
import { AddressLike, BigNumberish, BytesLike } from 'ethers';
import { GATEWAY_TYPED_DATA_DOMAIN } from './constants';

const { deployContract } = ethers;

const { buildSigners, createTypedDataEncoder } = testing;

export async function deployERC1271AccountMock(options: {
  gateway: AddressLike;
}) {
  const { gateway } = options;

  const erc1271AccountMock = await deployContract('ERC1271AccountMock', [
    gateway,
  ]);

  return {
    erc1271AccountMock,
  };
}

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
  const gateway = await deployContract('Gateway', [
    GATEWAY_TYPED_DATA_DOMAIN.name,
    GATEWAY_TYPED_DATA_DOMAIN.version,
  ]);

  return {
    gateway,
  };
}

export async function setupGateway() {
  const signers = await buildSigners('owner', 'forwarder');

  const { gateway } = await deployGateway();

  const { erc1271AccountMock } = await deployERC1271AccountMock({
    gateway,
  });

  const { gatewayRecipientMock } = await deployGatewayRecipientMock({
    gateway,
  });

  const requestEncoder = await createTypedDataEncoder<{
    account: string;
    nonce: BigNumberish;
    to: string;
    data: BytesLike;
  }>(gateway, GATEWAY_TYPED_DATA_DOMAIN, {
    Request: [
      {
        name: 'account',
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
        name: 'data',
        type: 'bytes',
      },
    ],
  });

  const requestBatchEncoder = await createTypedDataEncoder<{
    account: string;
    nonce: BigNumberish;
    to: Array<string>;
    data: Array<BytesLike>;
  }>(gateway, GATEWAY_TYPED_DATA_DOMAIN, {
    RequestBatch: [
      {
        name: 'account',
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
        name: 'data',
        type: 'bytes[]',
      },
    ],
  });

  return {
    gateway,
    gatewayRecipientMock,
    signers,
    erc1271AccountMock,
    requestEncoder,
    requestBatchEncoder,
  };
}
