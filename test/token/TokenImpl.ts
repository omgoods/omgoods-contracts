import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../common';
import { TOKEN_MOCK } from './constants';
import { setupTokenFactoryMock } from './fixtures';

describe('token/TokenImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupTokenFactoryMock>>;

  before(async () => {
    fixture = await loadFixture(setupTokenFactoryMock);
  });

  describe('# deployment', () => {
    describe('initialize()', () => {
      it('expect to revert', async () => {
        const { tokenImplMock } = fixture;

        const tx = tokenImplMock.initialize(ZeroAddress, '', '', ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenImplMock,
          'AlreadyInitialized',
        );
      });
    });
  });

  describe('# getters', () => {
    describe('name()', () => {
      it('expect to return the name', async () => {
        const { tokenMock } = fixture;

        const res = await tokenMock.name();

        expect(res).eq(TOKEN_MOCK.name);
      });
    });

    describe('name()', () => {
      it('expect to return the symbol', async () => {
        const { tokenMock } = fixture;

        const res = await tokenMock.symbol();

        expect(res).eq(TOKEN_MOCK.symbol);
      });
    });

    describe('# setters', () => {
      describe('_setOwner()', () => {
        it('expect to emit the event', async () => {
          const { tokenMock, tokenFactoryMock } = fixture;

          const owner = randomAddress();

          const tx = tokenMock.setOwner(owner);

          await expect(tx)
            .emit(tokenFactoryMock, 'TokenOwnerUpdated')
            .withArgs(await tokenMock.getAddress(), owner);
        });
      });
    });
  });
});
