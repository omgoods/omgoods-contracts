import { ACTVariants } from '@/common';
import { buildHelpers, runExample } from './common';

const TOKEN = {
  variant: ACTVariants.NonFungible,
  name: 'Example Non-Fungible',
  symbol: 'EXN',
};

// WIP

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

  const token = await getContractAt('ACTNonFungibleImpl', tokenAddress);

  logger.info('Token', {
    owner: await token.read.getOwner(),
    settings: await token.read.getSettings(),
  });
});
