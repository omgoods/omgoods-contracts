import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployOwnableMock } from './fixtures';

const { getSigners, ZeroAddress } = ethers;

const { randomAddress } = helpers;

describe('common/access/Ownable (using mock)', () => {
  let owner: HardhatEthersSigner;
  let signers: HardhatEthersSigner[];

  let fixture: Awaited<ReturnType<typeof deployOwnableMock>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(deployOwnableMock);
    });
  };

  before(async () => {
    [owner, ...signers] = await getSigners();
  });

  describe('# deployment functions', () => {
    describe('constructor()', () => {
      it('expect to deploy the contract with the msg.sender as the owner', async () => {
        const { ownableMock } = await deployOwnableMock();

        expect(await ownableMock.getOwner()).eq(owner.address);
      });

      it('expect to deploy the contract with a custom owner', async () => {
        const owner = randomAddress();

        const { ownableMock } = await deployOwnableMock({
          owner,
        });

        expect(await ownableMock.getOwner()).eq(owner);
      });
    });
  });

  describe('# external functions (getters)', () => {
    createBeforeHook();

    describe('getOwner()', () => {
      it('expect to return the owner', async () => {
        const { ownableMock } = fixture;

        expect(await ownableMock.getOwner()).eq(owner.address);
      });
    });
  });

  describe('# external functions (setters)', () => {
    describe('setOwner()', () => {
      createBeforeHook();

      it('expect to revert when the msg.sender is not the owner', async () => {
        const { ownableMock } = fixture;

        await expect(
          ownableMock.connect(signers[0]).setOwner(randomAddress()),
        ).revertedWithCustomError(
          ownableMock,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the owner is the zero address', async () => {
        const { ownableMock } = fixture;

        await expect(ownableMock.setOwner(ZeroAddress)).revertedWithCustomError(
          ownableMock,
          'OwnerIsTheZeroAddress',
        );
      });

      it('expect to update the owner', async () => {
        const { ownableMock } = fixture;

        owner = signers[1];

        const tx = await ownableMock.setOwner(owner);

        await expect(tx)
          .emit(ownableMock, 'OwnerUpdated')
          .withArgs(owner.address);

        fixture.ownableMock = ownableMock.connect(owner);
      });
    });
  });
});
