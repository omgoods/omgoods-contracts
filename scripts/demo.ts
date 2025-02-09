import { encodeFunctionData, Hex, parseEther } from 'viem';
import {
  getUserOperationHash,
  UserOperation,
  toPackedUserOperation,
  PackedUserOperation,
} from 'viem/account-abstraction';
import { ACTVariants, randomAddress } from '@/common';
import { buildHelpers } from './helpers';

const TOKEN_NAME = 'Demo';
const TOKEN_SYMBOL = 'DMO';

const TOKEN_DISTRIBUTION: [to: Hex, value: bigint][] = [
  [randomAddress(), parseEther('1000')],
  [randomAddress(), parseEther('5000')],
  [randomAddress(), parseEther('25000')],
] as const;

async function main() {
  const {
    client,
    owner,
    maintainer,
    relayer,
    entryPoint,
    registry,
    getACTFungible,
    buildTokenTypedData,
  } = await buildHelpers();

  let nonce = 0n;

  // Compute token address and get contract instance for it
  const token = await getACTFungible(TOKEN_SYMBOL);

  const packedUseOps: PackedUserOperation[] = [];

  // Build first UserOp with init code

  // Sign guardian signature required for token creation
  const guardianSignature = await owner.signTypedData(
    buildTokenTypedData({
      variant: ACTVariants.Fungible, // Specifies that the token is fungible
      maintainer: maintainer.account.address,
      name: TOKEN_NAME,
      symbol: TOKEN_SYMBOL,
      extensions: [],
    }),
  );

  const factoryData = encodeFunctionData({
    abi: registry.abi,
    functionName: 'createToken',
    args: [
      ACTVariants.Fungible,
      maintainer.account.address,
      TOKEN_NAME,
      TOKEN_SYMBOL,
      [],
      guardianSignature, // Guardian's signature for token creation
    ],
  });

  const callData = encodeFunctionData({
    abi: token.abi,
    functionName: 'mint',
    args: TOKEN_DISTRIBUTION[0],
  });

  const userOp: UserOperation<'0.7'> = {
    sender: token.address,
    nonce,
    factory: registry.address,
    factoryData, // Data for creating the token
    callData, // Data for minting the token
    callGasLimit: 500_000n,
    maxFeePerGas: 0n, // Set to 0 for simplicity
    maxPriorityFeePerGas: 0n, // Set to 0 for simplicity
    preVerificationGas: 200_000n,
    verificationGasLimit: 500_000n,
    signature: '0x', // Placeholder for signature
  };

  const userOpHash = getUserOperationHash({
    chainId: client.chain.id,
    entryPointAddress: entryPoint.address,
    entryPointVersion: '0.7',
    userOperation: userOp,
  });

  console.log('userOpHash#0:', userOpHash);

  userOp.signature = await maintainer.signMessage({
    message: {
      raw: userOpHash,
    },
  });

  packedUseOps.push(toPackedUserOperation(userOp)); // Add packed user operation

  // Build other UserOps

  for (let i = 1; i < TOKEN_DISTRIBUTION.length; i++) {
    const callData = encodeFunctionData({
      abi: token.abi,
      functionName: 'mint',
      args: TOKEN_DISTRIBUTION[i],
    });

    // mint
    const userOp: UserOperation<'0.7'> = {
      sender: token.address,
      nonce: ++nonce, // Incremented nonce value
      callData, // Data for minting the token
      callGasLimit: 500_000n,
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
      preVerificationGas: 200_000n,
      verificationGasLimit: 500_000n,
      signature: '0x', // Placeholder for signature
    };

    const userOpHash = getUserOperationHash({
      chainId: client.chain.id,
      entryPointAddress: entryPoint.address,
      entryPointVersion: '0.7',
      userOperation: userOp,
    });

    console.log(`userOpHash#${i}:`, userOpHash);

    userOp.signature = await maintainer.signMessage({
      message: {
        raw: userOpHash,
      },
    });

    packedUseOps.push(toPackedUserOperation(userOp)); // Add packed user operation
  }

  // Execute all user ops
  const hash = await entryPoint.write.handleOps(
    [packedUseOps, relayer.account.address],
    relayer,
  );

  const { gasUsed } = await client.waitForTransactionReceipt({ hash });

  console.log();
  console.log('tx.gasUsed:', gasUsed);
  console.log();
  console.log('token.totalSupply:', await token.read.totalSupply());
  for (let i = 0; i < TOKEN_DISTRIBUTION.length; i++) {
    console.log(
      `token.balanceOf(account#${i}):`,
      await token.read.balanceOf([TOKEN_DISTRIBUTION[i][0]]),
    );
  }
}

main().catch(console.error);
