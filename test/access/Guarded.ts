import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, utils } from 'hardhat';
import { expect } from 'chai';
import { setupGuardedMock } from './fixtures';

const { hashMessage, ZeroAddress } = ethers;
const { randomAddress, randomHex } = utils;

describe('access/Guarded // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupGuardedMock>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupGuardedMock);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('hasGuardian()', () => {
      it("expect to return false if the guardian doesn't exist", async () => {
        const { guarded } = fixture;

        const res = await guarded.isGuardian(randomAddress());

        expect(res).false;
      });

      it('expect to return true if the guardian exists', async () => {
        const { guarded, signers } = fixture;

        const res = await guarded.isGuardian(signers.guardian);

        expect(res).true;
      });

      it('expect to return true for the owner', async () => {
        const { guarded, signers } = fixture;

        const res = await guarded.isGuardian(signers.owner);

        expect(res).true;
      });
    });

    describe('_verifyGuardianSignature()', () => {
      it('expect to revert for invalid signature', async () => {
        const { guarded, signers } = fixture;

        const signature = await signers.guardian.signMessage(randomHex());

        const tx = guarded.verifyGuardianSignature(randomHex(), signature);

        await expect(tx).revertedWithCustomError(
          guarded,
          'InvalidGuardianSignature',
        );
      });

      it('expect not to revert for valid signature', async () => {
        const { guarded, signers } = fixture;

        const message = randomHex();
        const hash = hashMessage(message);
        const signature = await signers.guardian.signMessage(message);

        const tx = guarded.verifyGuardianSignature(hash, signature);

        await expect(tx).not.revertedWithCustomError(
          guarded,
          'InvalidGuardianSignature',
        );
      });
    });
  });

  describe('# setters', () => {
    describe('addGuardian()', () => {
      createBeforeHook();

      it('expect to revert when the msg.sender is not the owner', async () => {
        const { guarded, signers } = fixture;

        const tx = guarded
          .connect(signers.guardian)
          .addGuardian(randomAddress());

        await expect(tx).revertedWithCustomError(
          guarded,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect to revert when the guardian is the zero address', async () => {
        const { guarded } = fixture;

        const tx = guarded.addGuardian(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          guarded,
          'GuardianIsTheZeroAddress',
        );
      });

      it('expect to revert when the guardian already exists', async () => {
        const { guarded, signers } = fixture;

        const tx = guarded.addGuardian(signers.guardian);

        await expect(tx).revertedWithCustomError(
          guarded,
          'GuardianAlreadyExists',
        );
      });

      it('expect to add a new guardian', async () => {
        const { guarded } = fixture;

        const guardian = randomAddress();

        const tx = guarded.addGuardian(guardian);

        await expect(tx).emit(guarded, 'GuardianAdded').withArgs(guardian);
      });
    });

    describe('removeGuardian()', () => {
      createBeforeHook();

      it('expect to revert when the msg.sender is not the owner', async () => {
        const { guarded, signers } = fixture;

        const tx = guarded
          .connect(signers.guardian)
          .removeGuardian(randomAddress());

        await expect(tx).revertedWithCustomError(
          guarded,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect to revert when the guardian is the zero address', async () => {
        const { guarded } = fixture;

        const tx = guarded.removeGuardian(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          guarded,
          'GuardianIsTheZeroAddress',
        );
      });

      it("expect to revert when the guardian doesn't exist", async () => {
        const { guarded } = fixture;

        const tx = guarded.removeGuardian(randomAddress());

        await expect(tx).revertedWithCustomError(
          guarded,
          'GuardianDoesntExist',
        );
      });

      it('expect to remove the guardian', async () => {
        const { guarded, signers } = fixture;

        const tx = guarded.removeGuardian(signers.guardian);

        await expect(tx)
          .emit(guarded, 'GuardianRemoved')
          .withArgs(signers.guardian.address);
      });
    });

    describe('_setInitialGuardians()', () => {
      createBeforeHook();

      it('expect to set initial guardians', async () => {
        const { guarded } = fixture;

        const guardians = [randomAddress(), randomAddress()];

        await guarded.setInitialGuardians(guardians);

        for (const guardian of guardians) {
          expect(await guarded.isGuardian(guardian)).true;
        }
      });
    });
  });
});
