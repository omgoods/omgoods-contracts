import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, testsUtils } from 'hardhat';
import { expect } from 'chai';
import {
  deployERC20WrappedTokenImpl,
  setupERC20WrappedToken,
} from './fixtures';
import { ERC20_WRAPPED_TOKEN_DATA } from './constants';

const { ZeroAddress } = ethers;

const { randomAddress } = testsUtils;

describe('token/erc20/controlled/ERC20WrappedTokenImpl', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployERC20WrappedTokenImpl>>;

    before(async () => {
      fixture = await loadFixture(deployERC20WrappedTokenImpl);
    });

    describe('initialize()', () => {
      it('expect to revert', async () => {
        const { tokenImpl } = fixture;

        const tx = tokenImpl.initialize(ZeroAddress, ZeroAddress, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenImpl,
          'AlreadyInitialized',
        );
      });
    });
  });

  let fixture: Awaited<ReturnType<typeof setupERC20WrappedToken>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupERC20WrappedToken);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('name()', () => {
      it('expect to return the name', async () => {
        const { token, underlyingToken } = fixture;

        const res = await token.name();

        expect(res).eq(await underlyingToken.name());
      });
    });

    describe('symbol()', () => {
      it('expect to return the symbol', async () => {
        const { token, underlyingToken } = fixture;

        const res = await token.symbol();

        expect(res).eq(await underlyingToken.symbol());
      });
    });

    describe('decimals()', () => {
      it('expect to return the decimals precision', async () => {
        const { token, underlyingToken } = fixture;

        const res = await token.decimals();

        expect(res).eq(await underlyingToken.decimals());
      });
    });

    describe('getUnderlyingToken()', () => {
      it('expect to return the underlying token', async () => {
        const { token, underlyingToken } = fixture;

        const res = await token.getUnderlyingToken();

        expect(res).eq(await underlyingToken.getAddress());
      });
    });

    describe('totalSupply()', () => {
      it('expect to return the total supply', async () => {
        const { token } = fixture;

        const res = await token.totalSupply();

        expect(res).eq(ERC20_WRAPPED_TOKEN_DATA.initialSupply);
      });
    });

    describe('balanceOf()', () => {
      it('expect to return the correct balance of the account', async () => {
        const { token, signers } = fixture;

        const res = await token.balanceOf(signers.owner);

        expect(res).eq(ERC20_WRAPPED_TOKEN_DATA.initialSupply);
      });
    });

    describe('getOwner()', () => {
      it('expect to return the zero address', async () => {
        const { token } = fixture;

        const res = await token.getOwner();

        expect(res).eq(ZeroAddress);
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('deposit()', () => {
      it('expect to deposit to the sender account', async () => {
        const { token, underlyingToken, signers } = fixture;

        const amount = 10;

        const tx = token.deposit(amount);

        expect(tx).changeTokenBalance(
          underlyingToken,
          signers.owner.address,
          -amount,
        );

        expect(tx).changeTokenBalance(token, signers.owner.address, amount);
      });
    });

    describe('depositTo()', () => {
      it('expect to deposit to the account', async () => {
        const { token, underlyingToken, signers } = fixture;

        const to = randomAddress();
        const amount = 10;

        const tx = token.depositTo(to, amount);

        expect(tx).changeTokenBalance(
          underlyingToken,
          signers.owner.address,
          -amount,
        );

        expect(tx).changeTokenBalance(token, to, amount);
      });
    });

    describe('withdraw()', () => {
      it('expect to withdraw to the sender account', async () => {
        const { token, underlyingToken, signers } = fixture;

        const amount = 10;

        const tx = token.withdraw(amount);

        expect(tx).changeTokenBalance(token, signers.owner.address, -amount);

        expect(tx).changeTokenBalance(
          underlyingToken,
          signers.owner.address,
          amount,
        );
      });
    });

    describe('withdrawTo()', () => {
      it('expect to withdraw to the account', async () => {
        const { token, underlyingToken, signers } = fixture;

        const to = randomAddress();
        const amount = 10;

        const tx = token.withdrawTo(to, amount);

        expect(tx).changeTokenBalance(token, signers.owner.address, amount);

        expect(tx).changeTokenBalance(underlyingToken, to, amount);
      });
    });
  });
});
