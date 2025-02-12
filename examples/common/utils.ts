import hre from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { encodeAbiParameters, Hex, keccak256 } from 'viem';
import { TypedDataDomainNames, ACTVariants } from '@/common';
import ERC4337Module from '@/modules/ERC4337';
import ACTModule from '@/modules/ACT';
import { Logger } from './Logger';

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

  const logger = new Logger(client);

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

  const computeProposalHash = (currentEpoch: number, data: unknown) => {
    return keccak256(
      encodeAbiParameters(
        [
          { type: 'uint48', name: 'epoch' },
          { type: 'bytes', name: 'data' },
        ],
        [currentEpoch + 1, data as Hex],
      ),
    );
  };

  return {
    client,
    ...contracts,
    ...wallets,
    logger,
    buildTokenTypedData,
    computeTokenAddress,
    computeProposalHash,
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
