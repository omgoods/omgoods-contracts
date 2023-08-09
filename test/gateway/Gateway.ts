import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployGateway } from './fixtures';

const { getSigners, ZeroAddress } = ethers;

const { randomAddress } = helpers;

describe('gateway/Gateway', () => {
  let signers: HardhatEthersSigner[];

  before(async () => {
    [, ...signers] = await getSigners();
  });

  describe('# deployment functions', () => {
    let fixture: Awaited<ReturnType<typeof deployGateway>>;

    before(async () => {
      fixture = await loadFixture(deployGateway);
    });

    describe('initialize()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { gateway } = fixture;

        await expect(
          gateway.connect(signers[0]).initialize(ZeroAddress),
        ).revertedWithCustomError(gateway, 'MsgSenderIsNotTheContractOwner');
      });

      it('expect to revert when the account registry is the zero address', async () => {
        const { gateway } = fixture;

        await expect(gateway.initialize(ZeroAddress)).revertedWithCustomError(
          gateway,
          'AccountRegistryIsTheZeroAddress',
        );
      });

      it('expect to initialize the contract', async () => {
        const { gateway } = fixture;

        const accountRegistry = randomAddress();

        const tx = await gateway.initialize(accountRegistry);

        await expect(tx).emit(gateway, 'Initialized').withArgs(accountRegistry);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { gateway } = fixture;

          if (!(await gateway.initialized())) {
            await gateway.initialize(randomAddress());
          }
        });

        it('expect to revert', async () => {
          const { gateway } = fixture;

          await expect(gateway.initialize(ZeroAddress)).revertedWithCustomError(
            gateway,
            'AlreadyInitialized',
          );
        });
      });
    });
  });
});
