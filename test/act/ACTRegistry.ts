import { viem } from 'hardhat';
import { zeroAddress, Hash } from 'viem';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

const { deployContract, getContractAt, getPublicClient, getWalletClients } =
  viem;

describe('act/ACTRegistry', function () {
  async function deployFixture() {
    const act = await deployContract('FungibleACT');
    const actRegistry = await deployContract('ACTRegistry');
    const publicClient = await getPublicClient();
    const walletClients = await getWalletClients();

    if (!walletClients) {
      throw new Error('walletClients is not defined');
    }

    return {
      act,
      actRegistry,
      publicClient,
      walletClients,
    };
  }

  it('Should not to revert', async function () {
    const { act, actRegistry, publicClient, walletClients } =
      await loadFixture(deployFixture);

    const [walletA, walletB] = walletClients;

    if (!walletA || !walletB) {
      throw new Error('walletA or walletB is not defined');
    }

    const symbol = 'TEST';

    const hash = await actRegistry.write.createToken([
      act.address,
      'Test',
      symbol,
      zeroAddress,
      true,
      2,
    ]);

    const txReceipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log('gasUsed:', txReceipt?.gasUsed);

    const address = await actRegistry.read.computeTokenAddress([
      act.address,
      symbol,
    ]);

    console.log('address:', address);

    const token = await getContractAt('FungibleACT', address as Hash);

    console.log('name:', await token.read.name());
    console.log('symbol:', await token.read.symbol());
    console.log('settings:', await token.read.getSettings());
  });
});
