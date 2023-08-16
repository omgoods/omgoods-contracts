import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, testsUtils } from 'hardhat';
import { expect } from 'chai';
import {
  deployERC20ControlledTokenImpl,
  setupERC20ControlledToken,
} from './fixtures';

const { ZeroAddress } = ethers;

const { randomAddress } = testsUtils;

describe('token/erc20/controlled/ERC20ControlledTokenImpl', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployERC20ControlledTokenImpl>>;

    before(async () => {
      fixture = await loadFixture(deployERC20ControlledTokenImpl);
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
          ZeroAddress,
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

  let fixture: Awaited<ReturnType<typeof setupERC20ControlledToken>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupERC20ControlledToken);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

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

        expect(res).eq(tokenData.initialSupply);
      });
    });

    describe('balanceOf()', () => {
      it('expect to return the correct balance of the account', async () => {
        const { token, tokenData, signers } = fixture;

        const res = await token.balanceOf(signers.owner);

        expect(res).eq(tokenData.initialSupply);
      });
    });

    describe('getOwner()', () => {
      it('expect the token owner to be returned', async () => {
        const { token, signers } = fixture;

        const res = await token.getOwner();

        expect(res).eq(signers.owner.address);
      });
    });

    describe('getControllers()', () => {
      it('expect token controllers to be returned', async () => {
        const { token, signers } = fixture;

        const res = await token.getControllers();

        expect(res.minter).eq(signers.minter.address);
        expect(res.burner).eq(signers.burner.address);
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('mint()', () => {
      it('expect to revert when the sender is not the minter', async () => {
        const { token } = fixture;

        const tx = token.mint(ZeroAddress, 0);

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheTokenMinter',
        );
      });

      it('expect to mint the tokens', async () => {
        const { token, signers } = fixture;

        const to = randomAddress();
        const amount = 100;

        const tx = token.connect(signers.minter).mint(to, amount);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(ZeroAddress, to, amount);
      });
    });

    describe('burn()', () => {
      it('expect to revert when the sender is not the burner', async () => {
        const { token } = fixture;

        const tx = token.burn(ZeroAddress, 0);

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheTokenBurner',
        );
      });

      it('expect to burn the tokens', async () => {
        const { token, signers } = fixture;

        const from = signers.owner.address;
        const amount = 100;

        const tx = token.connect(signers.burner).burn(from, amount);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(from, ZeroAddress, amount);
      });
    });
  });
});
