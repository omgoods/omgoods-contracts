import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployAccountRegistry, setupAccountRegistry } from './fixtures';
import { AccountStates } from './constants';

const { ZeroAddress } = ethers;

const { randomAddress } = helpers;

describe('account/AccountRegistry', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployAccountRegistry>>;

    before(async () => {
      fixture = await loadFixture(deployAccountRegistry);
    });

    describe('initialize()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { accountRegistry, signers } = fixture;

        const tx = accountRegistry
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress, ZeroAddress, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the account implementation is the zero address', async () => {
        const { accountRegistry } = fixture;

        const tx = accountRegistry.initialize(
          ZeroAddress,
          ZeroAddress,
          ZeroAddress,
        );

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'AccountImplIsTheZeroAddress',
        );
      });

      it('expect to initialize the contract', async () => {
        const { accountRegistry } = fixture;

        const gateway = randomAddress();
        const entryPoint = randomAddress();
        const accountImpl = randomAddress();

        const tx = accountRegistry.initialize(gateway, entryPoint, accountImpl);

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

          const tx = accountRegistry.initialize(
            ZeroAddress,
            ZeroAddress,
            ZeroAddress,
          );

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'AlreadyInitialized',
          );
        });
      });
    });
  });

  {
    let fixture: Awaited<ReturnType<typeof setupAccountRegistry>>;

    const createBeforeHook = (inner?: () => Promise<void>) => {
      before(async () => {
        fixture = await loadFixture(setupAccountRegistry);

        if (inner) {
          await inner();
        }
      });
    };

    describe('# getters', () => {
      createBeforeHook();

      describe('computeAccount()', () => {
        it('expect to compute a correct account address', async () => {
          const { accountRegistry, computeAccountAddress } = fixture;

          const saltOwner = randomAddress();

          const res = await accountRegistry.computeAccount(saltOwner);

          expect(res).eq(computeAccountAddress(saltOwner));
        });

        it('expect to return the zero address for a zero address salt owner', async () => {
          const { accountRegistry } = fixture;

          const res = await accountRegistry.computeAccount(ZeroAddress);

          expect(res).eq(ZeroAddress);
        });
      });

      describe('isAccountOwner()', () => {
        it('expect to return false for the zero address account', async () => {
          const { accountRegistry } = fixture;

          const res = await accountRegistry.isAccountOwner(
            ZeroAddress,
            randomAddress(),
          );

          expect(res).false;
        });

        it('expect to return false for the zero address owner', async () => {
          const { accountRegistry } = fixture;

          const res = await accountRegistry.isAccountOwner(
            randomAddress(),
            ZeroAddress,
          );

          expect(res).false;
        });

        it('expect to return false for a not existing account owner', async () => {
          const { accountRegistry } = fixture;

          const res = await accountRegistry.isAccountOwner(
            randomAddress(),
            randomAddress(),
          );

          expect(res).false;
        });

        it('expect to return true for the account with an unknown state and an existing owner', async () => {
          const { accountRegistry, computeAccountAddress } = fixture;

          const owner = randomAddress();
          const account = computeAccountAddress(owner);

          const res = await accountRegistry.isAccountOwner(account, owner);

          expect(res).true;
        });

        it('expect to return true for the account with a known state and an existing owner', async () => {
          const { accountRegistry, definedAccount, definedAccountOwner } =
            fixture;

          const res = await accountRegistry.isAccountOwner(
            definedAccount,
            definedAccountOwner,
          );

          expect(res).true;
        });
      });

      describe('getAccountState()', () => {
        it('expect to return the correct account state', async () => {
          const { accountRegistry, createdAccount, definedAccount } = fixture;

          let res = await accountRegistry.getAccountState(randomAddress());

          expect(res).eq(AccountStates.Unknown);

          res = await accountRegistry.getAccountState(createdAccount);

          expect(res).eq(AccountStates.Created);

          res = await accountRegistry.getAccountState(definedAccount);

          expect(res).eq(AccountStates.Defined);
        });
      });
    });

    describe('# setters', () => {
      describe('createAccount()', () => {
        createBeforeHook();

        it('expect to revert when the account is the zero address', async () => {
          const { accountRegistry } = fixture;

          const tx = accountRegistry.createAccount(ZeroAddress);

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'AccountIsTheZeroAddress',
          );
        });

        it('expect to revert when the msg.sender is not the account owner', async () => {
          const { accountRegistry, computeAccountAddress, signers } = fixture;

          const tx = accountRegistry.createAccount(
            computeAccountAddress(signers.unknown.at(0).address),
          );

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'MsgSenderIsNotTheAccountOwner',
          );
        });

        it('expect to revert when the account has already been created', async () => {
          const { accountRegistry, createdAccount, createdAccountOwner } =
            fixture;

          const tx = accountRegistry
            .connect(createdAccountOwner)
            .createAccount(createdAccount);

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'AccountAlreadyCreated',
          );
        });

        it('expect to create an account', async () => {
          const { accountRegistry, computeAccountAddress, signers } = fixture;

          const owner = signers.unknown.at(1);
          const account = computeAccountAddress(owner.address);

          const tx = accountRegistry.connect(owner).createAccount(account);

          await expect(tx)
            .emit(accountRegistry, 'AccountCreated')
            .withArgs(account);
        });
      });

      describe('forceAccountCreation()', () => {
        createBeforeHook();

        it('expect to revert when the salt owner is the zero address', async () => {
          const { accountRegistry } = fixture;

          const tx = accountRegistry.forceAccountCreation(ZeroAddress);

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'SaltOwnerIsTheZeroAddress',
          );
        });
      });
    });
  }
});
