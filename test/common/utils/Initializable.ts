import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { deployInitializableMock } from './fixtures';

describe('common/utils/Initializable (using mock)', () => {
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

  describe('# external functions (getters)', () => {
    createBeforeHook();

    describe('initialized()', () => {
      it('expect to return false before initialization', async () => {
        const { initializableMock } = fixture;

        expect(await initializableMock.initialized()).false;
      });

      describe('# after initialization', () => {
        createBeforeHook(true);

        it('expect to return true', async () => {
          const { initializableMock } = fixture;

          expect(await initializableMock.initialized()).true;
        });
      });
    });
  });

  describe('# external functions (setters)', () => {
    createBeforeHook();

    describe('initialize() // mocked', () => {
      it('expect to initialize the contract', async () => {
        const { initializableMock } = fixture;

        const tx = await initializableMock.initialize();

        await expect(tx).emit(initializableMock, 'Initialized');
      });

      describe('# after initialization', () => {
        createBeforeHook(true);

        it('expect to revert', async () => {
          const { initializableMock } = fixture;

          await expect(initializableMock.initialize()).revertedWithCustomError(
            initializableMock,
            'AlreadyInitialized',
          );
        });
      });
    });
  });
});
