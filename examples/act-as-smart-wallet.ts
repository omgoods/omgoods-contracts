import { encodeFunctionData, formatEther } from 'viem';
import {
  getUserOperationHash,
  UserOperation,
  toPackedUserOperation,
  PackedUserOperation,
} from 'viem/account-abstraction';
import { ACTVariants, randomAddress, randomEther } from '@/common';
import { buildHelpers, runExample } from './common';

const TOKEN = {
  variant: ACTVariants.Fungible,
  name: 'Example Smart Wallet',
  symbol: 'EXS',
};

runExample(async (hre) => {
  const {
    viem: { getContractAt },
  } = hre;

  const {
    client,
    logger,
    entryPoint,
    registry,
    owner,
    wallets,
    buildTokenTypedData,
    computeTokenAddress,
  } = await buildHelpers();

  const [maintainer, relayer] = wallets;

  const tokenAddress = await computeTokenAddress(
    ACTVariants.Fungible,
    TOKEN.symbol,
  );

  const token = await getContractAt('IACTFungible', tokenAddress);

  logger.info('Token', {
    address: tokenAddress,
    ...TOKEN,
  });

  const userOps: PackedUserOperation[] = [];

  let nonceTracker = 0n;

  const tokenTypedData = buildTokenTypedData({
    variant: ACTVariants.Fungible,
    maintainer: maintainer.account.address,
    name: TOKEN.name,
    symbol: TOKEN.symbol,
    extensions: [],
  });

  const guardianSignature = await owner.signTypedData(tokenTypedData);

  const factoryData = encodeFunctionData({
    abi: registry.abi,
    functionName: 'createToken',
    args: [
      ACTVariants.Fungible,
      maintainer.account.address,
      TOKEN.name,
      TOKEN.symbol,
      [],
      guardianSignature,
    ],
  });

  logger.log('Create minting userOps...');

  for (let i = 0; i < 5; i++) {
    const to = randomAddress();
    const value = randomEther();

    const callData = encodeFunctionData({
      abi: token.abi,
      functionName: 'mint',
      args: [to, value],
    });

    // Calculate required gas / fees should be done using external lib / service
    const userOp: UserOperation<'0.7'> = {
      sender: token.address,
      nonce: nonceTracker++, // Incremented nonce value
      callData, // Data for minting the token
      callGasLimit: 500_000n,
      maxFeePerGas: 0n, // Set to 0 for simplicity
      maxPriorityFeePerGas: 0n, // Set to 0 for simplicity
      preVerificationGas: 200_000n,
      verificationGasLimit: 500_000n,
      signature: '0x', // Placeholder for signature
    };

    if (i === 0) {
      // Need to add factory options the first userOp
      userOp.factory = registry.address;
      userOp.factoryData = factoryData;
    }

    const userOpHash = getUserOperationHash({
      chainId: client.chain.id,
      entryPointAddress: entryPoint.address,
      entryPointVersion: '0.7',
      userOperation: userOp,
    });

    // Sign userOp
    userOp.signature = await maintainer.signMessage({
      message: {
        raw: userOpHash,
      },
    });

    userOps.push(toPackedUserOperation(userOp));

    logger.info(
      `UserOp for minting ${formatEther(value)} ${TOKEN.symbol} to ${to}`,
      {
        userOp: {
          nonce: userOp.nonce,
          factory: userOp.factory,
        },
        userOpHash,
      },
    );
  }

  logger.log('Executing userOps...');

  // Use relayer as beneficiary
  await logger.logTx(
    'UserOps executed',
    entryPoint.write.handleOps([userOps, relayer.account.address], relayer),
  );
});
