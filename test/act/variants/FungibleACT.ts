import { viem } from 'hardhat';
import { expect } from 'chai';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import { Hash, zeroAddress } from 'viem';

const { deployContract, getContractAt, getPublicClient, getWalletClients } =
  viem;

const symbol = 'TEST';

describe.only('act/variants/FungibleACT', function () {
  async function deployFixture() {
    const actVariant = await deployContract('FungibleACT');
    const actRegistry = await deployContract('ACTRegistry', [zeroAddress]);
    const publicClient = await getPublicClient();
    const walletClients = await getWalletClients();

    const address = await actRegistry.read.computeTokenAddress([
      actVariant.address,
      symbol,
    ]);

    await time.increase(1000);

    await actRegistry.write.initialize([zeroAddress, [], zeroAddress, 20]);

    await actRegistry.write.createToken([
      actVariant.address,
      'Test',
      symbol,
      zeroAddress,
      true,
    ]);

    const act = await getContractAt('FungibleACT', address as Hash);

    return {
      act,
      publicClient,
      walletClients,
    };
  }

  describe('# external getters', function () {
    describe('name()', function () {
      it('Should return token symbol', async function () {
        const { act, publicClient, walletClients } =
          await loadFixture(deployFixture);

        if (walletClients) {
          const [walletA, walletB, walletC] = walletClients;

          if (walletB && walletC) {
            console.log('account:', walletA.account.address);

            await act.write.mint(
              [walletA.account.address, 10_000_000],
              walletB,
            );

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

              await act.write.mint([walletC.account.address, 100], walletA);

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

        expect(await act.read.symbol()).eq(symbol);
      });
    });
  });
});
