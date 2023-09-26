import { ethers } from 'hardhat';
import { AddressLike, BigNumberish, BytesLike } from 'ethers';
import { getSigners, createTypedDataHelper } from '../helpers';
import { GATEWAY_DOMAIN } from './constants';

const { deployContract } = ethers;

export async function deployERC1271AccountMock(options: {
  gateway: AddressLike;
}) {
  const erc1271AccountMock = await deployContract('ERC1271AccountMock', [
    options.gateway,
  ]);

  return {
    erc1271AccountMock,
  };
}

export async function deployGatewayRecipientMock(options?: {
  gateway?: AddressLike;
}) {
  const signers = await getSigners('gateway');

  const gatewayRecipientMock = await deployContract('GatewayRecipientMock', [
    options?.gateway || signers.gateway,
  ]);

  return {
    gatewayRecipientMock,
    signers,
  };
}

export async function deployGateway() {
  const gateway = await deployContract('Gateway', [
    GATEWAY_DOMAIN.name,
    GATEWAY_DOMAIN.version,
  ]);

  return {
    gateway,
  };
}

export async function setupGateway() {
  const signers = await getSigners('owner', 'forwarder');

  const { gateway } = await deployGateway();

  const { erc1271AccountMock } = await deployERC1271AccountMock({
    gateway,
  });

  const { gatewayRecipientMock } = await deployGatewayRecipientMock({
    gateway,
  });

  const typedDataHelper = await createTypedDataHelper<{
    Request: {
      account: string;
      nonce: BigNumberish;
      to: string;
      data: BytesLike;
    };
    RequestBatch: {
      account: string;
      nonce: BigNumberish;
      to: Array<string>;
      data: Array<BytesLike>;
    };
  }>({
    domain: {
      ...GATEWAY_DOMAIN,
      verifyingContract: gateway,
    },
    types: {
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
    },
  });

  return {
    gateway,
    gatewayRecipientMock,
    signers,
    erc1271AccountMock,
    typedDataHelper,
  };
}
