import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployAccountRegistry, setupAccountRegistry } from './fixtures';
import { AccountStates } from './constants';

const { ZeroAddress, getContractAt } = ethers;

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

        it("expect to return true for the account with an 'unknown' state and an existing owner", async () => {
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

        it("expect to create the account with an 'unknown' state", async () => {
          const { accountRegistry, unknownAccountOwner, unknownAccount } =
            fixture;

          const tx = accountRegistry.forceAccountCreation(unknownAccountOwner);

          await expect(tx)
            .emit(accountRegistry, 'AccountOwnerAdded')
            .withArgs(unknownAccount, unknownAccountOwner.address);

          await expect(tx)
            .emit(accountRegistry, 'AccountCreated')
            .withArgs(unknownAccount);
        });

        it("expect to create the account with a 'defined' state", async () => {
          const { accountRegistry, definedAccountOwner, definedAccount } =
            fixture;

          const tx = accountRegistry.forceAccountCreation(definedAccountOwner);

          await expect(tx).not.emit(accountRegistry, 'AccountOwnerAdded');

          await expect(tx)
            .emit(accountRegistry, 'AccountCreated')
            .withArgs(definedAccount);
        });

        it('expect to omit an account creation when already created', async () => {
          const { accountRegistry, createdAccountOwner } = fixture;

          const tx = accountRegistry.forceAccountCreation(createdAccountOwner);

          await expect(tx).not.emit(accountRegistry, 'AccountOwnerAdded');

          await expect(tx).not.emit(accountRegistry, 'AccountCreated');
        });

        it('expect to return the account', async () => {
          const { accountRegistry, createdAccountOwner, createdAccount } =
            fixture;

          const res = await accountRegistry.forceAccountCreation.staticCall(
            createdAccountOwner,
          );

          expect(res).eq(createdAccount);
        });
      });

      describe('addAccountOwner()', () => {
        createBeforeHook();

        it('expect to revert when the account is the zero address', async () => {
          const { accountRegistry } = fixture;

          const tx = accountRegistry.addAccountOwner(ZeroAddress, ZeroAddress);

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'AccountIsTheZeroAddress',
          );
        });

        it('expect to revert when the owner is the zero address', async () => {
          const { accountRegistry, unknownAccount, unknownAccountOwner } =
            fixture;

          const tx = accountRegistry
            .connect(unknownAccountOwner)
            .addAccountOwner(unknownAccount, ZeroAddress);

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'AccountOwnerIsTheZeroAddress',
          );
        });

        it('expect to revert when the owner already exists', async () => {
          const { accountRegistry, unknownAccount, unknownAccountOwner } =
            fixture;

          const tx = accountRegistry
            .connect(unknownAccountOwner)
            .addAccountOwner(unknownAccount, unknownAccountOwner);

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'AccountOwnerAlreadyExists',
          );
        });

        it("expect to revert when the sender is not the owner of the account with an 'unknown' state", async () => {
          const { accountRegistry, unknownAccount } = fixture;

          const tx = accountRegistry.addAccountOwner(
            unknownAccount,
            ZeroAddress,
          );

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'MsgSenderIsNotTheAccountOwner',
          );
        });

        it('expect to revert when the sender is not the owner of the account with a defined state', async () => {
          const { accountRegistry, createdAccount } = fixture;

          const tx = accountRegistry.addAccountOwner(
            createdAccount,
            ZeroAddress,
          );

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'MsgSenderIsNotTheAccountOwner',
          );
        });

        it("expect to add an owner to the account with an 'unknown' state", async () => {
          const { accountRegistry, unknownAccount, unknownAccountOwner } =
            fixture;

          const owner = randomAddress();

          const tx = accountRegistry
            .connect(unknownAccountOwner)
            .addAccountOwner(unknownAccount, owner);

          await expect(tx)
            .emit(accountRegistry, 'AccountOwnerAdded')
            .withArgs(unknownAccount, unknownAccountOwner.address);

          await expect(tx)
            .emit(accountRegistry, 'AccountOwnerAdded')
            .withArgs(unknownAccount, owner);
        });

        it('expect to add an owner to the account with a defined state', async () => {
          const { accountRegistry, createdAccount, createdAccountOwner } =
            fixture;

          const owner = randomAddress();

          const tx = accountRegistry
            .connect(createdAccountOwner)
            .addAccountOwner(createdAccount, owner);

          await expect(tx)
            .emit(accountRegistry, 'AccountOwnerAdded')
            .withArgs(createdAccount, owner);
        });
      });

      describe('removeAccountOwner()', () => {
        const owner = randomAddress();

        createBeforeHook(async () => {
          const { accountRegistry, definedAccount, definedAccountOwner } =
            fixture;

          await accountRegistry
            .connect(definedAccountOwner)
            .addAccountOwner(definedAccount, owner);
        });

        it('expect to revert when the account is the zero address', async () => {
          const { accountRegistry } = fixture;

          const tx = accountRegistry.removeAccountOwner(
            ZeroAddress,
            ZeroAddress,
          );

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'AccountIsTheZeroAddress',
          );
        });

        it('expect to revert when the owner is the zero address', async () => {
          const { accountRegistry, createdAccount, createdAccountOwner } =
            fixture;

          const tx = accountRegistry
            .connect(createdAccountOwner)
            .removeAccountOwner(createdAccount, ZeroAddress);

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'AccountOwnerIsTheZeroAddress',
          );
        });

        it('expect to revert when the sender is the owner', async () => {
          const { accountRegistry, createdAccount } = fixture;

          const tx = accountRegistry.removeAccountOwner(
            createdAccount,
            ZeroAddress,
          );

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'MsgSenderIsNotTheAccountOwner',
          );
        });

        it("expect to revert when the owner doesn't exist", async () => {
          const { accountRegistry, createdAccount, createdAccountOwner } =
            fixture;

          const tx = accountRegistry
            .connect(createdAccountOwner)
            .removeAccountOwner(createdAccount, randomAddress());

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'AccountOwnerDoesntExist',
          );
        });

        it('expect to revert when there is only one owner', async () => {
          const { accountRegistry, createdAccount, createdAccountOwner } =
            fixture;

          const tx = accountRegistry
            .connect(createdAccountOwner)
            .removeAccountOwner(createdAccount, createdAccountOwner);

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'NotEnoughAccountOwners',
          );
        });

        it('expect to remove an existing owner', async () => {
          const { accountRegistry, definedAccount, definedAccountOwner } =
            fixture;

          const tx = accountRegistry
            .connect(definedAccountOwner)
            .removeAccountOwner(definedAccount, owner);

          await expect(tx)
            .emit(accountRegistry, 'AccountOwnerRemoved')
            .withArgs(definedAccount, owner);
        });
      });

      describe('directAddAccountOwner()', () => {
        createBeforeHook();

        it('expect to revert when the sender is not the created account', async () => {
          const { accountRegistry } = fixture;

          const tx = accountRegistry.directAddAccountOwner(ZeroAddress);

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'MsgSenderIsNotTheAccount',
          );
        });

        it('expect to add an owner', async () => {
          const { accountRegistry, createdAccount, createdAccountOwner } =
            fixture;

          const owner = randomAddress();

          const account = await getContractAt(
            'AccountImpl',
            createdAccount,
            createdAccountOwner,
          );

          const tx = account.addOwner(owner);

          await expect(tx)
            .emit(accountRegistry, 'AccountOwnerAdded')
            .withArgs(createdAccount, owner);
        });
      });

      describe('directRemoveAccountOwner()', () => {
        const owner = randomAddress();

        createBeforeHook(async () => {
          const { accountRegistry, createdAccount, createdAccountOwner } =
            fixture;

          await accountRegistry
            .connect(createdAccountOwner)
            .addAccountOwner(createdAccount, owner);
        });

        it('expect to revert when the sender is not the created account', async () => {
          const { accountRegistry } = fixture;

          const tx = accountRegistry.directRemoveAccountOwner(ZeroAddress);

          await expect(tx).revertedWithCustomError(
            accountRegistry,
            'MsgSenderIsNotTheAccount',
          );
        });

        it('expect to add an owner', async () => {
          const { accountRegistry, createdAccount, createdAccountOwner } =
            fixture;

          const account = await getContractAt(
            'AccountImpl',
            createdAccount,
            createdAccountOwner,
          );

          const tx = account.removeOwner(owner);

          await expect(tx)
            .emit(accountRegistry, 'AccountOwnerRemoved')
            .withArgs(createdAccount, owner);
        });
      });
    });
  }
});
