import { encodeFunctionData, formatEther, Hash, parseEther } from 'viem';
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
    extensions,
    owner,
    wallets,
    buildTokenTypedData,
    computeTokenAddress,
  } = await buildHelpers();

  const [maintainer, relayer] = wallets;

  const tokenAddress = await computeTokenAddress(TOKEN.variant, TOKEN.symbol);
  const tokenExtensions = [extensions.wallet];

  await logger.logTx(
    'Top-up token using relayer',
    relayer.sendTransaction({
      to: tokenAddress,
      value: randomEther(100, 10),
    }),
  );

  logger.info('Token', {
    address: tokenAddress,
    ...TOKEN,
    extensions: tokenExtensions,
    balance: formatEther(await client.getBalance({ address: tokenAddress })),
  });

  const userOps: PackedUserOperation[] = [];

  const addUserOp = async (callData: Hash) => {
    const nonce = BigInt(userOps.length);

    const userOp: UserOperation<'0.7'> = {
      sender: tokenAddress,
      nonce,
      callData,
      callGasLimit: 500_000n,
      maxFeePerGas: 100n, // Set to 100 for simplicity
      maxPriorityFeePerGas: 100n, // Set to 100 for simplicity
      preVerificationGas: 200_000n,
      verificationGasLimit: 500_000n,
      signature: '0x', // Placeholder for signature
    };

    if (nonce === 0n) {
      const tokenTypedData = buildTokenTypedData({
        variant: TOKEN.variant,
        maintainer: maintainer.account.address,
        name: TOKEN.name,
        symbol: TOKEN.symbol,
        extensions: tokenExtensions,
      });

      const guardianSignature = await owner.signTypedData(tokenTypedData);

      // Additional parameters for token deployment
      userOp.factory = registry.address;
      userOp.factoryData = encodeFunctionData({
        abi: registry.abi,
        functionName: 'createToken',
        args: [
          TOKEN.variant,
          maintainer.account.address,
          TOKEN.name,
          TOKEN.symbol,
          tokenExtensions,
          guardianSignature,
        ],
      });
    }

    const userOpHash = getUserOperationHash({
      chainId: client.chain.id,
      entryPointAddress: entryPoint.address,
      entryPointVersion: '0.7',
      userOperation: userOp,
    });

    userOp.signature = await maintainer.signMessage({
      message: {
        raw: userOpHash,
      },
    });

    userOps.push(toPackedUserOperation(userOp));

    return {
      userOp: {
        nonce,
        factory: userOp.factory,
      },
      userOpHash,
    };
  };

  // minting
  {
    const token = await getContractAt('ACTFungibleImpl', tokenAddress);

    for (let i = 0; i < 5; i++) {
      const to = randomAddress();
      const value = randomEther();

      const callData = encodeFunctionData({
        abi: token.abi,
        functionName: 'mint',
        args: [to, value],
      });

      logger.info(
        `Adding userOp for minting ${formatEther(value)} ${TOKEN.symbol} to ${to}`,
        await addUserOp(callData),
      );
    }
  }

  // executing transaction from the token contract
  {
    // use extension
    const token = await getContractAt('ACTWalletExtension', tokenAddress);

    const to = randomAddress();
    const value = parseEther('5');

    const callData = encodeFunctionData({
      abi: token.abi,
      functionName: 'executeTransaction',
      args: [
        {
          to,
          value,
          data: '0x',
        },
      ],
    });

    logger.info(
      `Adding userOp for transferring ${formatEther(value)} ETH to ${to}`,
      await addUserOp(callData),
    );
  }

  // Use relayer as beneficiary
  await logger.logTx(
    'Executing userOps',
    entryPoint.write.handleOps([userOps, relayer.account.address], relayer),
  );

  logger.info('Token', {
    balance: formatEther(await client.getBalance({ address: tokenAddress })),
  });

  logger.info('UserOps', userOps);
});
