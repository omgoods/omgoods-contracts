import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../common';
import { TOKEN } from './constants';
import { setupTokenFactoryMock } from './fixtures';

describe('token/TokenImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupTokenFactoryMock>>;

  before(async () => {
    fixture = await loadFixture(setupTokenFactoryMock);
  });

  describe('# deployment', () => {
    describe('initialize()', () => {
      it('expect to revert', async () => {
        const { tokenImpl } = fixture;

        const tx = tokenImpl.initialize(ZeroAddress, '', '', ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenImpl,
          'AlreadyInitialized',
        );
      });
    });
  });

  describe('# getters', () => {
    describe('name()', () => {
      it('expect to return the name', async () => {
        const { token } = fixture;

        const res = await token.name();

        expect(res).eq(TOKEN.name);
      });
    });

    describe('name()', () => {
      it('expect to return the symbol', async () => {
        const { token } = fixture;

        const res = await token.symbol();

        expect(res).eq(TOKEN.symbol);
      });
    });

    describe('# setters', () => {
      describe('_setOwner()', () => {
        it('expect to emit the event', async () => {
          const { token, tokenFactory } = fixture;

          const owner = randomAddress();

          const tx = token.setOwner(owner);

          await expect(tx)
            .emit(tokenFactory, 'TokenOwnerUpdated')
            .withArgs(await token.getAddress(), owner);
        });
      });
    });
  });
});
