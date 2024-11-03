import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { deployInitializableMock } from './fixtures';

describe('utils/Initializable // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployInitializableMock>>;

  const createBeforeHook = (initialize = false) => {
    before(async () => {
      fixture = await loadFixture(deployInitializableMock);

      if (initialize) {
        const { initializable } = fixture;

        await initializable.initialize();
      }
    });
  };

  describe('# modifiers', () => {
    createBeforeHook();

    describe('initializeOnce()', () => {
      it('expect to initialize the contract', async () => {
        const { initializable } = fixture;

        const tx = initializable.initialize();

        await expect(tx).emit(initializable, 'Initialized');
      });

      describe('# after initialization', () => {
        createBeforeHook(true);

        it('expect to revert', async () => {
          const { initializable } = fixture;

          const tx = initializable.initialize();

          await expect(tx).revertedWithCustomError(
            initializable,
            'AlreadyInitialized',
          );
        });
      });
    });
  });

  describe('# getters', () => {
    createBeforeHook();

    describe('isInitialized()', () => {
      it('expect to return false before initialization', async () => {
        const { initializable } = fixture;

        const res = await initializable.isInitialized();

        expect(res).false;
      });

      describe('# after initialization', () => {
        createBeforeHook(true);

        it('expect to return true', async () => {
          const { initializable } = fixture;

          const res = await initializable.isInitialized();

          expect(res).true;
        });
      });
    });
  });
});
