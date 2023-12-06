import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { isBlockTimestamp, randomAddress } from '../../common';
import { setupWrappedTokenImpl } from './fixtures';

describe('tokens/presets/WrappedTokenFactory', () => {
  let fixture: Awaited<ReturnType<typeof setupWrappedTokenImpl>>;

  before(async () => {
    fixture = await loadFixture(setupWrappedTokenImpl);
  });

  describe('# getters', () => {
    describe('computeToken()', () => {
      it('expect to compute the token address', async () => {
        const { tokenFactory, computeTokenAddress } = fixture;

        const underlyingToken = randomAddress();

        const res = await tokenFactory.computeToken(underlyingToken);

        expect(res).eq(await computeTokenAddress(underlyingToken));
      });
    });
  });

  describe('# setters', () => {
    describe('createToken()', () => {
      it('expect to create a new token', async () => {
        const { tokenImpl, tokenFactory, tokenRegistry, computeTokenAddress } =
          fixture;

        const underlyingToken = randomAddress();

        const initCode = tokenImpl.interface.encodeFunctionData('initialize', [
          ZeroAddress,
          underlyingToken,
        ]);

        const tx = tokenFactory.createToken(underlyingToken, '0x');

        await expect(tx)
          .emit(tokenRegistry, 'TokenCreated')
          .withArgs(
            await computeTokenAddress(underlyingToken),
            await tokenImpl.getAddress(),
            initCode,
            isBlockTimestamp,
          );
      });
    });
  });
});
