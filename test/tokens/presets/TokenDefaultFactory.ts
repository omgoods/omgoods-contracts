import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyUint } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { utils } from 'hardhat';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { setupTokenDefaultImpl } from './fixtures';

const { randomAddress } = utils;

describe('tokens/presets/TokenDefaultFactory', () => {
  let fixture: Awaited<ReturnType<typeof setupTokenDefaultImpl>>;

  before(async () => {
    fixture = await loadFixture(setupTokenDefaultImpl);
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
            anyUint,
          );
      });
    });
  });
});
