import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { setupInitializableMock } from './fixtures';

describe('utils/Initializable // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupInitializableMock>>;

  const createBeforeHook = (initialized = false) => {
    before(async () => {
      fixture = await loadFixture(setupInitializableMock);

      if (initialized) {
        const { initializable } = fixture;

        await initializable.setInitialized(initialized);
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

      describe('# when initialized', () => {
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

      describe('# when initialized', () => {
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
