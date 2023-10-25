import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../common';
import { deployGuardedMock } from './fixtures';

describe('access/Guarded // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployGuardedMock>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(deployGuardedMock);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('hasGuardian()', () => {
      it("expect to return false if the guardian doesn't exist", async () => {
        const { guarded } = fixture;

        const res = await guarded.hasGuardian(randomAddress());

        expect(res).false;
      });

      it('expect to return true if the guardian exists', async () => {
        const { guarded, signers } = fixture;

        const res = await guarded.hasGuardian(signers.guardian);

        expect(res).true;
      });

      it('expect to return true for the owner', async () => {
        const { guarded, signers } = fixture;

        const res = await guarded.hasGuardian(signers.owner);

        expect(res).true;
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
          expect(await guarded.hasGuardian(guardian)).true;
        }
      });
    });
  });
});
