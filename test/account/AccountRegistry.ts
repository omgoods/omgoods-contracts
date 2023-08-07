import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployAccountRegistry, setupAccountRegistry } from './fixtures';

const { getSigners, ZeroAddress } = ethers;

const { randomAddress } = helpers;

describe('account/AccountRegistry', () => {
  let owner: HardhatEthersSigner;
  let signers: HardhatEthersSigner[];

  before(async () => {
    [owner, ...signers] = await getSigners();
  });

  describe('# deployment functions', () => {
    let fixture: Awaited<ReturnType<typeof deployAccountRegistry>>;

    before(async () => {
      fixture = await loadFixture(deployAccountRegistry);
    });

    describe('constructor()', () => {
      it('expect to deploy the contract', async () => {
        const { accountRegistry } = fixture;

        expect(await accountRegistry.getOwner()).eq(owner.address);
      });

      it('expect to deploy the contract with a custom owner', async () => {
        const owner = randomAddress();
        const { accountRegistry } = await deployAccountRegistry({
          owner,
        });

        expect(await accountRegistry.getOwner()).eq(owner);
      });
    });

    describe('initialize()', () => {
      it('expect to revert when msg.sender is not the contract owner', async () => {
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

      it('expect to revert when account implementation is the zero address', async () => {
        const { accountRegistry } = fixture;

        await expect(
          accountRegistry.initialize(ZeroAddress, ZeroAddress, ZeroAddress),
        ).revertedWithCustomError(
          accountRegistry,
          'AccountImplementationIsTheZeroAddress',
        );
      });

      it('expect to initialize the contract', async () => {
        const { accountRegistry } = fixture;

        const gateway = randomAddress();
        const entryPoint = randomAddress();
        const accountImplementation = randomAddress();

        const tx = await accountRegistry.initialize(
          gateway,
          entryPoint,
          accountImplementation,
        );

        await expect(tx)
          .emit(accountRegistry, 'Initialized')
          .withArgs(gateway, entryPoint, accountImplementation);
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

        it('expect to revert when the contract is initialized', async () => {
          const { accountRegistry } = fixture;

          await expect(
            accountRegistry.initialize(ZeroAddress, ZeroAddress, ZeroAddress),
          ).revertedWithCustomError(accountRegistry, 'AlreadyInitialized');
        });
      });
    });
  });

  {
    let fixture: Awaited<ReturnType<typeof setupAccountRegistry>>;

    describe.skip('# external functions (getters)', () => {
      beforeEach(async () => {
        fixture = await loadFixture(setupAccountRegistry);
      });
    });

    describe.skip('# external functions (setters)', () => {
      beforeEach(async () => {
        fixture = await loadFixture(setupAccountRegistry);
      });
    });
  }
});
