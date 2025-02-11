import { formatEther } from 'viem';
import { ACTStates, ACTSystems, ACTVariants, randomEther } from '@/common';
import { buildHelpers, runExample } from './common';

const TOKEN = {
  variant: ACTVariants.Fungible,
  name: 'Example DAO',
  symbol: 'EXD',
};

runExample(async (hre) => {
  const {
    viem: { getContractAt },
  } = hre;

  const { logger, registry, extensions, owner, wallets, computeTokenAddress } =
    await buildHelpers();

  const [maintainer, ...accounts] = wallets;

  const tokenAddress = await computeTokenAddress(TOKEN.variant, TOKEN.symbol);

  logger.info('Token', {
    address: tokenAddress,
    ...TOKEN,
  });

  logger.log('Creating token ...');

  await logger.logTx(
    'Token created',
    registry.write.createToken(
      [
        TOKEN.variant,
        maintainer.account.address,
        TOKEN.name,
        TOKEN.symbol,
        [
          extensions.signer, // For proposals with signing action
          extensions.voting,
          extensions.wallet, // For proposals with executing action
        ],
      ],
      owner,
    ),
  );

  const token = await getContractAt('ACTFungibleImpl', tokenAddress);

  logger.log('Minting tokens...');

  for (const account of accounts) {
    const to = account.account.address;
    const value = randomEther();

    await logger.logTx(
      `Minted ${formatEther(value)} ${TOKEN.symbol} to ${to}`,
      token.write.mint([to, value], maintainer),
    );
  }

  logger.info('Token', {
    owner: await token.read.getOwner(),
    settings: await token.read.getSettings(),
    totalSupply: formatEther((await token.read.totalSupply()) as bigint),
  });

  logger.log('Activate token and disable minting...');

  // Open transfers to all token holders, start balance tracking
  await logger.logTx(
    'Token state changed to `Tracked`',
    token.write.setState([ACTStates.Tracked], maintainer),
  );

  // Change token ownership
  await logger.logTx(
    'Token system changed to `Democracy`',
    token.write.setSystem([ACTSystems.Democracy], maintainer),
  );

  logger.info('Token', {
    owner: await token.read.getOwner(),
    settings: await token.read.getSettings(),
  });
});
