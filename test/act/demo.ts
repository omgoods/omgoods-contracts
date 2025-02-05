import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import { viem } from 'hardhat';
import { Hash, zeroAddress } from 'viem';
import { ACTVariants, ACTStates } from './constants';

const { deployContract, getContractAt, getPublicClient, getWalletClients } =
  viem;

const symbol = 'TEST';

describe.only('demo', function () {
  async function deployFixture() {
    const impl = await deployContract('ACTFungibleImpl');
    const registry = await deployContract('ACTRegistry', [zeroAddress]);

    const publicClient = await getPublicClient();
    const walletClients = await getWalletClients();

    await registry.write.initialize([zeroAddress, [], zeroAddress, 20]);

    await registry.write.setVariant([ACTVariants.Fungible, impl.address]);

    const address = await registry.read.computeTokenAddress([
      ACTVariants.Fungible,
      symbol,
    ]);

    await registry.write.createToken([
      ACTVariants.Fungible,
      'Test',
      symbol,
      walletClients[0].account.address || zeroAddress,
    ]);

    const token = await getContractAt('ACTFungibleImpl', address as Hash);

    await token.write.setState([ACTStates.Tracked]);

    return {
      token,
      registry,
      publicClient,
      walletClients,
    };
  }

  describe('# executing transactions', function () {
    it('Should not to revert ...', async function () {
      const { token, registry, publicClient, walletClients } =
        await loadFixture(deployFixture);

      const actWalletExtension = await deployContract('ACTWalletExtension');

      await registry.write.setExtension([actWalletExtension.address, true]);

      await token.write.enableExtension([actWalletExtension.address]);

      const [, walletA, walletB] = walletClients;

      if (!walletA || !walletB) {
        return;
      }

      await walletClients.at(0)?.sendTransaction({
        to: token.address,
        value: 10000000n,
      });

      console.log(
        'token.balance:',
        await publicClient.getBalance({
          address: token.address,
        }),
      );

      const actWallet = await getContractAt(
        'ACTWalletExtension',
        token.address,
      );

      await actWallet.write.executeTransaction([
        {
          to: walletA.account.address,
          value: 500n,
          data: '0x',
        },
      ]);

      console.log(
        'token.balance:',
        await publicClient.getBalance({
          address: token.address,
        }),
      );
    });
  });

  describe('# sending transfers', function () {
    it('Should not to revert ...', async function () {
      const { token, publicClient, walletClients } =
        await loadFixture(deployFixture);

      if (walletClients) {
        const [walletA, walletB, walletC] = walletClients;

        if (walletB && walletC) {
          console.log('account:', walletA.account.address);

          await token.write.mint([walletA.account.address, 10_000_000]);

          for (let i = 0; i < 10; i++) {
            console.log();
            console.log('Transfer #', i);

            const hash = await token.write.transfer(
              [walletB.account.address, 1_000],
              walletA,
            );

            const txReceipt = await publicClient.waitForTransactionReceipt({
              hash,
            });

            console.log('gasUsed:', txReceipt?.gasUsed);

            console.log(
              'walletA.balanceOf:',
              await token.read.balanceOf([walletA.account.address]),
            );

            console.log(
              'walletB.balanceOf:',
              await token.read.balanceOf([walletB.account.address]),
            );

            console.log(
              'walletC.balanceOf:',
              await token.read.balanceOf([walletC.account.address]),
            );

            console.log('epoch:', await token.read.getEpoch());
            console.log('totalSupply:', await token.read.totalSupply());

            await token.write.mint([walletC.account.address, 100]);

            await time.increase(7);
          }

          for (let i = 0; i < 8; i++) {
            console.log();
            console.log(
              `totalSupplyAt(${i}):`,
              await token.read.totalSupplyAt([i]),
            );
            console.log(
              `walletA.balanceAt(${i}):`,
              await token.read.balanceAt([i, walletA.account.address]),
            );
            console.log(
              `walletB.balanceAt(${i}):`,
              await token.read.balanceAt([i, walletB.account.address]),
            );
            console.log(
              `walletC.balanceAt(${i}):`,
              await token.read.balanceAt([i, walletC.account.address]),
            );
          }
        }
      }

      console.log(await token.read.getSettings());
    });
  });
});
