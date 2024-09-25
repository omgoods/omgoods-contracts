import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyUint } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { ZeroAddress, randomBytes } from 'ethers';
import { utils } from 'hardhat';
import { expect } from 'chai';
import { deployTokenMock, setupTokenMock } from './fixtures';
import { TokenNotificationsKinds } from './constants';

const { abiCoder, randomAddress } = utils;

describe('tokens/Token // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupTokenMock>>;

  before(async () => {
    fixture = await loadFixture(setupTokenMock);
  });

  const createBeforeHook = (unlock = false) => {
    before(async () => {
      fixture = await loadFixture(setupTokenMock);

      if (unlock) {
        const { token } = fixture;

        await token.unlock();
      }
    });
  };

  describe('# modifiers', () => {
    describe('onlyOwnerWhenLocked()', () => {
      describe('# before unlocking', () => {
        createBeforeHook();

        it('expect to check the owner when contract is locked', async () => {
          const { token, signers } = fixture;

          const tx = token
            .connect(signers.unknown.at(0))
            .triggerOnlyOwnerWhenLocked();

          await expect(tx).revertedWithCustomError(
            token,
            'MsgSenderIsNotTheOwner',
          );
        });
      });

      describe('# after unlocking', () => {
        createBeforeHook(true);

        it('expect to omit the owner check', async () => {
          const { token, signers } = fixture;

          const res = await token
            .connect(signers.unknown.at(0))
            .triggerOnlyOwnerWhenLocked();

          expect(res).true;
        });
      });
    });
  });

  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployTokenMock>>;

    before(async () => {
      fixture = await loadFixture(deployTokenMock);
    });

    describe('initialize()', () => {
      it('expect to revert when the token registry is the zero address', async () => {
        const { token } = fixture;

        const tx = token.initialize(ZeroAddress, ZeroAddress, false);

        await expect(tx).revertedWithCustomError(
          token,
          'TokenRegistryIsTheZeroAddress',
        );
      });

      it('expect to initialize the contract', async () => {
        const { token } = fixture;

        const forwarder = randomAddress();
        const tokenRegistry = randomAddress();
        const locked = true;

        await token.initialize(forwarder, tokenRegistry, locked);

        expect(await token.forwarder()).eq(forwarder);
        expect(await token.getTokenRegistry()).eq(tokenRegistry);
        expect(await token.locked()).eq(locked);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { token } = fixture;

          if (!(await token.initialized())) {
            await token.initialize(randomAddress(), randomAddress(), false);
          }
        });

        it('expect to revert', async () => {
          const { token } = fixture;

          const tx = token.initialize(ZeroAddress, ZeroAddress, false);

          await expect(tx).revertedWithCustomError(token, 'AlreadyInitialized');
        });
      });
    });
  });

  describe('# getters', () => {
    describe('getTokenRegistry()', () => {
      it('expect to return the token registry address', async () => {
        const { token, tokenRegistry } = fixture;

        const res = await token.getTokenRegistry();

        expect(res).eq(await tokenRegistry.getAddress());
      });
    });

    describe('locked()', () => {
      describe('# before unlocking', () => {
        createBeforeHook();

        it('expect to return true', async () => {
          const { token } = fixture;

          const res = await token.locked();

          expect(res).true;
        });
      });

      describe('# after unlocking', () => {
        createBeforeHook(true);

        it('expect to return false', async () => {
          const { token } = fixture;

          const res = await token.locked();

          expect(res).false;
        });
      });
    });
  });

  describe('# setters', () => {
    describe('_notifyTokenRegistry()', () => {
      it('expect the token registry to be notified', async () => {
        const { token, tokenRegistry } = fixture;

        const encodedData = randomBytes(10);

        const tx = token.notifyTokenRegistry(
          TokenNotificationsKinds.Unlocked,
          encodedData,
        );

        await expect(tx)
          .emit(tokenRegistry, 'TokenNotificationSent')
          .withArgs(
            await token.getAddress(),
            TokenNotificationsKinds.Unlocked,
            encodedData,
            anyUint,
          );
      });
    });

    describe('_setOwner()', () => {
      it('expect to send the notification after setting the new owner', async () => {
        const { token, tokenRegistry } = fixture;

        const owner = randomAddress();

        const tx = token.setOwner(owner);

        await expect(tx)
          .emit(tokenRegistry, 'TokenNotificationSent')
          .withArgs(
            await token.getAddress(),
            TokenNotificationsKinds.OwnerUpdated,
            abiCoder.encode(['address'], [owner]),
            anyUint,
          );
      });
    });
  });
});
