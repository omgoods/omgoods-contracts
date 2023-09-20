import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, testing } from 'hardhat';
import { expect } from 'chai';
import {
  deployERC20FixedTokenFactory,
  setupERC20FixedTokenFactory,
} from './fixtures';
import { ERC20_FIXED_TOKEN } from './constants';

const { ZeroAddress } = ethers;

const { randomAddress } = testing;

describe('token/erc20/controlled/ERC20FixedTokenFactory', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployERC20FixedTokenFactory>>;

    before(async () => {
      fixture = await loadFixture(deployERC20FixedTokenFactory);
    });

    describe('initialize()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { tokenFactory, signers } = fixture;

        const tx = tokenFactory
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress, ZeroAddress, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to initialize the contract', async () => {
        const { tokenFactory } = fixture;

        const gateway = randomAddress();
        const tokenRegistry = randomAddress();
        const tokenImpl = randomAddress();

        const tx = tokenFactory.initialize(gateway, tokenRegistry, tokenImpl);

        await expect(tx)
          .emit(tokenFactory, 'Initialized')
          .withArgs(gateway, tokenRegistry, tokenImpl);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { tokenFactory } = fixture;

          if (!(await tokenFactory.initialized())) {
            await tokenFactory.initialize(
              randomAddress(),
              randomAddress(),
              randomAddress(),
            );
          }
        });

        it('expect to revert', async () => {
          const { tokenFactory } = fixture;

          const tx = tokenFactory.initialize(
            ZeroAddress,
            ZeroAddress,
            ZeroAddress,
          );

          await expect(tx).revertedWithCustomError(
            tokenFactory,
            'AlreadyInitialized',
          );
        });
      });
    });
  });

  let fixture: Awaited<ReturnType<typeof setupERC20FixedTokenFactory>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupERC20FixedTokenFactory);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('computeToken()', () => {
      it('expect to compute the correct token address', async () => {
        const { tokenFactory, computeTokenAddress } = fixture;

        const symbol = 'TEST';

        const res = await tokenFactory.computeToken(symbol);

        expect(res).eq(computeTokenAddress(symbol));
      });
    });

    describe('hashToken()', () => {
      it('expect to return the correct hash', async () => {
        const { tokenFactory, tokenTypeEncoder } = fixture;

        const res = await tokenFactory.hashToken(ERC20_FIXED_TOKEN);

        expect(res).eq(tokenTypeEncoder.hash(ERC20_FIXED_TOKEN));
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('createToken()', () => {
      it('expect to revert when the token owner is the zero address', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.createToken(
          {
            ...ERC20_FIXED_TOKEN,
            owner: ZeroAddress,
          },
          '0x',
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'TokenOwnerIsTheZeroAddress',
        );
      });

      it('expect to revert when the total supply is zero', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.createToken(
          {
            ...ERC20_FIXED_TOKEN,
            totalSupply: 0,
          },
          '0x',
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'InsufficientTotalSupply',
        );
      });

      it('expect to revert when the guardian signature is invalid', async () => {
        const { tokenFactory, tokenRegistry, signers } = fixture;

        const tx = tokenFactory.createToken(
          ERC20_FIXED_TOKEN,
          await signers.unknown.at(0).signMessage('invalid'),
        );

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'InvalidGuardianSignature',
        );
      });

      it('expect to create a token', async () => {
        const {
          tokenFactory,
          tokenRegistry,
          signers,
          tokenTypeEncoder,
          computeTokenAddress,
        } = fixture;

        const token = computeTokenAddress(ERC20_FIXED_TOKEN.symbol);

        const tx = tokenFactory.createToken(
          ERC20_FIXED_TOKEN,
          await tokenTypeEncoder.sign(signers.owner, ERC20_FIXED_TOKEN),
        );

        await expect(tx)
          .emit(tokenFactory, 'TokenCreated')
          .withArgs(
            token,
            ERC20_FIXED_TOKEN.name,
            ERC20_FIXED_TOKEN.symbol,
            ERC20_FIXED_TOKEN.owner,
            ERC20_FIXED_TOKEN.totalSupply,
          );

        await expect(tx)
          .emit(tokenRegistry, 'TokenCreated')
          .withArgs(token, await tokenFactory.getAddress());
      });
    });
  });
});
