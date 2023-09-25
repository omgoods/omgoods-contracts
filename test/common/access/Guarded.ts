import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { hashMessage, ZeroAddress, randomBytes } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../../helpers';
import { deployGuardedMock } from './fixtures';

describe('common/access/Guarded // mocked', () => {
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
        const { guardedMock } = fixture;

        const res = await guardedMock.hasGuardian(randomAddress());

        expect(res).false;
      });

      it('expect to return true if the guardian exists', async () => {
        const { guardedMock, signers } = fixture;

        const res = await guardedMock.hasGuardian(signers.guardian);

        expect(res).true;
      });

      it('expect to return true for the owner', async () => {
        const { guardedMock, signers } = fixture;

        const res = await guardedMock.hasGuardian(signers.owner);

        expect(res).true;
      });
    });

    describe('_verifyGuardianSignature()', () => {
      const message = randomBytes(32);
      const hash = hashMessage(message);

      it('expect to revert when the signer is not a guardian', async () => {
        const { guardedMock, signers } = fixture;

        const tx = guardedMock.verifyGuardianSignature(
          hash,
          await signers.unknown.at(0).signMessage(message),
        );

        await expect(tx).revertedWithCustomError(
          guardedMock,
          'InvalidGuardianSignature',
        );
      });

      it('expect not to revert when the signer is a guardian', async () => {
        const { guardedMock, signers } = fixture;

        const tx = guardedMock.verifyGuardianSignature(
          hash,
          await signers.guardian.signMessage(message),
        );

        await expect(tx).not.revertedWithCustomError(
          guardedMock,
          'InvalidGuardianSignature',
        );
      });
    });
  });

  describe('# setters', () => {
    describe('addGuardian()', () => {
      createBeforeHook();

      it('expect to revert when the msg.sender is not the owner', async () => {
        const { guardedMock, signers } = fixture;

        const tx = guardedMock
          .connect(signers.guardian)
          .addGuardian(randomAddress());

        await expect(tx).revertedWithCustomError(
          guardedMock,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the guardian is the zero address', async () => {
        const { guardedMock } = fixture;

        const tx = guardedMock.addGuardian(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          guardedMock,
          'GuardianIsTheZeroAddress',
        );
      });

      it('expect to revert when the guardian already exists', async () => {
        const { guardedMock, signers } = fixture;

        const tx = guardedMock.addGuardian(signers.guardian);

        await expect(tx).revertedWithCustomError(
          guardedMock,
          'GuardianAlreadyExists',
        );
      });

      it('expect to add a new guardian', async () => {
        const { guardedMock } = fixture;

        const guardian = randomAddress();

        const tx = guardedMock.addGuardian(guardian);

        await expect(tx).emit(guardedMock, 'GuardianAdded').withArgs(guardian);
      });
    });

    describe('removeGuardian()', () => {
      createBeforeHook();

      it('expect to revert when the msg.sender is not the owner', async () => {
        const { guardedMock, signers } = fixture;

        const tx = guardedMock
          .connect(signers.guardian)
          .removeGuardian(randomAddress());

        await expect(tx).revertedWithCustomError(
          guardedMock,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the guardian is the zero address', async () => {
        const { guardedMock } = fixture;

        const tx = guardedMock.removeGuardian(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          guardedMock,
          'GuardianIsTheZeroAddress',
        );
      });

      it("expect to revert when the guardian doesn't exist", async () => {
        const { guardedMock } = fixture;

        const tx = guardedMock.removeGuardian(randomAddress());

        await expect(tx).revertedWithCustomError(
          guardedMock,
          'GuardianDoesntExist',
        );
      });

      it('expect to remove the guardian', async () => {
        const { guardedMock, signers } = fixture;

        const tx = guardedMock.removeGuardian(signers.guardian);

        await expect(tx)
          .emit(guardedMock, 'GuardianRemoved')
          .withArgs(signers.guardian.address);
      });
    });

    describe('_addGuardians()', () => {
      createBeforeHook();

      it('expect to revert when one of the guardians is the zero address', async () => {
        const { guardedMock } = fixture;

        const tx = guardedMock.addGuardians([ZeroAddress, randomAddress()]);

        await expect(tx).revertedWithCustomError(
          guardedMock,
          'GuardianIsTheZeroAddress',
        );
      });

      it('expect to revert when one of the guardians already exists', async () => {
        const { guardedMock, signers } = fixture;

        const tx = guardedMock.addGuardians([
          randomAddress(),
          signers.guardian,
        ]);

        await expect(tx).revertedWithCustomError(
          guardedMock,
          'GuardianAlreadyExists',
        );
      });

      it('expect to add many guardians', async () => {
        const { guardedMock } = fixture;

        const guardians = [randomAddress(), randomAddress()];

        await guardedMock.addGuardians(guardians);

        for (const guardian of guardians) {
          expect(await guardedMock.hasGuardian(guardian)).true;
        }
      });
    });
  });
});
