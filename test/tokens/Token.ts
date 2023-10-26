import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress, randomBytes, AbiCoder } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../common';
import { deployTokenMock, setupTokenMock } from './fixtures';
import { TokenNotificationsKinds } from './constants';

describe('tokens/Token // mocked', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployTokenMock>>;

    before(async () => {
      fixture = await loadFixture(deployTokenMock);
    });

    describe('initialize()', () => {
      it('expect to revert when the token registry is the zero address', async () => {
        const { token } = fixture;

        const tx = token.initialize(ZeroAddress, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          token,
          'TokenRegistryIsTheZeroAddress',
        );
      });

      it('expect to initialize the contract', async () => {
        const { token } = fixture;

        const gateway = randomAddress();
        const tokenRegistry = randomAddress();

        await token.initialize(gateway, tokenRegistry);

        expect(await token.getGateway()).eq(gateway);
        expect(await token.getTokenRegistry()).eq(tokenRegistry);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { token } = fixture;

          if (!(await token.initialized())) {
            await token.initialize(randomAddress(), randomAddress());
          }
        });

        it('expect to revert', async () => {
          const { token } = fixture;

          const tx = token.initialize(ZeroAddress, ZeroAddress);

          await expect(tx).revertedWithCustomError(token, 'AlreadyInitialized');
        });
      });
    });
  });

  let fixture: Awaited<ReturnType<typeof setupTokenMock>>;

  before(async () => {
    fixture = await loadFixture(setupTokenMock);
  });

  describe('# getters', () => {
    describe('getTokenRegistry()', () => {
      it('expect to return the token registry address', async () => {
        const { token, tokenRegistry } = fixture;

        const res = await token.getTokenRegistry();

        expect(res).eq(await tokenRegistry.getAddress());
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
            AbiCoder.defaultAbiCoder().encode(['address'], [owner]),
          );
      });
    });
  });
});
