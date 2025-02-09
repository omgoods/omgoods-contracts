import { ACTVariants } from '@/common';
import { buildHelpers, runExample } from './common';

const TOKEN = {
  variant: ACTVariants.NonFungible,
  name: 'Example Non-Fungible',
  symbol: 'EXN',
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

  const tokenAddress = await computeTokenAddress(
    ACTVariants.NonFungible,
    TOKEN.symbol,
  );

  logger.info('Token', {
    address: tokenAddress,
    ...TOKEN,
  });

  logger.log('Creating token using guardian signature...');

  const tokenTypedData = buildTokenTypedData({
    variant: ACTVariants.NonFungible,
    maintainer: maintainer.account.address,
    name: TOKEN.name,
    symbol: TOKEN.symbol,
    extensions: [],
  });

  const guardianSignature = await owner.signTypedData(tokenTypedData);

  await logger.logTx(
    'Token created',
    registry.write.createToken(
      [
        ACTVariants.NonFungible,
        maintainer.account.address,
        TOKEN.name,
        TOKEN.symbol,
        [],
        guardianSignature,
      ],
      maintainer,
    ),
  );

  const token = await getContractAt('IACTNonFungible', tokenAddress);

  logger.info('Token', {
    owner: await token.read.getOwner(),
    settings: await token.read.getSettings(),
  });
});
