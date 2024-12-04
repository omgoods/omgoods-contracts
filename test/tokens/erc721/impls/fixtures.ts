import { ethers, utils } from 'hardhat';
import { createTypedDataHelper, TYPED_DATA_DOMAIN_NAME } from '../../../common';
import { TOKEN_METADATA } from '../../constants';
import { setupTokenFactory } from '../../fixtures';
import { TOKEN_IDS, TOKEN_URI_PREFIX } from './constants';

const { deployContract, ZeroAddress } = ethers;
const { getSigners, randomHex } = utils;

export async function setupTokenImplMock() {
  const signers = await getSigners('owner', 'controller');

  const tokenImpl = await deployContract('ERC721TokenImplMock', [
    TYPED_DATA_DOMAIN_NAME,
  ]);

  const { createToken, tokenFactory } = await setupTokenFactory({
    tokenImpl,
  });

  const token = await createToken(
    randomHex(),
    tokenImpl.interface.encodeFunctionData('initialize', [
      signers.owner.address,
      signers.controller.address,
      TOKEN_METADATA.name,
      TOKEN_METADATA.symbol,
      TOKEN_URI_PREFIX,
    ]),
  );

  for (const tokenId of TOKEN_IDS) {
    await token.connect(signers.owner).mint(signers.owner, tokenId);

    await token.connect(signers.owner).approve(signers.controller, tokenId);
  }

  return {
    signers,
    token,
    tokenImpl,
    tokenFactory,
  };
}

export async function setupTokenRegularImpl() {
  const signers = await getSigners('owner', 'controller');

  const tokenImpl = await deployContract('ERC721TokenRegularImpl', [
    TYPED_DATA_DOMAIN_NAME,
  ]);

  const { createToken, tokenFactory } = await setupTokenFactory({
    tokenImpl,
  });

  const token = await createToken(
    randomHex(),
    tokenImpl.interface.encodeFunctionData('initialize', [
      ZeroAddress,
      signers.owner.address,
      signers.controller.address,
      TOKEN_METADATA.name,
      TOKEN_METADATA.symbol,
      TOKEN_URI_PREFIX,
      false,
    ]),
  );

  for (const tokenId of TOKEN_IDS) {
    await token.connect(signers.owner).mint(signers.owner, tokenId);

    await token.connect(signers.owner).approve(signers.controller, tokenId);
  }

  const tokenImplTypedData = await createTypedDataHelper<{
    Initialization: {
      owner: string;
      controller: string;
      name: string;
      symbol: string;
      ready: boolean;
    };
  }>(tokenImpl, {
    Initialization: [
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'controller',
        type: 'address',
      },
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'symbol',
        type: 'string',
      },
      {
        name: 'ready',
        type: 'bool',
      },
    ],
  });

  return {
    signers,
    token,
    tokenFactory,
    tokenImpl,
    tokenImplTypedData,
  };
}
