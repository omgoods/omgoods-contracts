import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { deployERC20FixedTokenImpl, setupERC20FixedToken } from './fixtures';

const { ZeroAddress } = ethers;

describe('token/erc20/controlled/ERC20FixedTokenImpl', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployERC20FixedTokenImpl>>;

    before(async () => {
      fixture = await loadFixture(deployERC20FixedTokenImpl);
    });

    describe('initialize()', () => {
      it('expect to revert', async () => {
        const { tokenImpl } = fixture;

        const tx = tokenImpl.initialize(
          ZeroAddress,
          ZeroAddress,
          '',
          '',
          ZeroAddress,
          0,
        );

        await expect(tx).revertedWithCustomError(
          tokenImpl,
          'AlreadyInitialized',
        );
      });
    });
  });

  describe('# getters', () => {
    let fixture: Awaited<ReturnType<typeof setupERC20FixedToken>>;

    before(async () => {
      fixture = await loadFixture(setupERC20FixedToken);
    });

    describe('name()', () => {
      it('expect to return the name', async () => {
        const { token, tokenData } = fixture;

        const res = await token.name();

        expect(res).eq(tokenData.name);
      });
    });

    describe('symbol()', () => {
      it('expect to return the symbol', async () => {
        const { token, tokenData } = fixture;

        const res = await token.symbol();

        expect(res).eq(tokenData.symbol);
      });
    });

    describe('totalSupply()', () => {
      it('expect to return the total supply', async () => {
        const { token, tokenData } = fixture;

        const res = await token.totalSupply();

        expect(res).eq(tokenData.totalSupply);
      });
    });

    describe('balanceOf()', () => {
      it('expect to return the correct balance of the account', async () => {
        const { token, tokenData, signers } = fixture;

        const res = await token.balanceOf(signers.owner);

        expect(res).eq(tokenData.totalSupply);
      });
    });

    describe('getOwner()', () => {
      it('expect the token owner to be returned', async () => {
        const { token, signers } = fixture;

        const res = await token.getOwner();

        expect(res).eq(signers.owner.address);
      });
    });
  });
});
