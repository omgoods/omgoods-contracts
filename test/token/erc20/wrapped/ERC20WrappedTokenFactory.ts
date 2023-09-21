import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, testing } from 'hardhat';
import { expect } from 'chai';
import {
  deployERC20WrappedTokenFactory,
  setupERC20WrappedTokenFactory,
} from './fixtures';
import { ERC20_UNDERLYING_TOKEN } from './constants';

const { ZeroAddress } = ethers;

const { randomAddress } = testing;

describe('token/erc20/controlled/ERC20WrappedTokenFactory', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployERC20WrappedTokenFactory>>;

    before(async () => {
      fixture = await loadFixture(deployERC20WrappedTokenFactory);
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

  let fixture: Awaited<ReturnType<typeof setupERC20WrappedTokenFactory>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupERC20WrappedTokenFactory);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('computeToken()', () => {
      it('expect to compute the correct token address', async () => {
        const { tokenFactory, computeTokenAddress } = fixture;

        const underlyingToken = randomAddress();

        const res = await tokenFactory.computeToken(underlyingToken);

        expect(res).eq(computeTokenAddress(underlyingToken));
      });
    });

    describe('hashToken()', () => {
      it('expect to return the correct hash', async () => {
        const { tokenFactory, typedDataEncoder } = fixture;

        const underlyingToken = randomAddress();

        const res = await tokenFactory.hashToken(underlyingToken);

        expect(res).eq(
          typedDataEncoder.hash('Token', {
            underlyingToken,
          }),
        );
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('createToken()', () => {
      it('expect to revert when the underlying token is the zero address', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.createToken(ZeroAddress, '0x');

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'UnderlyingTokenIsTheZeroAddress',
        );
      });

      it('expect to revert when the guardian signature is invalid', async () => {
        const { tokenFactory, underlyingToken, tokenRegistry, signers } =
          fixture;

        const tx = tokenFactory.createToken(
          underlyingToken,
          await signers.unknown.at(0).signMessage('invalid'),
        );

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'InvalidGuardianSignature',
        );
      });

      it('expect to revert when the underlying token has invalid decimals (18)', async () => {
        const {
          tokenFactory,
          signers,
          typedDataEncoder,
          underlyingTokenWithInvalidDecimals,
        } = fixture;

        const tx = tokenFactory.createToken(
          underlyingTokenWithInvalidDecimals,
          await typedDataEncoder.sign(signers.owner, 'Token', {
            underlyingToken: underlyingTokenWithInvalidDecimals,
          }),
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'UnderlyingTokenWithInvalidDecimals',
        );
      });

      it('expect to create a token', async () => {
        const {
          tokenFactory,
          tokenRegistry,
          signers,
          typedDataEncoder,
          computeTokenAddress,
          underlyingToken,
        } = fixture;

        const token = computeTokenAddress(underlyingToken);

        const tx = tokenFactory.createToken(
          underlyingToken,
          await typedDataEncoder.sign(signers.owner, 'Token', {
            underlyingToken,
          }),
        );

        await expect(tx)
          .emit(tokenFactory, 'TokenCreated')
          .withArgs(
            token,
            underlyingToken,
            ERC20_UNDERLYING_TOKEN.name,
            ERC20_UNDERLYING_TOKEN.symbol,
          );

        await expect(tx)
          .emit(tokenRegistry, 'TokenCreated')
          .withArgs(token, await tokenFactory.getAddress());
      });
    });
  });
});
