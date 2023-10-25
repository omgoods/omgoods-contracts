import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../common';
import { deployOwnableMock } from './fixtures';

describe('access/Ownable // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployOwnableMock>>;

  beforeEach(async () => {
    fixture = await loadFixture(deployOwnableMock);
  });

  describe('# getters', () => {
    describe('getOwner()', () => {
      it('expect to return the owner', async () => {
        const { ownable, signers } = fixture;

        const res = await ownable.getOwner();

        expect(res).eq(signers.owner.address);
      });
    });
  });

  describe('# setters', () => {
    describe('setOwner()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { ownable, signers } = fixture;

        const tx = ownable
          .connect(signers.unknown.at(0))
          .setOwner(randomAddress());

        await expect(tx).revertedWithCustomError(
          ownable,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect to revert when the owner is the zero address', async () => {
        const { ownable } = fixture;

        const tx = ownable.setOwner(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          ownable,
          'OwnerIsTheZeroAddress',
        );
      });

      it('expect to update the owner', async () => {
        const { ownable, signers } = fixture;

        const newOwner = signers.unknown.at(0);

        const tx = ownable.setOwner(newOwner);

        await expect(tx)
          .emit(ownable, 'OwnerUpdated')
          .withArgs(newOwner.address);
      });
    });

    describe('_setInitialOwner()', () => {
      it('expect to use msg.sender as the initial owner', async () => {
        const { ownable, signers } = fixture;

        await ownable.setInitialOwner(ZeroAddress);

        expect(await ownable.getOwner()).eq(signers.owner.address);
      });

      it('expect to set the initial owner', async () => {
        const { ownable, signers } = fixture;

        const newOwner = signers.unknown.at(1);

        await ownable.setInitialOwner(newOwner);

        expect(await ownable.getOwner()).eq(newOwner.address);
      });
    });
  });
});
