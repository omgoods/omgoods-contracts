import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployGateway } from './fixtures';

const { ZeroAddress } = ethers;

const { randomAddress } = helpers;

describe('gateway/Gateway', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployGateway>>;

    before(async () => {
      fixture = await loadFixture(deployGateway);
    });

    describe('initialize()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { gateway, signers } = fixture;

        const tx = gateway
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          gateway,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the account registry is the zero address', async () => {
        const { gateway } = fixture;

        const tx = gateway.initialize(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          gateway,
          'AccountRegistryIsTheZeroAddress',
        );
      });

      it('expect to initialize the contract', async () => {
        const { gateway } = fixture;

        const accountRegistry = randomAddress();

        const tx = gateway.initialize(accountRegistry);

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

          const tx = gateway.initialize(ZeroAddress);

          await expect(tx).revertedWithCustomError(
            gateway,
            'AlreadyInitialized',
          );
        });
      });
    });
  });
});
