import { ignition, viem } from 'hardhat';
import { Hex } from 'viem';
import { ACTVariants } from '@/common';
import ACTModule from '../ignition/modules/ACT';
import ERC4337Module from '../ignition/modules/ERC4337';

const { getPublicClient, getWalletClients, getContractAt } = viem;

async function main() {
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

  const publicClient = await getPublicClient();

  const entryPoint = await getContractAt('EntryPoint', entryPointAddress);
  const registry = await getContractAt('ACTRegistry', registryAddress);

  const [deployer, owner, maintainer] = await getWalletClients();

  const SYMBOL = 'TEST';

  const guardianSignature = await owner.signTypedData({
    domain: {
      name: 'ACT Registry',
      version: '1',
      chainId: publicClient.chain.id,
      verifyingContract: registry.address,
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
    message: {
      variant: ACTVariants.Fungible,
      maintainer: maintainer.account.address,
      name: 'Test',
      symbol: SYMBOL,
    },
  });

  const tokenAddress = await registry.read.computeTokenAddress([
    ACTVariants.Fungible,
    SYMBOL,
  ]);

  const token = await getContractAt('ACTFungibleImpl', tokenAddress as Hex);

  await registry.write.createToken([
    ACTVariants.Fungible,
    maintainer.account.address,
    'Test',
    SYMBOL,
    guardianSignature,
  ]);

  console.log();
  console.log('token.address:', token.address);
  console.log('token.name:', await token.read.name());
  console.log('token.symbol:', await token.read.symbol());

  console.log();
  console.log(
    'createdToken:',
    await registry.read.getCreatedToken([tokenAddress]),
  );
}

main().catch(console.error);
