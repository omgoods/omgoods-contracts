import { ethers, utils } from 'hardhat';
import { AddressLike, BigNumberish, BytesLike } from 'ethers';
import { createTypedDataHelper, TYPED_DATA_DOMAIN_NAME } from '../common';

const { getSigners } = utils;

const { deployContract } = ethers;

export async function deployAccountMock(options: { forwarder: AddressLike }) {
  const account = await deployContract('AccountMock', [options.forwarder]);

  return {
    account,
  };
}

export async function deployForwarderContextMock(options?: {
  forwarder?: AddressLike;
}) {
  const signers = await getSigners('forwarder');

  const forwarderContext = await deployContract('ForwarderContextMock', [
    options?.forwarder || signers.forwarder,
  ]);

  return {
    signers,
    forwarderContext,
  };
}

export async function deployForwarder() {
  const signers = await getSigners('owner', 'forwarder');

  const forwarder = await deployContract('Forwarder', [TYPED_DATA_DOMAIN_NAME]);

  return {
    signers,
    forwarder,
  };
}

export async function setupForwarder() {
  const { forwarder, signers } = await deployForwarder();

  const { account } = await deployAccountMock({
    forwarder,
  });

  const { forwarderContext } = await deployForwarderContextMock({
    forwarder,
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
  }>(forwarder, {
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
    forwarder,
    forwarderContext,
    account,
    typedDataHelper,
  };
}
