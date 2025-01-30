import { viem } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';

const { deployContract, getPublicClient, getWalletClients } = viem;

describe('act/variants/FungibleACT', function () {
  async function deployFixture() {
    const act = await deployContract('FungibleACT');
    const publicClient = await getPublicClient();
    const walletClients = await getWalletClients();

    return {
      act,
      publicClient,
      walletClients,
    };
  }

  describe('# external getters', function () {
    describe('name()', function () {
      it('Should return token name', async function () {
        const name = 'example';

        const { act, publicClient, walletClients } =
          await loadFixture(deployFixture);

        await act.write.setName([name]);

        console.log('name:', await act.read.name());

        if (walletClients) {
          const [walletA, walletB] = walletClients;

          if (walletA && walletB) {
            console.log('account:', walletA.account.address);

            await act.write.mint(
              [walletA.account.address, 10_000_000],
              walletB,
            );

            const hash = await act.write.transfer(
              [walletB.account.address, 1_000_000],
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
            console.log('totalSupply:', await act.read.totalSupply());
          }
        }

        expect(await act.read.name()).eq(name);
      });
    });
  });
});
