import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { randomAddress } from '../../common';
import { setupERC20TokenFactoryMock } from './fixtures';

describe('token/erc20/ERC20TokenFactory // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupERC20TokenFactoryMock>>;

  before(async () => {
    fixture = await loadFixture(setupERC20TokenFactoryMock);
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
        const value = 100;

        const tx = tokenFactory
          .connect(signers.token)
          .emitTokenTransfer(from, to, value);

        await expect(tx)
          .emit(tokenFactory, 'TokenTransfer')
          .withArgs(signers.token.address, from, to, value);
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
        const value = 100;

        const tx = tokenFactory
          .connect(signers.token)
          .emitTokenApproval(owner, spender, value);

        await expect(tx)
          .emit(tokenFactory, 'TokenApproval')
          .withArgs(signers.token.address, owner, spender, value);
      });
    });
  });
});
