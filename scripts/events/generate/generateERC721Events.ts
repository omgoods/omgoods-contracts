import { deployments, ethers } from 'hardhat';
import { AddressLike } from 'ethers';
import { logTx, randomAddress } from '../../common';

const { getAddress } = deployments;

const { getContractAt } = ethers;

const BURN_IDS = [2001, 5002];
const APPROVE_IDS = [2002, 100];
const TRANSFER_IDS = [1, 2, 1000, 2000];
const APPROVE_FOR_ALL_APPROVALS = [true, false, false];

const TOKEN_ID_BASE = BigInt(Date.now()) * 1_000_000n;

export async function generateERC721Events(owner: AddressLike): Promise<void> {
  const tokenFactoryName = 'ERC721ControlledTokenFactory' as const;

  const tokenFactory = await getContractAt(
    tokenFactoryName,
    await getAddress(tokenFactoryName),
  );

  const tokenData = {
    name: 'Controlled',
    symbol: 'CONTROLLED',
    controllers: [owner],
  };

  const tokenAddress = await tokenFactory.computeToken(tokenData.symbol);

  const token = await getContractAt('ERC721ControlledTokenImpl', tokenAddress);

  console.log(`# ${tokenFactoryName} (${tokenAddress}})`);
  console.log();

  if (!(await tokenFactory.hasToken(token))) {
    await logTx(
      'creating token contract',
      tokenFactory.createToken(tokenData, '0x'),
    );
  }

  const tokenIds = new Map<number, bigint>();

  const mintIds = [...BURN_IDS, ...APPROVE_IDS, ...TRANSFER_IDS];

  for (const [index, value] of Object.entries(mintIds)) {
    const tokenId = TOKEN_ID_BASE + BigInt(value);

    tokenIds.set(value, tokenId);

    await logTx(`(${index}) minting token`, token.mint(owner, tokenId));
  }

  for (const [index, value] of Object.entries(BURN_IDS)) {
    await logTx(`(${index}) burning token`, token.burn(tokenIds.get(value)));
  }

  for (const [index, value] of Object.entries(APPROVE_IDS)) {
    await logTx(
      `(${index}) approving token`,
      token.approve(randomAddress(), tokenIds.get(value)),
    );
  }

  for (const [index, value] of Object.entries(TRANSFER_IDS)) {
    await logTx(
      `(${index}) transferring token`,
      token['safeTransferFrom(address,address,uint256)'](
        owner,
        randomAddress(),
        tokenIds.get(value),
      ),
    );
  }

  for (const [index, value] of Object.entries(APPROVE_FOR_ALL_APPROVALS)) {
    await logTx(
      `(${index}) approving for all`,
      token.setApprovalForAll(randomAddress(), value),
    );
  }
}
