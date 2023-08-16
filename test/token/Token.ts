import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, testsUtils } from 'hardhat';
import { expect } from 'chai';
import { deployTokenMock, setupTokenMock } from './fixtures';

const { ZeroAddress } = ethers;

const { randomAddress } = testsUtils;

describe('token/Token // mocked', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployTokenMock>>;

    before(async () => {
      fixture = await loadFixture(deployTokenMock);
    });

    describe('_initialize()', () => {
      it('expect to revert when the token registry is the zero address', async () => {
        const { tokenMock } = fixture;

        const tx = tokenMock.initialize(ZeroAddress, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenMock,
          'TokenRegistryIsTheZeroAddress',
        );
      });

      it('expect to initialize the contract', async () => {
        const { tokenMock } = fixture;

        const gateway = randomAddress();
        const tokenRegistry = randomAddress();

        const tx = tokenMock.initialize(gateway, tokenRegistry);

        await expect(tx)
          .emit(tokenMock, 'Initialized')
          .withArgs(gateway, tokenRegistry);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { tokenMock } = fixture;

          if (!(await tokenMock.initialized())) {
            await tokenMock.initialize(randomAddress(), randomAddress());
          }
        });

        it('expect to revert', async () => {
          const { tokenMock } = fixture;

          const tx = tokenMock.initialize(ZeroAddress, ZeroAddress);

          await expect(tx).revertedWithCustomError(
            tokenMock,
            'AlreadyInitialized',
          );
        });
      });
    });
  });

  let fixture: Awaited<ReturnType<typeof setupTokenMock>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupTokenMock);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('getTokenRegistry()', () => {
      it('expect to return the token registry', async () => {
        const { tokenRegistryMock, tokenMock } = fixture;

        const res = await tokenMock.getTokenRegistry();

        expect(res).eq(await tokenRegistryMock.getAddress());
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('_afterOwnerUpdated()', () => {
      it("expect to trigger a token's registry event after the owner update", async () => {
        const { tokenRegistryMock, tokenMock } = fixture;

        const owner = randomAddress();

        const tx = tokenMock.setOwner(owner);

        await expect(tx).emit(tokenMock, 'OwnerUpdated').withArgs(owner);

        await expect(tx)
          .emit(tokenRegistryMock, 'TokenOwnerUpdated')
          .withArgs(await tokenMock.getAddress(), owner);
      });
    });
  });
});
