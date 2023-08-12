import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { deployInitializableMock } from './fixtures';

describe('common/utils/Initializable // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployInitializableMock>>;

  const createBeforeHook = (initialize = false) => {
    before(async () => {
      fixture = await loadFixture(deployInitializableMock);

      if (initialize) {
        const { initializableMock } = fixture;

        await initializableMock.initialize();
      }
    });
  };

  describe('# modifiers', () => {
    createBeforeHook();

    describe('initializeOnce()', () => {
      it('expect to initialize the contract', async () => {
        const { initializableMock } = fixture;

        const tx = initializableMock.initialize();

        await expect(tx).emit(initializableMock, 'Initialized');
      });

      describe('# after initialization', () => {
        createBeforeHook(true);

        it('expect to revert', async () => {
          const { initializableMock } = fixture;

          const tx = initializableMock.initialize();

          await expect(tx).revertedWithCustomError(
            initializableMock,
            'AlreadyInitialized',
          );
        });
      });
    });
  });

  describe('# getters', () => {
    createBeforeHook();

    describe('initialized()', () => {
      it('expect to return false before initialization', async () => {
        const { initializableMock } = fixture;

        const res = await initializableMock.initialized();

        expect(res).false;
      });

      describe('# after initialization', () => {
        createBeforeHook(true);

        it('expect to return true', async () => {
          const { initializableMock } = fixture;

          const res = await initializableMock.initialized();

          expect(res).true;
        });
      });
    });
  });
});
