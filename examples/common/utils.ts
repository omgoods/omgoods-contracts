import hre from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Hex } from 'viem';
import { TypedDataDomainNames, ACTVariants } from '@/common';
import ERC4337Module from '@/modules/ERC4337';
import ACTModule from '@/modules/ACT';

export async function getWallets() {
  const {
    viem: { getWalletClients },
  } = hre;

  const [deployer, owner, ...wallets] = await getWalletClients();

  return {
    deployer,
    owner,
    wallets,
  } as const;
}

export async function getContracts() {
  const {
    ignition,
    viem: { getContractAt },
  } = hre;

  const {
    entryPoint: { address: entryPointAddress },
  } = await ignition.deploy(ERC4337Module);

  const {
    registry: { address: registryAddress },
    signerExtension: { address: signer },
    votingExtension: { address: voting },
    walletExtension: { address: wallet },
  } = await ignition.deploy(ACTModule, {
    parameters: {
      ACTRegistry: {
        entryPoint: entryPointAddress,
      },
    },
  });

  const entryPoint = await getContractAt('EntryPoint', entryPointAddress);

  const registry = await getContractAt('ACTRegistry', registryAddress);

  return {
    entryPoint,
    registry,
    extensions: {
      signer,
      voting,
      wallet,
    },
  } as const;
}

export async function buildHelpers() {
  const {
    viem: { getPublicClient },
  } = hre;

  const client = await getPublicClient();

  const contracts = await getContracts();

  const wallets = await getWallets();

  const logger = {
    log: (message?: string) => {
      console.log(message ? `[LOG] ${message}` : '');
    },
    info: (message: string, ...args: unknown[]) => {
      console.log(`[INFO] ${message}${args.length ? ':' : ''}`, ...args);
    },
    logTx: async (label: string, hashOrPromise: Promise<Hex> | Hex) => {
      const hash = await hashOrPromise;

      const { gasUsed } = await client.waitForTransactionReceipt({ hash });

      console.log(`[COMPLETED] ${label}:`, {
        hash,
        gasUsed,
      });
    },
  };

  const buildTokenTypedData = (message: {
    variant: ACTVariants;
    name: string;
    symbol: string;
    maintainer: Hex;
    extensions: Hex[];
  }) => {
    return {
      domain: {
        chainId: client.chain.id,
        name: TypedDataDomainNames.ACTRegistry,
        version: '1',
        verifyingContract: contracts.registry.address,
      },
      types: {
        Token: [
          { name: 'variant', type: 'uint8' },
          { name: 'maintainer', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'extensions', type: 'address[]' },
        ],
      },
      primaryType: 'Token',
      message,
    } as const;
  };

  const computeTokenAddress = (variant: ACTVariants, symbol: string) => {
    return contracts.registry.read.computeTokenAddress([
      variant,
      symbol,
    ]) as Promise<Hex>;
  };

  return {
    client,
    ...contracts,
    ...wallets,
    logger,
    buildTokenTypedData,
    computeTokenAddress,
  } as const;
}

export function runExample(
  example: (hre: HardhatRuntimeEnvironment) => Promise<void>,
) {
  const { network } = hre;

  if (network.name !== 'hardhat') {
    throw new Error('This example can only be run on hardhat network');
  }

  example(hre).catch(console.error);
}
