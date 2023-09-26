import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../common';
import { deployOwnableMock } from './fixtures';

describe('access/Ownable // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployOwnableMock>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(deployOwnableMock);
    });
  };

  describe('# deployment', () => {
    describe('constructor()', () => {
      it('expect to deploy the contract with the msg.sender as the owner', async () => {
        const { ownableMock, signers } = await deployOwnableMock();

        const res = await ownableMock.getOwner();

        expect(res).eq(signers.owner.address);
      });

      it('expect to deploy the contract with a custom owner', async () => {
        const owner = randomAddress();

        const { ownableMock } = await deployOwnableMock({
          owner,
        });

        const res = await ownableMock.getOwner();

        expect(res).eq(owner);
      });
    });
  });

  describe('# getters', () => {
    createBeforeHook();

    describe('getOwner()', () => {
      it('expect to return the owner', async () => {
        const { ownableMock, signers } = fixture;

        const res = await ownableMock.getOwner();

        expect(res).eq(signers.owner.address);
      });
    });
  });

  describe('# setters', () => {
    describe('setOwner()', () => {
      createBeforeHook();

      it('expect to revert when the msg.sender is not the owner', async () => {
        const { ownableMock, signers } = fixture;

        const tx = ownableMock
          .connect(signers.unknown.at(0))
          .setOwner(randomAddress());

        await expect(tx).revertedWithCustomError(
          ownableMock,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the owner is the zero address', async () => {
        const { ownableMock } = fixture;

        const tx = ownableMock.setOwner(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          ownableMock,
          'OwnerIsTheZeroAddress',
        );
      });

      it('expect to update the owner', async () => {
        const { ownableMock, signers } = fixture;

        const newOwner = signers.unknown.at(0);

        const tx = ownableMock.setOwner(newOwner);

        await expect(tx)
          .emit(ownableMock, 'OwnerUpdated')
          .withArgs(newOwner.address);

        fixture.ownableMock = ownableMock.connect(newOwner);
      });
    });
  });
});
