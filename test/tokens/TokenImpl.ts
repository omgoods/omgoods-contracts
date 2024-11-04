import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { utils, ethers } from 'hardhat';
import { expect } from 'chai';
import { setupTokenMock } from './fixtures';

const { AbiCoder, ZeroHash } = ethers;
const { randomAddress } = utils;

describe('tokens/TokenImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupTokenMock>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupTokenMock);
    });
  };

  describe('# modifiers', () => {
    createBeforeHook();

    describe('# when ready', () => {});
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
        const { token, signers } = fixture;

        const res = await token.getController();

        expect(res).eq(signers.controller.address);
      });
    });

    describe('_hashInitialization()', () => {
      it('expect to return initialization hash', async () => {
        const { tokenImpl, tokenImpTypedData } = fixture;

        const owner = randomAddress();
        const controller = randomAddress();
        const ready = true;

        const res = await tokenImpl.hashInitialization({
          owner,
          controller,
          ready,
        });

        expect(res).eq(
          tokenImpTypedData.hash('Initialization', {
            owner,
            controller,
            ready,
          }),
        );
      });

      it('expect to return empty for token', async () => {
        const { token } = fixture;

        const res = await token.hashInitialization({
          owner: randomAddress(),
          controller: randomAddress(),
          ready: false,
        });

        expect(res).eq(ZeroHash);
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('setReady', () => {
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
          .withArgs(await token.getAddress(), 0, '0x', anyValue);
      });

      describe('# when ready', () => {
        before(async () => {
          const { token } = fixture;

          if (!(await token.isReady())) {
            await token.setReady();
          }
        });

        it('expect to revert', async () => {
          const { signers, token } = fixture;

          const tx = token.connect(signers.owner).setReady();

          await expect(tx).revertedWithCustomError(token, 'TokenAlreadyReady');
        });
      });
    });

    describe('_afterOwnerUpdated', () => {
      after(async () => {
        const { token, signers } = fixture;

        await token.connect(signers.unknown.at(0)).setOwner(signers.owner);
      });

      it('expect to emit token notification', async () => {
        const { signers, token, tokenFactory } = fixture;

        const owner = signers.unknown.at(0).address;

        const tx = token.connect(signers.owner).setOwner(owner);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            1,
            AbiCoder.defaultAbiCoder().encode(['address'], [owner]),
            anyValue,
          );
      });
    });
  });
});
