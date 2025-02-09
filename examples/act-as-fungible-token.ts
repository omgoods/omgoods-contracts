import { formatEther } from 'viem';
import { buildHelpers, runExample } from './common';
import {
  ACTStates,
  ACTSystems,
  ACTVariants,
  randomAddress,
  randomEther,
} from '@/common';

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

  const tokenAddress = await computeTokenAddress(
    ACTVariants.Fungible,
    TOKEN.symbol,
  );

  logger.info('Token', {
    address: tokenAddress,
    ...TOKEN,
  });

  logger.log('Creating token using guardian signature...');

  const tokenTypedData = buildTokenTypedData({
    variant: ACTVariants.Fungible,
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
        ACTVariants.Fungible,
        maintainer.account.address,
        TOKEN.name,
        TOKEN.symbol,
        [],
        guardianSignature,
      ],
      maintainer,
    ),
  );

  const token = await getContractAt('IACTFungible', tokenAddress);

  logger.log('Minting tokens...');

  for (let i = 0; i < 5; i++) {
    const to = randomAddress();
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

  // Open transfers to all token holders
  await logger.logTx(
    'Token state changed to `Active`',
    token.write.setState([ACTStates.Active], maintainer),
  );

  // Change token ownership
  await logger.logTx(
    'Token system changed to `ConstitutionalMonarchy`',
    token.write.setSystem([ACTSystems.ConstitutionalMonarchy], maintainer),
  );

  logger.info('Token', {
    owner: await token.read.getOwner(),
    settings: await token.read.getSettings(),
  });
});
