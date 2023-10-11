import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../../../common';
import { setupERC721ControlledTokenFactory } from './fixtures';

describe('tokens/erc721/presets/ERC721ControlledTokenImpl', () => {
  let fixture: Awaited<ReturnType<typeof setupERC721ControlledTokenFactory>>;

  before(async () => {
    fixture = await loadFixture(setupERC721ControlledTokenFactory);
  });

  describe('# deployment', () => {
    describe('initialize()', () => {
      it('expect to revert', async () => {
        const { tokenImpl } = fixture;

        const tx = tokenImpl.initialize(ZeroAddress, '', '', [ZeroAddress]);

        await expect(tx).revertedWithCustomError(
          tokenImpl,
          'AlreadyInitialized',
        );
      });
    });
  });

  describe('# setters', () => {
    describe('mint()', () => {
      it('expect to revert when the sender is not the controller', async () => {
        const { token } = fixture;

        const tx = token.mint(randomAddress(), 10);

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheController',
        );
      });

      it('expect to mint token', async () => {
        const { token, signers } = fixture;

        const account = randomAddress();
        const tokenId = 10;

        const tx = token.connect(signers.controller).mint(account, tokenId);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(ZeroAddress, account, tokenId);
      });
    });

    describe('burn()', () => {
      const account = randomAddress();
      const tokenId = 20;

      before(async () => {
        const { token, signers } = fixture;

        await token.connect(signers.controller).mint(account, tokenId);
      });

      it('expect to revert when the sender is not the controller', async () => {
        const { token } = fixture;

        const tx = token.burn(10);

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheController',
        );
      });

      it('expect to burn tokens', async () => {
        const { token, signers } = fixture;

        const tx = token.connect(signers.controller).burn(tokenId);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(account, ZeroAddress, tokenId);
      });
    });
  });
});
