import { ethers } from 'hardhat';
import { AddressLike, BigNumberish, BytesLike } from 'ethers';
import {
  getSigners,
  createTypedDataHelper,
  TYPED_DATA_DOMAIN_NAME,
} from '../common';

const { deployContract } = ethers;

export async function deployERC1271AccountExample(options: {
  gateway: AddressLike;
}) {
  const account = await deployContract('ERC1271AccountExample', [
    options.gateway,
  ]);

  return {
    account,
  };
}

export async function deployGatewayRecipientMock(options?: {
  gateway?: AddressLike;
}) {
  const signers = await getSigners('gateway');

  const gatewayRecipient = await deployContract('GatewayRecipientMock', [
    options?.gateway || signers.gateway,
  ]);

  return {
    signers,
    gatewayRecipient,
  };
}

export async function deployGateway() {
  const signers = await getSigners('owner', 'forwarder');

  const gateway = await deployContract('Gateway', [TYPED_DATA_DOMAIN_NAME]);

  return {
    signers,
    gateway,
  };
}

export async function setupGateway() {
  const { gateway, signers } = await deployGateway();

  const { account } = await deployERC1271AccountExample({
    gateway,
  });

  const { gatewayRecipient } = await deployGatewayRecipientMock({
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
  }>(gateway, {
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
  });

  return {
    signers,
    gateway,
    gatewayRecipient,
    account,
    typedDataHelper,
  };
}
