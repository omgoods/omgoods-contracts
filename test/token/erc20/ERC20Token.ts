import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { PANIC_CODES } from '@nomicfoundation/hardhat-chai-matchers/panic';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployERC20TokenMock, setupERC20TokenMock } from './fixtures';
import { ERC20_TOKEN_MOCK_DATA } from './constants';

const { ZeroAddress, MaxUint256 } = ethers;

const { randomAddress } = helpers;

describe('token/ERC20Token // mocked', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployERC20TokenMock>>;

    before(async () => {
      fixture = await loadFixture(deployERC20TokenMock);
    });

    describe('_initialize()', () => {
      it('expect to initialize the contract', async () => {
        const { erc20TokenMock } = fixture;

        const gateway = randomAddress();
        const tokenRegistry = randomAddress();
        const name = 'Test';
        const symbol = 'TEST';

        const tx = erc20TokenMock.initialize(
          gateway,
          tokenRegistry,
          name,
          symbol,
        );

        await expect(tx)
          .emit(erc20TokenMock, 'Initialized')
          .withArgs(gateway, tokenRegistry, name, symbol);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { erc20TokenMock } = fixture;

          if (!(await erc20TokenMock.initialized())) {
            await erc20TokenMock.initialize(
              randomAddress(),
              randomAddress(),
              '',
              '',
            );
          }
        });

        it('expect to revert', async () => {
          const { erc20TokenMock } = fixture;

          const tx = erc20TokenMock.initialize(
            ZeroAddress,
            ZeroAddress,
            '',
            '',
          );

          await expect(tx).revertedWithCustomError(
            erc20TokenMock,
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
        const { erc20TokenMock } = fixture;

        const res = await erc20TokenMock.name();

        expect(res).eq(ERC20_TOKEN_MOCK_DATA.name);
      });
    });

    describe('symbol()', () => {
      it('expect to return the symbol', async () => {
        const { erc20TokenMock } = fixture;

        const res = await erc20TokenMock.symbol();

        expect(res).eq(ERC20_TOKEN_MOCK_DATA.symbol);
      });
    });

    describe('decimals()', () => {
      it('expect to return the decimal precision', async () => {
        const { erc20TokenMock } = fixture;

        const res = await erc20TokenMock.decimals();

        expect(res).eq(ERC20_TOKEN_MOCK_DATA.decimals);
      });
    });

    describe('totalSupply()', () => {
      it('expect to return the total supply', async () => {
        const { erc20TokenMock } = fixture;

        const res = await erc20TokenMock.totalSupply();

        expect(res).eq(ERC20_TOKEN_MOCK_DATA.initialSupply);
      });
    });

    describe('balanceOf()', () => {
      it('expect to return the correct balance of the account', async () => {
        const { erc20TokenMock, signers } = fixture;

        const res = await erc20TokenMock.balanceOf(signers.owner);

        expect(res).eq(ERC20_TOKEN_MOCK_DATA.initialSupply);
      });
    });

    describe('allowance()', () => {
      it('expect to return the correct allowance of the account', async () => {
        const { erc20TokenMock, signers } = fixture;

        const res = await erc20TokenMock.allowance(
          signers.owner,
          signers.account,
        );

        expect(res).eq(ERC20_TOKEN_MOCK_DATA.initialSupply);
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('transfer()', () => {
      it('expect to revert when transferring to the zero address', async () => {
        const { erc20TokenMock } = fixture;

        const tx = erc20TokenMock.transfer(ZeroAddress, 0);

        await expect(tx).revertedWithCustomError(
          erc20TokenMock,
          'TransferToTheZeroAddress',
        );
      });

      it('expect to revert when the amount is zero', async () => {
        const { erc20TokenMock } = fixture;

        const tx = erc20TokenMock.transfer(randomAddress(), 0);

        await expect(tx).revertedWithCustomError(
          erc20TokenMock,
          'TransferAmountIsZero',
        );
      });

      it('expect to revert when the transfer amount exceeds the account balance', async () => {
        const { erc20TokenMock, signers } = fixture;

        const tx = erc20TokenMock
          .connect(signers.unknown.at(0))
          .transfer(randomAddress(), 10);

        await expect(tx).revertedWithCustomError(
          erc20TokenMock,
          'TransferAmountExceedsBalance',
        );
      });

      it('expect to transfer the tokens', async () => {
        const { erc20TokenMock, erc20TokenRegistry, signers } = fixture;

        const from = signers.owner.address;
        const to = randomAddress();
        const amount = 100;

        const tx = erc20TokenMock.transfer(to, amount);

        await expect(tx)
          .emit(erc20TokenMock, 'Transfer')
          .withArgs(from, to, amount);

        await expect(tx)
          .emit(erc20TokenRegistry, 'TokenTransfer')
          .withArgs(await erc20TokenMock.getAddress(), from, to, amount);

        await expect(tx).changeTokenBalances(
          erc20TokenMock,
          [from, to],
          [-amount, amount],
        );
      });
    });

    describe('transferFrom()', () => {
      it('expect to revert when transferring from the zero address', async () => {
        const { erc20TokenMock } = fixture;

        const tx = erc20TokenMock.transferFrom(ZeroAddress, ZeroAddress, 0);

        await expect(tx).revertedWithCustomError(
          erc20TokenMock,
          'TransferFromTheZeroAddress',
        );
      });

      it('expect to revert when the allowance is insufficient', async () => {
        const { erc20TokenMock, signers } = fixture;

        const tx = erc20TokenMock
          .connect(signers.unknown.at(0))
          .transferFrom(randomAddress(), randomAddress(), 10);

        await expect(tx).revertedWithCustomError(
          erc20TokenMock,
          'InsufficientAllowance',
        );
      });

      it('expect to transfer the tokens from the account', async () => {
        const { erc20TokenMock, erc20TokenRegistry, signers } = fixture;

        const from = signers.owner.address;
        const to = randomAddress();
        const amount = BigInt(100);

        const tx = erc20TokenMock
          .connect(signers.account)
          .transferFrom(from, to, amount);

        const allowance = await erc20TokenMock.allowance(
          from,
          signers.account.address,
        );

        await expect(tx)
          .emit(erc20TokenMock, 'Approval')
          .withArgs(from, signers.account.address, allowance - amount);

        await expect(tx)
          .emit(erc20TokenMock, 'Transfer')
          .withArgs(from, to, amount);

        await expect(tx)
          .emit(erc20TokenRegistry, 'TokenTransfer')
          .withArgs(await erc20TokenMock.getAddress(), from, to, amount);

        await expect(tx).changeTokenBalances(
          erc20TokenMock,
          [from, to],
          [-amount, amount],
        );
      });

      it('expect to transfer the tokens from the account by the operator', async () => {
        const { erc20TokenMock, erc20TokenRegistry, signers } = fixture;

        const from = signers.owner.address;
        const to = randomAddress();
        const amount = 200;

        const tx = erc20TokenMock
          .connect(signers.operator)
          .transferFrom(from, to, amount);

        await expect(tx).not.emit(erc20TokenMock, 'Approval');

        await expect(tx)
          .emit(erc20TokenMock, 'Transfer')
          .withArgs(from, to, amount);

        await expect(tx)
          .emit(erc20TokenRegistry, 'TokenTransfer')
          .withArgs(await erc20TokenMock.getAddress(), from, to, amount);

        await expect(tx).changeTokenBalances(
          erc20TokenMock,
          [from, to],
          [-amount, amount],
        );
      });
    });

    describe('approve()', () => {
      it('expect to revert when approving the zero address', async () => {
        const { erc20TokenMock } = fixture;

        const tx = erc20TokenMock.approve(ZeroAddress, 0);

        await expect(tx).revertedWithCustomError(
          erc20TokenMock,
          'ApproveToTheZeroAddress',
        );
      });

      it('expect to approve the account', async () => {
        const { erc20TokenMock, erc20TokenRegistry, signers } = fixture;

        const owner = signers.unknown.at(0);
        const spender = randomAddress();
        const amount = 200;

        const tx = erc20TokenMock.connect(owner).approve(spender, amount);

        await expect(tx)
          .emit(erc20TokenMock, 'Approval')
          .withArgs(owner.address, spender, amount);

        await expect(tx)
          .emit(erc20TokenRegistry, 'TokenApproval')
          .withArgs(
            await erc20TokenMock.getAddress(),
            owner.address,
            spender,
            amount,
          );
      });
    });

    describe('_mint()', () => {
      it('expect to revert when minting to the zero address', async () => {
        const { erc20TokenMock } = fixture;

        const tx = erc20TokenMock.mint(ZeroAddress, 0);

        await expect(tx).revertedWithCustomError(
          erc20TokenMock,
          'MintToTheZeroAddress',
        );
      });

      it('expect to revert when the amount is zero', async () => {
        const { erc20TokenMock } = fixture;

        const tx = erc20TokenMock.mint(randomAddress(), 0);

        await expect(tx).revertedWithCustomError(
          erc20TokenMock,
          'MintAmountIsZero',
        );
      });

      it('expect to revert when minting the overflowed amount', async () => {
        const { erc20TokenMock } = fixture;

        const tx = erc20TokenMock.mint(randomAddress(), MaxUint256);

        await expect(tx).revertedWithPanic(
          PANIC_CODES.ARITHMETIC_UNDER_OR_OVERFLOW,
        );
      });

      it('expect to mint the tokens', async () => {
        const { erc20TokenMock, erc20TokenRegistry } = fixture;

        const to = randomAddress();
        const amount = BigInt(100);
        const totalSupply = await erc20TokenMock.totalSupply();

        const tx = erc20TokenMock.mint(to, amount);

        await expect(tx)
          .emit(erc20TokenMock, 'Transfer')
          .withArgs(ZeroAddress, to, amount);

        await expect(tx)
          .emit(erc20TokenRegistry, 'TokenTransfer')
          .withArgs(await erc20TokenMock.getAddress(), ZeroAddress, to, amount);

        await expect(tx).changeTokenBalance(erc20TokenMock, to, amount);

        expect(await erc20TokenMock.totalSupply()).eq(totalSupply + amount);
      });
    });

    describe('_burn()', () => {
      it('expect to revert when burning from the zero address', async () => {
        const { erc20TokenMock } = fixture;

        const tx = erc20TokenMock.burn(ZeroAddress, 0);

        await expect(tx).revertedWithCustomError(
          erc20TokenMock,
          'BurnFromTheZeroAddress',
        );
      });

      it('expect to revert when the amount is zero', async () => {
        const { erc20TokenMock } = fixture;

        const tx = erc20TokenMock.burn(randomAddress(), 0);

        await expect(tx).revertedWithCustomError(
          erc20TokenMock,
          'BurnAmountIsZero',
        );
      });

      it('expect to revert when the burning amount exceeds the account balance', async () => {
        const { erc20TokenMock } = fixture;

        const tx = erc20TokenMock.burn(randomAddress(), 10);

        await expect(tx).revertedWithCustomError(
          erc20TokenMock,
          'BurnAmountExceedsBalance',
        );
      });

      it('expect to burn the tokens', async () => {
        const { erc20TokenMock, erc20TokenRegistry, signers } = fixture;

        const from = signers.owner.address;
        const amount = BigInt(200);
        const totalSupply = await erc20TokenMock.totalSupply();

        const tx = erc20TokenMock.burn(from, amount);

        await expect(tx)
          .emit(erc20TokenMock, 'Transfer')
          .withArgs(from, ZeroAddress, amount);

        await expect(tx)
          .emit(erc20TokenRegistry, 'TokenTransfer')
          .withArgs(
            await erc20TokenMock.getAddress(),
            from,
            ZeroAddress,
            amount,
          );

        await expect(tx).changeTokenBalance(erc20TokenMock, from, -amount);

        expect(await erc20TokenMock.totalSupply()).eq(totalSupply - amount);
      });
    });
  });
});
