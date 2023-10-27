import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../../../common';
import { setupERC20DefaultTokenImpl } from './fixtures';
import { ERC20_TOKEN } from '../constants';

describe('tokens/erc20/presets/ERC20DefaultTokenImpl', () => {
  let fixture: Awaited<ReturnType<typeof setupERC20DefaultTokenImpl>>;

  const createBeforeHook = (unlock = false) => {
    before(async () => {
      fixture = await loadFixture(setupERC20DefaultTokenImpl);

      if (unlock) {
        const { token } = fixture;

        await token.unlock();
      }
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('name()', () => {
      it('expect to return the name of the token', async () => {
        const { token } = fixture;

        const res = await token.name();

        expect(res).eq(ERC20_TOKEN.name);
      });
    });

    describe('symbol()', () => {
      it('expect to return the symbol of the token', async () => {
        const { token } = fixture;

        const res = await token.symbol();

        expect(res).eq(ERC20_TOKEN.symbol);
      });
    });
  });

  describe('# setters', () => {
    describe('mint()', () => {
      createBeforeHook(true);

      it('expect to revert when the sender is not the controller', async () => {
        const { token } = fixture;

        const tx = token.mint(randomAddress(), 10);

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheController',
        );
      });

      it('expect to mint the tokens', async () => {
        const { token, signers } = fixture;

        const to = randomAddress();
        const value = 10;

        const tx = token.connect(signers.controller).mint(to, value);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(ZeroAddress, to, value);
      });
    });

    describe('burn()', () => {
      createBeforeHook(true);

      const from = randomAddress();
      const value = 10;

      before(async () => {
        const { token, signers } = fixture;

        await token.connect(signers.controller).mint(from, value);
      });

      it('expect to revert when the sender is not the controller', async () => {
        const { token } = fixture;

        const tx = token.burn(randomAddress(), 10);

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheController',
        );
      });

      it('expect to burn the tokens', async () => {
        const { token, signers } = fixture;

        const tx = token.connect(signers.controller).burn(from, value);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(from, ZeroAddress, value);
      });
    });

    describe('_update()', () => {
      describe('# before unlocking', () => {
        createBeforeHook();

        it('expect to revert when the sender is not the owner', async () => {
          const { token, signers } = fixture;

          const tx = token
            .connect(signers.unknown.at(0))
            .transfer(randomAddress(), 10);

          await expect(tx).revertedWithCustomError(
            token,
            'MsgSenderIsNotTheOwner',
          );
        });

        it('expect to process when the sender is the owner', async () => {
          const { token } = fixture;

          const tx = token.mint(randomAddress(), 10);

          await expect(tx).emit(token, 'Transfer');
        });
      });

      describe('# after unlocking', () => {
        createBeforeHook(true);

        it('expect to work as usual', async () => {
          const { token } = fixture;

          const tx = token.transfer(randomAddress(), 10);

          await expect(tx).revertedWithCustomError(
            token,
            'ERC20InsufficientBalance',
          );
        });
      });
    });
  });
});
