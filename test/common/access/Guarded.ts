import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployGuardedMock } from './fixtures';

const { getSigners, hashMessage, ZeroAddress, randomBytes } = ethers;

const { randomAddress } = helpers;

describe('common/access/Guarded (using mock)', () => {
  let owner: HardhatEthersSigner;
  let guardian: HardhatEthersSigner;
  let signers: HardhatEthersSigner[];

  before(async () => {
    [owner, guardian, ...signers] = await getSigners();
  });

  let fixture: Awaited<ReturnType<typeof deployGuardedMock>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(deployGuardedMock);

      const { guardedMock } = fixture;

      await guardedMock.addGuardian(guardian);
    });
  };

  describe('# external functions (getters)', () => {
    createBeforeHook();

    describe('hasGuardian()', () => {
      it("expect to return false if the guardian doesn't exist", async () => {
        const { guardedMock } = fixture;

        expect(await guardedMock.hasGuardian(randomAddress())).false;
      });

      it('expect to return true if the guardian exists', async () => {
        const { guardedMock } = fixture;

        expect(await guardedMock.hasGuardian(guardian)).true;
      });

      it('expect to return true for the owner', async () => {
        const { guardedMock } = fixture;

        expect(await guardedMock.hasGuardian(owner)).true;
      });
    });

    describe('verifyGuardianSignature() // mocked', () => {
      const message = randomBytes(32);
      const hash = hashMessage(message);

      it('expect to revert when the signer is not a guardian', async () => {
        const { guardedMock } = fixture;

        await expect(
          guardedMock.verifyGuardianSignature(
            hash,
            await signers[0].signMessage(message),
          ),
        ).revertedWithCustomError(guardedMock, 'InvalidGuardianSignature');
      });

      it('expect to return true when the signer is a guardian', async () => {
        const { guardedMock } = fixture;

        expect(
          await guardedMock.verifyGuardianSignature(
            hash,
            await guardian.signMessage(message),
          ),
        ).true;
      });
    });
  });

  describe('# external functions (setters)', () => {
    describe('addGuardian()', () => {
      createBeforeHook();

      it('expect to revert when the msg.sender is not the owner', async () => {
        const { guardedMock } = fixture;

        await expect(
          guardedMock.connect(guardian).addGuardian(randomAddress()),
        ).revertedWithCustomError(
          guardedMock,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the guardian is the zero address', async () => {
        const { guardedMock } = fixture;

        await expect(
          guardedMock.addGuardian(ZeroAddress),
        ).revertedWithCustomError(guardedMock, 'GuardianIsTheZeroAddress');
      });

      it('expect to revert when the guardian already exists', async () => {
        const { guardedMock } = fixture;

        await expect(guardedMock.addGuardian(guardian)).revertedWithCustomError(
          guardedMock,
          'GuardianAlreadyExists',
        );
      });

      it('expect to add a new guardian', async () => {
        const { guardedMock } = fixture;

        const guardian = randomAddress();

        const tx = await guardedMock.addGuardian(guardian);

        await expect(tx).emit(guardedMock, 'GuardianAdded').withArgs(guardian);
      });
    });

    describe('removeGuardian()', () => {
      createBeforeHook();

      it('expect to revert when the msg.sender is not the owner', async () => {
        const { guardedMock } = fixture;

        await expect(
          guardedMock.connect(guardian).removeGuardian(randomAddress()),
        ).revertedWithCustomError(
          guardedMock,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the guardian is the zero address', async () => {
        const { guardedMock } = fixture;

        await expect(
          guardedMock.removeGuardian(ZeroAddress),
        ).revertedWithCustomError(guardedMock, 'GuardianIsTheZeroAddress');
      });

      it("expect to revert when the guardian doesn't exist", async () => {
        const { guardedMock } = fixture;

        await expect(
          guardedMock.removeGuardian(randomAddress()),
        ).revertedWithCustomError(guardedMock, 'GuardianDoesntExist');
      });

      it('expect to remove the guardian', async () => {
        const { guardedMock } = fixture;

        const tx = await guardedMock.removeGuardian(guardian);

        await expect(tx)
          .emit(guardedMock, 'GuardianRemoved')
          .withArgs(guardian.address);
      });
    });

    describe('setGuardians()', () => {
      createBeforeHook();

      it('expect to revert when one of the guardians is the zero address', async () => {
        const { guardedMock } = fixture;

        await expect(
          guardedMock.addGuardians([ZeroAddress, randomAddress()]),
        ).revertedWithCustomError(guardedMock, 'GuardianIsTheZeroAddress');
      });

      it('expect to revert when one of the guardians already exists', async () => {
        const { guardedMock } = fixture;

        await expect(
          guardedMock.addGuardians([randomAddress(), guardian.address]),
        ).revertedWithCustomError(guardedMock, 'GuardianAlreadyExists');
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
