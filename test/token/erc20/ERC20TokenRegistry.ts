import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { helpers } from 'hardhat';
import { expect } from 'chai';
import { setupERC20TokenRegistry } from './fixtures';

const { randomAddress } = helpers;

describe('token/erc20/ERC20TokenRegistry', () => {
  let fixture: Awaited<ReturnType<typeof setupERC20TokenRegistry>>;

  before(async () => {
    fixture = await loadFixture(setupERC20TokenRegistry);
  });

  describe('# setters', () => {
    describe('emitTokenTransfer()', () => {
      it('expect to revert when the sender is not a token', async () => {
        const { tokenRegistry, signers } = fixture;

        const tx = tokenRegistry
          .connect(signers.unknown.at(0))
          .emitTokenTransfer(randomAddress(), randomAddress(), 0);

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'MsgSenderIsNotTheToken',
        );
      });

      it('expect to emit an event', async () => {
        const { tokenRegistry, signers } = fixture;

        const from = randomAddress();
        const to = randomAddress();
        const amount = 10;

        const tx = tokenRegistry
          .connect(signers.token)
          .emitTokenTransfer(from, to, amount);

        await expect(tx)
          .emit(tokenRegistry, 'TokenTransfer')
          .withArgs(signers.token.address, from, to, amount);
      });
    });

    describe('emitTokenApproval()', () => {
      it('expect to revert when the sender is not a token', async () => {
        const { tokenRegistry, signers } = fixture;

        const tx = tokenRegistry
          .connect(signers.unknown.at(0))
          .emitTokenApproval(randomAddress(), randomAddress(), 0);

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'MsgSenderIsNotTheToken',
        );
      });

      it('expect to emit an event', async () => {
        const { tokenRegistry, signers } = fixture;

        const owner = randomAddress();
        const spender = randomAddress();
        const amount = 5;

        const tx = tokenRegistry
          .connect(signers.token)
          .emitTokenApproval(owner, spender, amount);

        await expect(tx)
          .emit(tokenRegistry, 'TokenApproval')
          .withArgs(signers.token.address, owner, spender, amount);
      });
    });
  });
});
