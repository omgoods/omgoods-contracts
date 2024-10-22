import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { utils } from 'hardhat';
import { setupERC20TokenWrappedImpl } from './fixtures';

const { randomAddress } = utils;

describe('tokens/erc20/presets/ERC20TokenWrappedImpl', () => {
  let fixture: Awaited<ReturnType<typeof setupERC20TokenWrappedImpl>>;

  before(async () => {
    fixture = await loadFixture(setupERC20TokenWrappedImpl);
  });

  describe('# getters', () => {
    describe('name()', () => {
      it('expect to return the name of the underlying token', async () => {
        const { token, underlyingToken } = fixture;

        const res = await token.name();

        expect(res).eq(await underlyingToken.name());
      });
    });

    describe('symbol()', () => {
      it('expect to return the symbol of the underlying token', async () => {
        const { token, underlyingToken } = fixture;

        const res = await token.symbol();

        expect(res).eq(await underlyingToken.symbol());
      });
    });

    describe('decimals()', () => {
      it('expect to return the decimals of the underlying token', async () => {
        const { token, underlyingToken } = fixture;

        const res = await token.decimals();

        expect(res).eq(await underlyingToken.decimals());
      });
    });
  });

  describe('# setters', () => {
    describe('deposit()', () => {
      it('expect to deposit the tokens', async () => {
        const { token, underlyingToken, signers } = fixture;

        const value = 100;

        const tx = token.deposit(value);

        await expect(tx).changeTokenBalance(
          token,
          signers.owner.address,
          value,
        );

        await expect(tx).changeTokenBalance(
          underlyingToken,
          signers.owner.address,
          -value,
        );
      });
    });

    describe('deposit()', () => {
      it('expect to deposit the tokens to the specific address', async () => {
        const { token, underlyingToken, signers } = fixture;

        const to = randomAddress();
        const value = 100;

        const tx = token.depositTo(to, value);

        await expect(tx).changeTokenBalance(token, to, value);

        await expect(tx).changeTokenBalance(
          underlyingToken,
          signers.owner.address,
          -value,
        );
      });
    });

    describe('withdraw()', () => {
      it('expect to withdraw the tokens', async () => {
        const { token, underlyingToken, signers } = fixture;

        const value = 100;

        const tx = token.withdraw(value);

        await expect(tx).changeTokenBalance(
          token,
          signers.owner.address,
          -value,
        );

        await expect(tx).changeTokenBalance(
          underlyingToken,
          signers.owner.address,
          value,
        );
      });
    });

    describe('withdrawTo()', () => {
      it('expect to withdraw the tokens to the specific address', async () => {
        const { token, underlyingToken, signers } = fixture;

        const to = randomAddress();
        const value = 100;

        const tx = token.withdrawTo(to, value);

        await expect(tx).changeTokenBalance(
          token,
          signers.owner.address,
          -value,
        );

        await expect(tx).changeTokenBalance(underlyingToken, to, value);
      });
    });
  });
});
