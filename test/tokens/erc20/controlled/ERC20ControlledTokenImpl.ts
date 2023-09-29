import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../../../common';
import { setupERC20ControlledTokenFactory } from './fixtures';

describe('tokens/erc20/controlled/ERC20ControlledTokenImpl', () => {
  let fixture: Awaited<ReturnType<typeof setupERC20ControlledTokenFactory>>;

  before(async () => {
    fixture = await loadFixture(setupERC20ControlledTokenFactory);
  });

  describe('# deployment', () => {
    describe('initialize()', () => {
      it('expect to revert', async () => {
        const { tokenImpl } = fixture;

        const tx = tokenImpl.initialize(ZeroAddress, '', '', ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenImpl,
          'AlreadyInitialized',
        );
      });
    });
  });

  describe('# getters', () => {
    describe('getController()', () => {
      it('expect to return the controller', async () => {
        const { token, signers } = fixture;

        const res = await token.getController();

        expect(res).eq(signers.controller.address);
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

      it('expect to mint tokens', async () => {
        const { token, signers } = fixture;

        const account = randomAddress();
        const value = 10;

        const tx = token.connect(signers.controller).mint(account, value);

        await expect(tx).changeTokenBalance(token, account, value);
      });
    });

    describe('burn()', () => {
      const account = randomAddress();
      const value = 10;

      before(async () => {
        const { token, signers } = fixture;

        await token.connect(signers.controller).mint(account, value);
      });

      it('expect to revert when the sender is not the controller', async () => {
        const { token } = fixture;

        const tx = token.burn(randomAddress(), 10);

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheController',
        );
      });

      it('expect to burn tokens', async () => {
        const { token, signers } = fixture;

        const tx = token.connect(signers.controller).burn(account, value);

        await expect(tx).changeTokenBalance(token, account, -value);
      });
    });
  });
});
