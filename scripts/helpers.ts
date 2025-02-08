import { ignition, viem } from 'hardhat';
import { Hex } from 'viem';
import { ACTVariants } from '@/common';
import ERC4337Module from '@/modules/ERC4337';
import ACTModule from '@/modules/ACT';

const { getPublicClient, getContractAt, getWalletClients } = viem;

export async function buildHelpers() {
  const client = await getPublicClient();

  const [deployer, owner, maintainer, relayer, ...wallets] =
    await getWalletClients();

  const {
    entryPoint: { address: entryPointAddress },
  } = await ignition.deploy(ERC4337Module);

  const {
    registry: { address: registryAddress },
  } = await ignition.deploy(ACTModule, {
    parameters: {
      ACTRegistry: {
        entryPoint: entryPointAddress,
      },
    },
  });

  const entryPoint = await getContractAt('EntryPoint', entryPointAddress);

  const registry = await getContractAt('ACTRegistry', registryAddress);

  const getACTFungible = async (symbol: string) => {
    const address = await registry.read.computeTokenAddress([
      ACTVariants.Fungible,
      symbol,
    ]);

    return getContractAt('IACTFungible', address as Hex);
  };

  const getACTNonFungible = async (symbol: string) => {
    const address = await registry.read.computeTokenAddress([
      ACTVariants.NonFungible,
      symbol,
    ]);

    return getContractAt('IACTNonFungible', address as Hex);
  };

  const buildTokenTypedData = (message: {
    variant: ACTVariants;
    name: string;
    symbol: string;
    maintainer: Hex;
  }) => {
    return {
      domain: {
        chainId: client.chain.id,
        name: 'ACT Registry',
        version: '1',
        verifyingContract: registryAddress,
      },
      types: {
        Token: [
          { name: 'variant', type: 'uint8' },
          { name: 'maintainer', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
        ],
      },
      primaryType: 'Token',
      message,
    } as const;
  };

  return {
    client,
    deployer,
    owner,
    maintainer,
    relayer,
    wallets,
    entryPoint,
    registry,
    getACTFungible,
    getACTNonFungible,
    buildTokenTypedData,
  };
}
