import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { utils } from 'hardhat';
import { expect } from 'chai';
import { setupERC721DefaultTokenImpl } from './fixtures';
import { ERC721_TOKEN } from '../constants';

const { randomAddress } = utils;

describe('tokens/erc721/presets/ERC721DefaultTokenImpl', () => {
  let fixture: Awaited<ReturnType<typeof setupERC721DefaultTokenImpl>>;

  const createBeforeHook = (unlock = false) => {
    before(async () => {
      fixture = await loadFixture(setupERC721DefaultTokenImpl);

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

        expect(res).eq(ERC721_TOKEN.name);
      });
    });

    describe('symbol()', () => {
      it('expect to return the symbol of the token', async () => {
        const { token } = fixture;

        const res = await token.symbol();

        expect(res).eq(ERC721_TOKEN.symbol);
      });
    });
  });

  describe('# setters', () => {
    describe('mint()', () => {
      createBeforeHook(true);

      it('expect to revert when the sender is not the controller', async () => {
        const { token } = fixture;

        const tx = token.mint(randomAddress(), 50001);

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheController',
        );
      });

      it('expect to mint the token', async () => {
        const { token, signers } = fixture;

        const to = randomAddress();
        const tokenId = 50001;

        const tx = token.connect(signers.controller).mint(to, tokenId);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(ZeroAddress, to, tokenId);
      });
    });

    describe('burn()', () => {
      createBeforeHook(true);

      const from = randomAddress();
      const tokenId = 5000;

      before(async () => {
        const { token, signers } = fixture;

        await token.connect(signers.controller).mint(from, tokenId);
      });

      it('expect to revert when the sender is not the controller', async () => {
        const { token } = fixture;

        const tx = token.burn(from);

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheController',
        );
      });

      it('expect to burn the token', async () => {
        const { token, signers } = fixture;

        const tx = token.connect(signers.controller).burn(tokenId);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(from, ZeroAddress, tokenId);
      });
    });

    describe('_update()', () => {
      describe('# before unlocking', () => {
        createBeforeHook();

        it('expect to revert when the sender is not the owner', async () => {
          const { token, signers } = fixture;

          const tx = token
            .connect(signers.unknown.at(0))
            .transferFrom(randomAddress(), randomAddress(), 10);

          await expect(tx).revertedWithCustomError(
            token,
            'MsgSenderIsNotTheOwner',
          );
        });

        it('expect to process when the sender is the owner', async () => {
          const { token } = fixture;

          const tx = token.mint(randomAddress(), 50002);

          await expect(tx).emit(token, 'Transfer');
        });
      });

      describe('# after unlocking', () => {
        createBeforeHook(true);

        const tokenId = 5001;

        before(async () => {
          const { token, signers } = fixture;

          await token.connect(signers.controller).mint(signers.owner, tokenId);
        });

        it('expect to work as usual', async () => {
          const { token, signers } = fixture;

          const tx = token.transferFrom(
            signers.owner,
            randomAddress(),
            tokenId,
          );

          await expect(tx).emit(token, 'Transfer');
        });
      });
    });
  });
});
