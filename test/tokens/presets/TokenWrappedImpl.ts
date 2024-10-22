import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { utils } from 'hardhat';
import { expect } from 'chai';
import { setupTokenWrappedImpl } from './fixtures';

const { randomAddress } = utils;

describe('tokens/presets/TokenWrappedImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupTokenWrappedImpl>>;

  before(async () => {
    fixture = await loadFixture(setupTokenWrappedImpl);
  });

  describe('# deployment', () => {
    describe('initialize()', () => {
      it('expect to revert when the underlying token is the zero address', async () => {
        const { tokenImpl } = fixture;

        const tx = tokenImpl.initialize(ZeroAddress, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenImpl,
          'UnderlyingTokenIsTheZeroAddress',
        );
      });

      describe('# using direct deployment', () => {
        it('expect to revert', async () => {
          const { tokenImpl } = fixture;

          const tx = tokenImpl.initialize(ZeroAddress, randomAddress());

          await expect(tx).revertedWithCustomError(
            tokenImpl,
            'AlreadyInitialized',
          );
        });
      });

      describe('# using token factory', () => {
        it('expect to initialize the contract', async () => {
          const { tokenFactory, computeToken } = fixture;

          const underlyingToken = randomAddress();

          const token = await computeToken(underlyingToken);

          await tokenFactory.createToken(underlyingToken, '0x');

          expect(await token.getOwner()).eq(ZeroAddress);
          expect(await token.getUnderlyingToken()).eq(underlyingToken);
        });

        describe('# after initialization', () => {
          it('expect to revert', async () => {
            const { token } = fixture;

            const tx = token.initialize(ZeroAddress, randomAddress());

            await expect(tx).revertedWithCustomError(
              token,
              'AlreadyInitialized',
            );
          });
        });
      });
    });
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

    describe('getUnderlyingToken()', () => {
      it('expect to return the underlying token', async () => {
        const { token, underlyingToken } = fixture;

        const res = await token.getUnderlyingToken();

        expect(res).eq(await underlyingToken.getAddress());
      });
    });
  });
});
