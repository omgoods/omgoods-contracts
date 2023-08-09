import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployAccountRegistry } from './fixtures';

const { getSigners, ZeroAddress } = ethers;

const { randomAddress } = helpers;

describe('account/AccountRegistry', () => {
  let signers: HardhatEthersSigner[];

  before(async () => {
    [, ...signers] = await getSigners();
  });

  describe('# deployment functions', () => {
    let fixture: Awaited<ReturnType<typeof deployAccountRegistry>>;

    before(async () => {
      fixture = await loadFixture(deployAccountRegistry);
    });

    describe('initialize()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { accountRegistry } = fixture;

        await expect(
          accountRegistry
            .connect(signers[0])
            .initialize(ZeroAddress, ZeroAddress, ZeroAddress),
        ).revertedWithCustomError(
          accountRegistry,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the account implementation is the zero address', async () => {
        const { accountRegistry } = fixture;

        await expect(
          accountRegistry.initialize(ZeroAddress, ZeroAddress, ZeroAddress),
        ).revertedWithCustomError(
          accountRegistry,
          'AccountImplIsTheZeroAddress',
        );
      });

      it('expect to initialize the contract', async () => {
        const { accountRegistry } = fixture;

        const gateway = randomAddress();
        const entryPoint = randomAddress();
        const accountImpl = randomAddress();

        const tx = await accountRegistry.initialize(
          gateway,
          entryPoint,
          accountImpl,
        );

        await expect(tx)
          .emit(accountRegistry, 'Initialized')
          .withArgs(gateway, entryPoint, accountImpl);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { accountRegistry } = fixture;

          if (!(await accountRegistry.initialized())) {
            await accountRegistry.initialize(
              randomAddress(),
              randomAddress(),
              randomAddress(),
            );
          }
        });

        it('expect to revert', async () => {
          const { accountRegistry } = fixture;

          await expect(
            accountRegistry.initialize(ZeroAddress, ZeroAddress, ZeroAddress),
          ).revertedWithCustomError(accountRegistry, 'AlreadyInitialized');
        });
      });
    });
  });
});
