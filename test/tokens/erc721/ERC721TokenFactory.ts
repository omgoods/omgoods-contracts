import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { randomAddress } from '../../common';
import { setupERC721TokenFactoryMock } from './fixtures';

describe('tokens/erc721/ERC721TokenFactory // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupERC721TokenFactoryMock>>;

  before(async () => {
    fixture = await loadFixture(setupERC721TokenFactoryMock);
  });

  describe('# setters', () => {
    describe('emitTokenTransfer()', () => {
      it('expect to revert when the sender is not a token', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.emitTokenTransfer(
          randomAddress(),
          randomAddress(),
          1,
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'MsgSenderIsNotTheToken',
        );
      });

      it('expect to emit the event', async () => {
        const { tokenFactory, signers } = fixture;

        const from = randomAddress();
        const to = randomAddress();
        const tokenId = 100;

        const tx = tokenFactory
          .connect(signers.token)
          .emitTokenTransfer(from, to, tokenId);

        await expect(tx)
          .emit(tokenFactory, 'TokenTransfer')
          .withArgs(signers.token.address, from, to, tokenId);
      });
    });

    describe('emitTokenApproval()', () => {
      it('expect to revert when the sender is not a token', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.emitTokenApproval(
          randomAddress(),
          randomAddress(),
          1,
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'MsgSenderIsNotTheToken',
        );
      });

      it('expect to emit the event', async () => {
        const { tokenFactory, signers } = fixture;

        const owner = randomAddress();
        const spender = randomAddress();
        const tokenId = 100;

        const tx = tokenFactory
          .connect(signers.token)
          .emitTokenApproval(owner, spender, tokenId);

        await expect(tx)
          .emit(tokenFactory, 'TokenApproval')
          .withArgs(signers.token.address, owner, spender, tokenId);
      });
    });

    describe('emitTokenApprovalForAll()', () => {
      it('expect to revert when the sender is not a token', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.emitTokenApprovalForAll(
          randomAddress(),
          randomAddress(),
          true,
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'MsgSenderIsNotTheToken',
        );
      });

      it('expect to emit the event', async () => {
        const { tokenFactory, signers } = fixture;

        const owner = randomAddress();
        const operator = randomAddress();
        const approved = true;

        const tx = tokenFactory
          .connect(signers.token)
          .emitTokenApprovalForAll(owner, operator, approved);

        await expect(tx)
          .emit(tokenFactory, 'TokenApprovalForAll')
          .withArgs(signers.token.address, owner, operator, approved);
      });
    });
  });
});
