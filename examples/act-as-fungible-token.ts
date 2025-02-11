import { formatEther } from 'viem';
import {
  ACTStates,
  ACTGovernanceModels,
  ACTVariants,
  randomAddress,
  randomEther,
} from '@/common';
import { buildHelpers, runExample } from './common';

const TOKEN = {
  variant: ACTVariants.Fungible,
  name: 'Example Fungible',
  symbol: 'EXF',
};

runExample(async (hre) => {
  const {
    viem: { getContractAt },
  } = hre;

  const {
    logger,
    registry,
    owner,
    wallets,
    buildTokenTypedData,
    computeTokenAddress,
  } = await buildHelpers();

  const [maintainer] = wallets;

  const tokenAddress = await computeTokenAddress(TOKEN.variant, TOKEN.symbol);

  logger.info('Token', {
    address: tokenAddress,
    ...TOKEN,
  });

  const tokenTypedData = buildTokenTypedData({
    variant: TOKEN.variant,
    maintainer: maintainer.account.address,
    name: TOKEN.name,
    symbol: TOKEN.symbol,
    extensions: [],
  });

  const guardianSignature = await owner.signTypedData(tokenTypedData);

  await logger.logTx(
    'Creating token using guardian signature',
    registry.write.createToken(
      [
        TOKEN.variant,
        maintainer.account.address,
        TOKEN.name,
        TOKEN.symbol,
        [],
        guardianSignature,
      ],
      maintainer,
    ),
  );

  const token = await getContractAt('ACTFungibleImpl', tokenAddress);

  for (let i = 0; i < 5; i++) {
    const to = randomAddress();
    const value = randomEther();

    await logger.logTx(
      `Minting ${formatEther(value)} ${TOKEN.symbol} to ${to}`,
      token.write.mint([to, value], maintainer),
    );
  }

  logger.info('Token', {
    owner: await token.read.getOwner(),
    settings: await token.read.getSettings(),
    totalSupply: formatEther((await token.read.totalSupply()) as bigint),
  });

  // Open transfers to all token holders
  await logger.logTx(
    'Changing token state to `Active`',
    token.write.setState([ACTStates.Active], maintainer),
  );

  // Disable minting
  await logger.logTx(
    'Changing token governance model to `ConstitutionalMonarchy`',
    token.write.setSystem(
      [ACTGovernanceModels.ConstitutionalMonarchy],
      maintainer,
    ),
  );

  logger.info('Token', {
    owner: await token.read.getOwner(),
    settings: await token.read.getSettings(),
  });
});
