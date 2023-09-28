import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../../../common';
import { setupERC20WrappedTokenFactory } from './fixtures';

describe('token/erc20/wrapped/ERC20WrappedTokenImpl', () => {
  let fixture: Awaited<ReturnType<typeof setupERC20WrappedTokenFactory>>;

  before(async () => {
    fixture = await loadFixture(setupERC20WrappedTokenFactory);
  });

  describe('# deployment', () => {
    describe('initialize()', () => {
      it('expect to revert', async () => {
        const { tokenImpl } = fixture;

        const tx = tokenImpl.initialize(ZeroAddress, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenImpl,
          'AlreadyInitialized',
        );
      });
    });
  });

  describe('# getters', () => {
    describe('getUnderlyingToken()', () => {
      it('expect to return the underlying token', async () => {
        const { token, underlyingToken } = fixture;

        const res = await token.getUnderlyingToken();

        expect(res).eq(await underlyingToken.getAddress());
      });
    });
  });

  describe('# setters', () => {
    describe('deposit()', () => {
      it('expect to deposit tokens', async () => {
        const { token, signers, underlyingToken } = fixture;

        const from = signers.owner.address;
        const value = 10;

        const tx = token.deposit(value);

        await expect(tx).changeTokenBalance(token, from, value);
        await expect(tx).changeTokenBalance(underlyingToken, from, -value);
      });
    });

    describe('depositTo()', () => {
      it('expect to deposit tokens to the specific account', async () => {
        const { token, signers, underlyingToken } = fixture;

        const from = signers.owner.address;
        const to = randomAddress();
        const value = 100;

        const tx = token.depositTo(to, value);

        await expect(tx).changeTokenBalance(token, to, value);
        await expect(tx).changeTokenBalance(underlyingToken, from, -value);
      });
    });

    describe('withdraw()', () => {
      it('expect to withdraw tokens', async () => {
        const { token, signers, underlyingToken } = fixture;

        const from = signers.owner.address;
        const value = 5;

        const tx = token.withdraw(value);

        await expect(tx).changeTokenBalance(token, from, -value);
        await expect(tx).changeTokenBalance(underlyingToken, from, value);
      });
    });

    describe('withdrawTo()', () => {
      it('expect to withdraw tokens to the specific account', async () => {
        const { token, signers, underlyingToken } = fixture;

        const from = signers.owner.address;
        const to = randomAddress();
        const value = 100;

        const tx = token.withdrawTo(to, value);

        await expect(tx).changeTokenBalance(token, from, -value);
        await expect(tx).changeTokenBalance(underlyingToken, to, value);
      });
    });
  });
});
