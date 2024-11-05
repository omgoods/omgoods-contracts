import { ethers, utils } from 'hardhat';
import { BigNumberish, BytesLike } from 'ethers';
import { createTypedDataHelper, TYPED_DATA_DOMAIN_NAME } from '../common';

const { deployContract } = ethers;
const { getSigners } = utils;

export async function setupForwarderContextMock() {
  const signers = await getSigners('forwarder');

  const forwarderContext = await deployContract('ForwarderContextMock', [
    signers.forwarder,
  ]);

  return {
    signers,
    forwarderContext,
  };
}

export async function setupForwarder() {
  const signers = await getSigners('owner', 'forwarder');

  const forwarder = await deployContract('Forwarder', [TYPED_DATA_DOMAIN_NAME]);
  const forwarderContext = await deployContract('ForwarderContextMock', [
    forwarder,
  ]);
  const account = await deployContract('AccountMock', [forwarder]);

  const forwarderTypedData = await createTypedDataHelper<{
    Request: {
      account: string;
      nonce: BigNumberish;
      to: string;
      data: BytesLike;
    };
    Batch: {
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
    Batch: [
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
    account,
    forwarder,
    forwarderContext,
    forwarderTypedData,
    signers,
  };
}
