import { viem } from 'hardhat';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import { Hash, zeroAddress } from 'viem';
import { ACTVariants, ACTStates } from './constants';

const { deployContract, getContractAt, getPublicClient, getWalletClients } =
  viem;

const symbol = 'TEST';

describe.only('act/variants/FungibleACT', function () {
  async function deployFixture() {
    const actVariant = await deployContract('FungibleACT');
    const actRegistry = await deployContract('ACTRegistry', [zeroAddress]);
    const publicClient = await getPublicClient();
    const walletClients = await getWalletClients();

    await actRegistry.write.initialize([zeroAddress, [], zeroAddress, 20]);

    await actRegistry.write.setTokenVariant([
      ACTVariants.Fungible,
      actVariant.address,
    ]);

    const address = await actRegistry.read.computeTokenAddress([
      ACTVariants.Fungible,
      symbol,
    ]);

    await actRegistry.write.createToken([
      ACTVariants.Fungible,
      'Test',
      symbol,
      walletClients[0].account.address || zeroAddress,
    ]);

    const act = await getContractAt('FungibleACT', address as Hash);

    await act.write.setState([ACTStates.Tracked]);

    return {
      act,
      actRegistry,
      publicClient,
      walletClients,
    };
  }

  describe.only('# executing transactions', function () {
    it('Should not to revert ...', async function () {
      const { act, actRegistry, publicClient, walletClients } =
        await loadFixture(deployFixture);

      const actWalletExtension = await deployContract('ACTWalletExtension');

      await actRegistry.write.setExtension([actWalletExtension.address, true]);

      await act.write.enableExtension([actWalletExtension.address]);

      const [, walletA, walletB] = walletClients;

      if (!walletA || !walletB) {
        return;
      }

      await walletClients.at(0)?.sendTransaction({
        to: act.address,
        value: 10000000n,
      });

      console.log(
        'act.balance:',
        await publicClient.getBalance({
          address: act.address,
        }),
      );

      const actWallet = await getContractAt('ACTWalletExtension', act.address);

      await actWallet.write.executeTransaction([
        {
          to: walletA.account.address,
          value: 500n,
          data: '0x',
        },
      ]);

      console.log(
        'act.balance:',
        await publicClient.getBalance({
          address: act.address,
        }),
      );
    });
  });

  describe('# sending transfers', function () {
    it('Should not to revert ...', async function () {
      const { act, publicClient, walletClients } =
        await loadFixture(deployFixture);

      if (walletClients) {
        const [walletA, walletB, walletC] = walletClients;

        if (walletB && walletC) {
          console.log('account:', walletA.account.address);

          await act.write.mint([walletA.account.address, 10_000_000]);

          for (let i = 0; i < 10; i++) {
            console.log();
            console.log('Transfer #', i);

            const hash = await act.write.transfer(
              [walletB.account.address, 1_000],
              walletA,
            );

            const txReceipt = await publicClient.waitForTransactionReceipt({
              hash,
            });

            console.log('gasUsed:', txReceipt?.gasUsed);

            console.log(
              'walletA.balanceOf:',
              await act.read.balanceOf([walletA.account.address]),
            );

            console.log(
              'walletB.balanceOf:',
              await act.read.balanceOf([walletB.account.address]),
            );

            console.log(
              'walletC.balanceOf:',
              await act.read.balanceOf([walletC.account.address]),
            );

            console.log('epoch:', await act.read.getEpoch());
            console.log('totalSupply:', await act.read.totalSupply());

            await act.write.mint([walletC.account.address, 100]);

            await time.increase(7);
          }

          for (let i = 0; i < 8; i++) {
            console.log();
            console.log(
              `getTotalSupplyAt(${i}):`,
              await act.read.getTotalSupplyAt([i]),
            );
            console.log(
              `walletA.getBalanceAt(${i}):`,
              await act.read.getBalanceAt([i, walletA.account.address]),
            );
            console.log(
              `walletB.getBalanceAt(${i}):`,
              await act.read.getBalanceAt([i, walletB.account.address]),
            );
            console.log(
              `walletC.getBalanceAt(${i}):`,
              await act.read.getBalanceAt([i, walletC.account.address]),
            );
          }
        }
      }

      console.log(await act.read.getSettings());
    });
  });
});
