import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../../common';
import { setupDefaultTokenImpl } from './fixtures';

describe('tokens/presets/DefaultTokenFactory', () => {
  let fixture: Awaited<ReturnType<typeof setupDefaultTokenImpl>>;

  before(async () => {
    fixture = await loadFixture(setupDefaultTokenImpl);
  });

  describe('# getters', () => {
    describe('computeToken()', () => {
      it('expect to compute the token address', async () => {
        const { tokenFactory, computeTokenAddress } = fixture;

        const symbol = 'TEST';

        const res = await tokenFactory.computeToken(symbol);

        expect(res).eq(await computeTokenAddress(symbol));
      });
    });
  });

  describe('# setters', () => {
    describe('createToken()', () => {
      it('expect to create a new token', async () => {
        const { tokenImpl, tokenFactory, tokenRegistry, computeTokenAddress } =
          fixture;

        const owner = randomAddress();
        const name = 'Test';
        const symbol = 'TEST';
        const controller = randomAddress();
        const locked = true;

        const initCode = tokenImpl.interface.encodeFunctionData('initialize', [
          ZeroAddress,
          owner,
          name,
          symbol,
          controller,
          locked,
        ]);

        const tx = tokenFactory.createToken(
          owner,
          name,
          symbol,
          controller,
          locked,
          '0x',
        );

        await expect(tx)
          .emit(tokenRegistry, 'TokenCreated')
          .withArgs(
            await computeTokenAddress(symbol),
            await tokenImpl.getAddress(),
            initCode,
          );
      });
    });
  });
});
