import { ethers, testing, typedData } from 'hardhat';
import { AddressLike, BigNumberish, BytesLike } from 'ethers';

const { deployContract } = ethers;

const { buildSigners } = testing;

const { getDomainArgs, createEncoder } = typedData;

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
  const gateway = await deployContract('Gateway', getDomainArgs('Gateway'));

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

  const typedDataEncoder = await createEncoder<{
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
  }>('Gateway', gateway);

  return {
    gateway,
    gatewayRecipientMock,
    signers,
    erc1271AccountMock,
    typedDataEncoder,
  };
}
