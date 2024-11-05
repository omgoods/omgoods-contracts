import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { ethers, utils } from 'hardhat';
import { expect } from 'chai';
import { TokenNotificationKinds } from './constants';
import { setupTokenMock } from './fixtures';

const { AbiCoder, ZeroHash } = ethers;
const { randomAddress } = utils;

describe('tokens/TokenImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupTokenMock>>;

  const createBeforeHook = (ready = false) => {
    before(async () => {
      fixture = await loadFixture(setupTokenMock);

      if (ready) {
        const { token } = fixture;

        await token.setReady();
      }
    });
  };

  describe('# modifiers', () => {
    describe('onlyCurrentManager()', () => {
      createBeforeHook();

      it('expect to revert when msg.sender is not the owner', async () => {
        const { token, signers } = fixture;

        const tx = token
          .connect(signers.controller)
          .requireOnlyCurrentManager();

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect not to revert when msg.sender is the owner', async () => {
        const { token, signers } = fixture;

        const tx = token.connect(signers.owner).requireOnlyCurrentManager();

        await expect(tx).not.revertedWithCustomError(
          token,
          'MsgSenderIsNotTheOwner',
        );
      });

      describe('# when ready', () => {
        createBeforeHook(true);

        it('expect to revert when msg.sender is not the controller', async () => {
          const { token, signers } = fixture;

          const tx = token.connect(signers.owner).requireOnlyCurrentManager();

          await expect(tx).revertedWithCustomError(
            token,
            'MsgSenderIsNotTheController',
          );
        });

        it('expect not to revert when msg.sender is the controller', async () => {
          const { token, signers } = fixture;

          const tx = token
            .connect(signers.controller)
            .requireOnlyCurrentManager();

          await expect(tx).not.revertedWithCustomError(
            token,
            'MsgSenderIsNotTheController',
          );
        });
      });
    });

    describe('onlyReadyOrAnyManager()', () => {
      createBeforeHook();

      it('expect to revert when msg.sender is not the owner or controller', async () => {
        const { token, signers } = fixture;

        const tx = token
          .connect(signers.unknown.at(0))
          .requireOnlyReadyOrAnyManager();

        await expect(tx).revertedWithCustomError(token, 'TokenNotReady');
      });

      it('expect not to revert when msg.sender is the owner', async () => {
        const { token, signers } = fixture;

        const tx = token.connect(signers.owner).requireOnlyReadyOrAnyManager();

        await expect(tx).not.revertedWithCustomError(token, 'TokenNotReady');
      });

      it('expect not to revert when msg.sender is the controller', async () => {
        const { token, signers } = fixture;

        const tx = token
          .connect(signers.controller)
          .requireOnlyReadyOrAnyManager();

        await expect(tx).not.revertedWithCustomError(token, 'TokenNotReady');
      });

      describe('# when ready', () => {
        createBeforeHook(true);

        it('expect not to revert', async () => {
          const { token, signers } = fixture;

          const tx = token
            .connect(signers.unknown.at(0))
            .requireOnlyReadyOrAnyManager();

          await expect(tx).not.revertedWithCustomError(token, 'TokenNotReady');
        });
      });
    });
  });

  describe('# getters', () => {
    createBeforeHook();

    describe('getController()', () => {
      it('expect to return the controller', async () => {
        const { token, signers } = fixture;

        const res = await token.getController();

        expect(res).eq(signers.controller.address);
      });
    });

    describe('isReady()', () => {
      it('expect to return true whe the token is ready', async () => {
        const { token } = fixture;

        const res = await token.isReady();

        expect(res).false;
      });
    });

    describe('_hashInitialization()', () => {
      it('expect to return initialization hash', async () => {
        const { tokenImpl, tokenImpTypedData } = fixture;

        const owner = randomAddress();
        const controller = randomAddress();

        const res = await tokenImpl.hashInitialization({
          owner,
          controller,
        });

        expect(res).eq(
          tokenImpTypedData.hash('Initialization', {
            owner,
            controller,
          }),
        );
      });

      it('expect to return empty for token', async () => {
        const { token } = fixture;

        const res = await token.hashInitialization({
          owner: randomAddress(),
          controller: randomAddress(),
        });

        expect(res).eq(ZeroHash);
      });
    });
  });

  describe('# setters', () => {
    describe('setReady', () => {
      describe('# when not ready', () => {
        createBeforeHook();

        it('expect to revert when the msg.sender is not the owner', async () => {
          const { signers, token } = fixture;

          const tx = token.connect(signers.unknown.at(0)).setReady();

          await expect(tx).revertedWithCustomError(
            token,
            'MsgSenderIsNotTheOwner',
          );
        });

        it('expect to set the ready state', async () => {
          const { token, tokenFactory, signers } = fixture;

          const tx = token.connect(signers.owner).setReady();

          await expect(tx)
            .emit(tokenFactory, 'TokenNotification')
            .withArgs(
              await token.getAddress(),
              TokenNotificationKinds.Ready,
              anyValue,
              anyValue,
            );
        });
      });

      describe('# when ready', () => {
        createBeforeHook(true);

        it('expect to revert', async () => {
          const { signers, token } = fixture;

          const tx = token.connect(signers.owner).setReady();

          await expect(tx).revertedWithCustomError(token, 'TokenAlreadyReady');
        });
      });
    });

    describe('_afterOwnerUpdated', () => {
      createBeforeHook();

      it('expect to emit token notification', async () => {
        const { signers, token, tokenFactory } = fixture;

        const owner = signers.unknown.at(0).address;

        const tx = token.connect(signers.owner).setOwner(owner);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.OwnerUpdated,
            AbiCoder.defaultAbiCoder().encode(['address'], [owner]),
            anyValue,
          );
      });
    });
  });
});
