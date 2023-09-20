import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { PANIC_CODES } from '@nomicfoundation/hardhat-chai-matchers/panic';
import { ethers, testing } from 'hardhat';
import { expect } from 'chai';
import { deployERC20TokenMock, setupERC20TokenMock } from './fixtures';
import { ERC20_TOKEN_MOCK } from './constants';

const { ZeroAddress, MaxUint256 } = ethers;

const { randomAddress } = testing;

describe('token/ERC20Token // mocked', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployERC20TokenMock>>;

    before(async () => {
      fixture = await loadFixture(deployERC20TokenMock);
    });

    describe('_initialize()', () => {
      it('expect to initialize the contract', async () => {
        const { tokenMock } = fixture;

        const gateway = randomAddress();
        const tokenRegistry = randomAddress();
        const name = 'Test';
        const symbol = 'TEST';

        const tx = tokenMock.initialize(gateway, tokenRegistry, name, symbol);

        await expect(tx)
          .emit(tokenMock, 'Initialized')
          .withArgs(gateway, tokenRegistry, name, symbol);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { tokenMock } = fixture;

          if (!(await tokenMock.initialized())) {
            await tokenMock.initialize(
              randomAddress(),
              randomAddress(),
              '',
              '',
            );
          }
        });

        it('expect to revert', async () => {
          const { tokenMock } = fixture;

          const tx = tokenMock.initialize(ZeroAddress, ZeroAddress, '', '');

          await expect(tx).revertedWithCustomError(
            tokenMock,
            'AlreadyInitialized',
          );
        });
      });
    });
  });

  let fixture: Awaited<ReturnType<typeof setupERC20TokenMock>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupERC20TokenMock);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('name()', () => {
      it('expect to return the name', async () => {
        const { tokenMock } = fixture;

        const res = await tokenMock.name();

        expect(res).eq(ERC20_TOKEN_MOCK.name);
      });
    });

    describe('symbol()', () => {
      it('expect to return the symbol', async () => {
        const { tokenMock } = fixture;

        const res = await tokenMock.symbol();

        expect(res).eq(ERC20_TOKEN_MOCK.symbol);
      });
    });

    describe('decimals()', () => {
      it('expect to return the decimal precision', async () => {
        const { tokenMock } = fixture;

        const res = await tokenMock.decimals();

        expect(res).eq(ERC20_TOKEN_MOCK.decimals);
      });
    });

    describe('totalSupply()', () => {
      it('expect to return the total supply', async () => {
        const { tokenMock } = fixture;

        const res = await tokenMock.totalSupply();

        expect(res).eq(ERC20_TOKEN_MOCK.initialSupply);
      });
    });

    describe('balanceOf()', () => {
      it('expect to return the correct balance of the account', async () => {
        const { tokenMock, signers } = fixture;

        const res = await tokenMock.balanceOf(signers.owner);

        expect(res).eq(ERC20_TOKEN_MOCK.initialSupply);
      });
    });

    describe('allowance()', () => {
      it('expect to return the correct allowance of the account', async () => {
        const { tokenMock, signers } = fixture;

        const res = await tokenMock.allowance(signers.owner, signers.account);

        expect(res).eq(ERC20_TOKEN_MOCK.initialSupply);
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('transfer()', () => {
      it('expect to revert when transferring to the zero address', async () => {
        const { tokenMock } = fixture;

        const tx = tokenMock.transfer(ZeroAddress, 0);

        await expect(tx).revertedWithCustomError(
          tokenMock,
          'TransferToTheZeroAddress',
        );
      });

      it('expect to revert when the amount is zero', async () => {
        const { tokenMock } = fixture;

        const tx = tokenMock.transfer(randomAddress(), 0);

        await expect(tx).revertedWithCustomError(
          tokenMock,
          'TransferAmountIsZero',
        );
      });

      it('expect to revert when the transfer amount exceeds the account balance', async () => {
        const { tokenMock, signers } = fixture;

        const tx = tokenMock
          .connect(signers.unknown.at(0))
          .transfer(randomAddress(), 10);

        await expect(tx).revertedWithCustomError(
          tokenMock,
          'TransferAmountExceedsBalance',
        );
      });

      it('expect to transfer the tokens', async () => {
        const { tokenMock, tokenRegistry, signers } = fixture;

        const from = signers.owner.address;
        const to = randomAddress();
        const amount = 100;

        const tx = tokenMock.transfer(to, amount);

        await expect(tx).emit(tokenMock, 'Transfer').withArgs(from, to, amount);

        await expect(tx)
          .emit(tokenRegistry, 'TokenTransfer')
          .withArgs(await tokenMock.getAddress(), from, to, amount);

        await expect(tx).changeTokenBalances(
          tokenMock,
          [from, to],
          [-amount, amount],
        );
      });
    });

    describe('transferFrom()', () => {
      it('expect to revert when transferring from the zero address', async () => {
        const { tokenMock } = fixture;

        const tx = tokenMock.transferFrom(ZeroAddress, ZeroAddress, 0);

        await expect(tx).revertedWithCustomError(
          tokenMock,
          'TransferFromTheZeroAddress',
        );
      });

      it('expect to revert when the allowance is insufficient', async () => {
        const { tokenMock, signers } = fixture;

        const tx = tokenMock
          .connect(signers.unknown.at(0))
          .transferFrom(randomAddress(), randomAddress(), 10);

        await expect(tx).revertedWithCustomError(
          tokenMock,
          'InsufficientAllowance',
        );
      });

      it('expect to transfer the tokens from the account', async () => {
        const { tokenMock, tokenRegistry, signers } = fixture;

        const from = signers.owner.address;
        const to = randomAddress();
        const amount = BigInt(100);

        const tx = tokenMock
          .connect(signers.account)
          .transferFrom(from, to, amount);

        const allowance = await tokenMock.allowance(
          from,
          signers.account.address,
        );

        await expect(tx)
          .emit(tokenMock, 'Approval')
          .withArgs(from, signers.account.address, allowance - amount);

        await expect(tx).emit(tokenMock, 'Transfer').withArgs(from, to, amount);

        await expect(tx)
          .emit(tokenRegistry, 'TokenTransfer')
          .withArgs(await tokenMock.getAddress(), from, to, amount);

        await expect(tx).changeTokenBalances(
          tokenMock,
          [from, to],
          [-amount, amount],
        );
      });

      it('expect to transfer the tokens from the account by the operator', async () => {
        const { tokenMock, tokenRegistry, signers } = fixture;

        const from = signers.owner.address;
        const to = randomAddress();
        const amount = 200;

        const tx = tokenMock
          .connect(signers.operator)
          .transferFrom(from, to, amount);

        await expect(tx).not.emit(tokenMock, 'Approval');

        await expect(tx).emit(tokenMock, 'Transfer').withArgs(from, to, amount);

        await expect(tx)
          .emit(tokenRegistry, 'TokenTransfer')
          .withArgs(await tokenMock.getAddress(), from, to, amount);

        await expect(tx).changeTokenBalances(
          tokenMock,
          [from, to],
          [-amount, amount],
        );
      });
    });

    describe('approve()', () => {
      it('expect to revert when approving the zero address', async () => {
        const { tokenMock } = fixture;

        const tx = tokenMock.approve(ZeroAddress, 0);

        await expect(tx).revertedWithCustomError(
          tokenMock,
          'ApproveToTheZeroAddress',
        );
      });

      it('expect to approve the account', async () => {
        const { tokenMock, tokenRegistry, signers } = fixture;

        const owner = signers.unknown.at(0);
        const spender = randomAddress();
        const amount = 200;

        const tx = tokenMock.connect(owner).approve(spender, amount);

        await expect(tx)
          .emit(tokenMock, 'Approval')
          .withArgs(owner.address, spender, amount);

        await expect(tx)
          .emit(tokenRegistry, 'TokenApproval')
          .withArgs(
            await tokenMock.getAddress(),
            owner.address,
            spender,
            amount,
          );
      });
    });

    describe('_mint()', () => {
      it('expect to revert when minting to the zero address', async () => {
        const { tokenMock } = fixture;

        const tx = tokenMock.mint(ZeroAddress, 0);

        await expect(tx).revertedWithCustomError(
          tokenMock,
          'MintToTheZeroAddress',
        );
      });

      it('expect to revert when the amount is zero', async () => {
        const { tokenMock } = fixture;

        const tx = tokenMock.mint(randomAddress(), 0);

        await expect(tx).revertedWithCustomError(tokenMock, 'MintAmountIsZero');
      });

      it('expect to revert when minting the overflowed amount', async () => {
        const { tokenMock } = fixture;

        const tx = tokenMock.mint(randomAddress(), MaxUint256);

        await expect(tx).revertedWithPanic(
          PANIC_CODES.ARITHMETIC_UNDER_OR_OVERFLOW,
        );
      });

      it('expect to mint the tokens', async () => {
        const { tokenMock, tokenRegistry } = fixture;

        const to = randomAddress();
        const amount = BigInt(100);
        const totalSupply = await tokenMock.totalSupply();

        const tx = tokenMock.mint(to, amount);

        await expect(tx)
          .emit(tokenMock, 'Transfer')
          .withArgs(ZeroAddress, to, amount);

        await expect(tx)
          .emit(tokenRegistry, 'TokenTransfer')
          .withArgs(await tokenMock.getAddress(), ZeroAddress, to, amount);

        await expect(tx).changeTokenBalance(tokenMock, to, amount);

        expect(await tokenMock.totalSupply()).eq(totalSupply + amount);
      });
    });

    describe('_burn()', () => {
      it('expect to revert when burning from the zero address', async () => {
        const { tokenMock } = fixture;

        const tx = tokenMock.burn(ZeroAddress, 0);

        await expect(tx).revertedWithCustomError(
          tokenMock,
          'BurnFromTheZeroAddress',
        );
      });

      it('expect to revert when the amount is zero', async () => {
        const { tokenMock } = fixture;

        const tx = tokenMock.burn(randomAddress(), 0);

        await expect(tx).revertedWithCustomError(tokenMock, 'BurnAmountIsZero');
      });

      it('expect to revert when the burning amount exceeds the account balance', async () => {
        const { tokenMock } = fixture;

        const tx = tokenMock.burn(randomAddress(), 10);

        await expect(tx).revertedWithCustomError(
          tokenMock,
          'BurnAmountExceedsBalance',
        );
      });

      it('expect to burn the tokens', async () => {
        const { tokenMock, tokenRegistry, signers } = fixture;

        const from = signers.owner.address;
        const amount = BigInt(200);
        const totalSupply = await tokenMock.totalSupply();

        const tx = tokenMock.burn(from, amount);

        await expect(tx)
          .emit(tokenMock, 'Transfer')
          .withArgs(from, ZeroAddress, amount);

        await expect(tx)
          .emit(tokenRegistry, 'TokenTransfer')
          .withArgs(await tokenMock.getAddress(), from, ZeroAddress, amount);

        await expect(tx).changeTokenBalance(tokenMock, from, -amount);

        expect(await tokenMock.totalSupply()).eq(totalSupply - amount);
      });
    });
  });
});
