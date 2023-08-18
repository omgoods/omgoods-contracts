import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, testing } from 'hardhat';
import { expect } from 'chai';
import { deployAccountRegistry, setupAccountRegistry } from './fixtures';
import { AccountStates } from './constants';

const { ZeroAddress, getContractAt } = ethers;

const { randomAddress } = testing;

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

    describe('getAccountImpl()', () => {
      it('expect to return account impl address', async () => {
        const { accountRegistry, accountImpl } = fixture;

        const res = await accountRegistry.getAccountImpl();

        expect(res).eq(await accountImpl.getAddress());
      });
    });

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
        const { accountRegistry, accounts } = fixture;

        const res = await accountRegistry.isAccountOwner(
          accounts.created.address,
          accounts.created.owner,
        );

        expect(res).true;
      });
    });

    describe('getAccountState()', () => {
      it('expect to return the correct account state', async () => {
        const { accountRegistry, accounts } = fixture;

        let res = await accountRegistry.getAccountState(randomAddress());

        expect(res).eq(AccountStates.Unknown);

        res = await accountRegistry.getAccountState(accounts.created.address);

        expect(res).eq(AccountStates.Created);

        res = await accountRegistry.getAccountState(accounts.defined.address);

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
        const { accountRegistry, accounts } = fixture;

        const tx = accountRegistry
          .connect(accounts.created.owner)
          .createAccount(accounts.created.address);

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
        const { accountRegistry, accounts } = fixture;

        const tx = accountRegistry.forceAccountCreation(accounts.unknown.owner);

        await expect(tx)
          .emit(accountRegistry, 'AccountOwnerAdded')
          .withArgs(accounts.unknown.address, accounts.unknown.owner.address);

        await expect(tx)
          .emit(accountRegistry, 'AccountCreated')
          .withArgs(accounts.unknown.address);
      });

      it("expect to create the account with a 'defined' state", async () => {
        const { accountRegistry, accounts } = fixture;

        const tx = accountRegistry.forceAccountCreation(accounts.defined.owner);

        await expect(tx).not.emit(accountRegistry, 'AccountOwnerAdded');

        await expect(tx)
          .emit(accountRegistry, 'AccountCreated')
          .withArgs(accounts.defined.address);
      });

      it('expect to omit an account creation when already created', async () => {
        const { accountRegistry, accounts } = fixture;

        const tx = accountRegistry.forceAccountCreation(accounts.created.owner);

        await expect(tx).not.emit(accountRegistry, 'AccountOwnerAdded');

        await expect(tx).not.emit(accountRegistry, 'AccountCreated');
      });

      it('expect to return the account', async () => {
        const { accountRegistry, accounts } = fixture;

        const res = await accountRegistry.forceAccountCreation.staticCall(
          accounts.created.owner,
        );

        expect(res).eq(accounts.created.address);
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
        const { accountRegistry, accounts } = fixture;

        const tx = accountRegistry
          .connect(accounts.unknown.owner)
          .addAccountOwner(accounts.unknown.address, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'AccountOwnerIsTheZeroAddress',
        );
      });

      it('expect to revert when the owner already exists', async () => {
        const { accountRegistry, accounts } = fixture;

        const tx = accountRegistry
          .connect(accounts.unknown.owner)
          .addAccountOwner(accounts.unknown.address, accounts.unknown.owner);

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'AccountOwnerAlreadyExists',
        );
      });

      it("expect to revert when the sender is not the owner of the account with an 'unknown' state", async () => {
        const { accountRegistry, accounts } = fixture;

        const tx = accountRegistry.addAccountOwner(
          accounts.unknown.address,
          ZeroAddress,
        );

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'MsgSenderIsNotTheAccountOwner',
        );
      });

      it('expect to revert when the sender is not the owner of the account with a defined state', async () => {
        const { accountRegistry, accounts } = fixture;

        const tx = accountRegistry.addAccountOwner(
          accounts.created.address,
          ZeroAddress,
        );

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'MsgSenderIsNotTheAccountOwner',
        );
      });

      it("expect to add an owner to the account with an 'unknown' state", async () => {
        const { accountRegistry, accounts } = fixture;

        const owner = randomAddress();

        const tx = accountRegistry
          .connect(accounts.unknown.owner)
          .addAccountOwner(accounts.unknown.address, owner);

        await expect(tx)
          .emit(accountRegistry, 'AccountOwnerAdded')
          .withArgs(accounts.unknown.address, accounts.unknown.owner.address);

        await expect(tx)
          .emit(accountRegistry, 'AccountOwnerAdded')
          .withArgs(accounts.unknown.address, owner);
      });

      it('expect to add an owner to the account with a defined state', async () => {
        const { accountRegistry, accounts } = fixture;

        const owner = randomAddress();

        const tx = accountRegistry
          .connect(accounts.created.owner)
          .addAccountOwner(accounts.created.address, owner);

        await expect(tx)
          .emit(accountRegistry, 'AccountOwnerAdded')
          .withArgs(accounts.created.address, owner);
      });
    });

    describe('removeAccountOwner()', () => {
      const owner = randomAddress();

      createBeforeHook(async () => {
        const { accountRegistry, accounts } = fixture;

        await accountRegistry
          .connect(accounts.defined.owner)
          .addAccountOwner(accounts.defined.address, owner);
      });

      it('expect to revert when the account is the zero address', async () => {
        const { accountRegistry } = fixture;

        const tx = accountRegistry.removeAccountOwner(ZeroAddress, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'AccountIsTheZeroAddress',
        );
      });

      it('expect to revert when the owner is the zero address', async () => {
        const { accountRegistry, accounts } = fixture;

        const tx = accountRegistry
          .connect(accounts.created.owner)
          .removeAccountOwner(accounts.created.address, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'AccountOwnerIsTheZeroAddress',
        );
      });

      it('expect to revert when the sender is the owner', async () => {
        const { accountRegistry, accounts } = fixture;

        const tx = accountRegistry.removeAccountOwner(
          accounts.created.address,
          ZeroAddress,
        );

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'MsgSenderIsNotTheAccountOwner',
        );
      });

      it("expect to revert when the owner doesn't exist", async () => {
        const { accountRegistry, accounts } = fixture;

        const tx = accountRegistry
          .connect(accounts.created.owner)
          .removeAccountOwner(accounts.created.address, randomAddress());

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'AccountOwnerDoesntExist',
        );
      });

      it('expect to revert when there is only one owner', async () => {
        const { accountRegistry, accounts } = fixture;

        const tx = accountRegistry
          .connect(accounts.created.owner)
          .removeAccountOwner(accounts.created.address, accounts.created.owner);

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'NotEnoughAccountOwners',
        );
      });

      it('expect to remove an existing owner', async () => {
        const { accountRegistry, accounts } = fixture;

        const tx = accountRegistry
          .connect(accounts.defined.owner)
          .removeAccountOwner(accounts.defined.address, owner);

        await expect(tx)
          .emit(accountRegistry, 'AccountOwnerRemoved')
          .withArgs(accounts.defined.address, owner);
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
        const { accountRegistry, accounts } = fixture;

        const owner = randomAddress();

        const account = await getContractAt(
          'AccountImpl',
          accounts.created.address,
          accounts.created.owner,
        );

        const tx = account.addOwner(owner);

        await expect(tx)
          .emit(accountRegistry, 'AccountOwnerAdded')
          .withArgs(accounts.created.address, owner);
      });
    });

    describe('directRemoveAccountOwner()', () => {
      const owner = randomAddress();

      createBeforeHook(async () => {
        const { accountRegistry, accounts } = fixture;

        await accountRegistry
          .connect(accounts.created.owner)
          .addAccountOwner(accounts.created.address, owner);
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
        const { accountRegistry, accounts } = fixture;

        const account = await getContractAt(
          'AccountImpl',
          accounts.created.address,
          accounts.created.owner,
        );

        const tx = account.removeOwner(owner);

        await expect(tx)
          .emit(accountRegistry, 'AccountOwnerRemoved')
          .withArgs(accounts.created.address, owner);
      });
    });

    describe('executeAccountTransaction()', () => {
      createBeforeHook();

      it('expect to revert when the account is the zero address', async () => {
        const { accountRegistry } = fixture;

        const tx = accountRegistry.executeAccountTransaction(
          ZeroAddress,
          ZeroAddress,
          0,
          '0x',
        );

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'AccountIsTheZeroAddress',
        );
      });

      it('expect to revert when the sender is not the account owner', async () => {
        const { accountRegistry } = fixture;

        const tx = accountRegistry.executeAccountTransaction(
          randomAddress(),
          ZeroAddress,
          0,
          '0x',
        );

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'MsgSenderIsNotTheAccountOwner',
        );
      });

      it("expect to execute a transaction from the account with an 'unknown' state", async () => {
        const { accountRegistry, accountImpl, accounts } = fixture;

        const to = randomAddress();
        const value = 0;
        const data = '0x';

        const tx = accountRegistry
          .connect(accounts.unknown.owner)
          .executeAccountTransaction(accounts.unknown.address, to, value, data);

        await expect(tx)
          .emit(accountRegistry, 'AccountOwnerAdded')
          .withArgs(accounts.unknown.address, accounts.unknown.owner.address);

        await expect(tx)
          .emit(accountRegistry, 'AccountCreated')
          .withArgs(accounts.unknown.address);

        await expect(tx)
          .emit(accountRegistry, 'AccountTransactionExecuted')
          .withArgs(accounts.unknown.address, to, value, data);

        await expect(tx)
          .emit(
            accountImpl.attach(accounts.unknown.address),
            'TransactionExecuted',
          )
          .withArgs(to, value, data);
      });

      it("expect to execute a transaction from the account with a 'defined' state", async () => {
        const { accountRegistry, accountImpl, accounts } = fixture;

        const to = randomAddress();
        const value = 0;
        const data = '0x';

        const tx = accountRegistry
          .connect(accounts.defined.owner)
          .executeAccountTransaction(accounts.defined.address, to, value, data);

        await expect(tx).not.emit(accountRegistry, 'AccountOwnerAdded');

        await expect(tx)
          .emit(accountRegistry, 'AccountCreated')
          .withArgs(accounts.defined.address);

        await expect(tx)
          .emit(accountRegistry, 'AccountTransactionExecuted')
          .withArgs(accounts.defined.address, to, value, data);

        await expect(tx)
          .emit(
            accountImpl.attach(accounts.defined.address),
            'TransactionExecuted',
          )
          .withArgs(to, value, data);
      });

      it("expect to execute a transaction from the account with a 'created' state", async () => {
        const { accountRegistry, accountImpl, accounts } = fixture;

        const to = randomAddress();
        const value = 0;
        const data = '0x';

        const tx = accountRegistry
          .connect(accounts.created.owner)
          .executeAccountTransaction(accounts.created.address, to, value, data);

        await expect(tx).not.emit(accountRegistry, 'AccountOwnerAdded');

        await expect(tx).not.emit(accountRegistry, 'AccountCreated');

        await expect(tx)
          .emit(accountRegistry, 'AccountTransactionExecuted')
          .withArgs(accounts.created.address, to, value, data);

        await expect(tx)
          .emit(
            accountImpl.attach(accounts.created.address),
            'TransactionExecuted',
          )
          .withArgs(to, value, data);
      });
    });

    describe('executeAccountTransactions()', () => {
      createBeforeHook();

      it('expect to revert when the account is the zero address', async () => {
        const { accountRegistry } = fixture;

        const tx = accountRegistry.executeAccountTransactions(
          ZeroAddress,
          [],
          [],
          [],
        );

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'AccountIsTheZeroAddress',
        );
      });

      it('expect to revert when the sender is not the account owner', async () => {
        const { accountRegistry } = fixture;

        const tx = accountRegistry.executeAccountTransactions(
          randomAddress(),
          [],
          [],
          [],
        );

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'MsgSenderIsNotTheAccountOwner',
        );
      });

      it("expect to execute transactions from the account with an 'unknown' state", async () => {
        const { accountRegistry, accountImpl, accounts } = fixture;

        const to = [randomAddress()];
        const value = [0];
        const data = ['0x'];

        const tx = accountRegistry
          .connect(accounts.unknown.owner)
          .executeAccountTransactions(
            accounts.unknown.address,
            to,
            value,
            data,
          );

        await expect(tx)
          .emit(accountRegistry, 'AccountOwnerAdded')
          .withArgs(accounts.unknown.address, accounts.unknown.owner.address);

        await expect(tx)
          .emit(accountRegistry, 'AccountCreated')
          .withArgs(accounts.unknown.address);

        await expect(tx)
          .emit(accountRegistry, 'AccountTransactionsExecuted')
          .withArgs(accounts.unknown.address, to, value, data);

        await expect(tx)
          .emit(
            accountImpl.attach(accounts.unknown.address),
            'TransactionsExecuted',
          )
          .withArgs(to, value, data);
      });

      it("expect to execute transactions from the account with a 'defined' state", async () => {
        const { accountRegistry, accountImpl, accounts } = fixture;

        const to = [randomAddress()];
        const value = [0];
        const data = ['0x'];

        const tx = accountRegistry
          .connect(accounts.defined.owner)
          .executeAccountTransactions(
            accounts.defined.address,
            to,
            value,
            data,
          );

        await expect(tx).not.emit(accountRegistry, 'AccountOwnerAdded');

        await expect(tx)
          .emit(accountRegistry, 'AccountCreated')
          .withArgs(accounts.defined.address);

        await expect(tx)
          .emit(accountRegistry, 'AccountTransactionsExecuted')
          .withArgs(accounts.defined.address, to, value, data);

        await expect(tx)
          .emit(
            accountImpl.attach(accounts.defined.address),
            'TransactionsExecuted',
          )
          .withArgs(to, value, data);
      });

      it("expect to execute transactions from the account with a 'created' state", async () => {
        const { accountRegistry, accountImpl, accounts } = fixture;

        const to = [randomAddress()];
        const value = [0];
        const data = ['0x'];

        const tx = accountRegistry
          .connect(accounts.created.owner)
          .executeAccountTransactions(
            accounts.created.address,
            to,
            value,
            data,
          );

        await expect(tx).not.emit(accountRegistry, 'AccountOwnerAdded');

        await expect(tx).not.emit(accountRegistry, 'AccountCreated');

        await expect(tx)
          .emit(accountRegistry, 'AccountTransactionsExecuted')
          .withArgs(accounts.created.address, to, value, data);

        await expect(tx)
          .emit(
            accountImpl.attach(accounts.created.address),
            'TransactionsExecuted',
          )
          .withArgs(to, value, data);
      });
    });

    describe('emitAccountTransactionExecuted()', () => {
      createBeforeHook();

      it('expect to revert when the sender is not the account', async () => {
        const { accountRegistry } = fixture;

        const tx = accountRegistry.emitAccountTransactionExecuted(
          randomAddress(),
          0,
          '0x',
        );

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'MsgSenderIsNotTheAccount',
        );
      });

      it('expect to emit event when the sender is the account', async () => {
        const { accountRegistry, accounts } = fixture;

        const account = await getContractAt(
          'AccountImpl',
          accounts.created.address,
          accounts.created.owner,
        );

        const to = randomAddress();
        const value = 0;
        const data = '0x';

        const tx = account.executeTransaction(to, value, data);

        await expect(tx)
          .emit(accountRegistry, 'AccountTransactionExecuted')
          .withArgs(accounts.created.address, to, value, data);
      });
    });

    describe('emitAccountTransactionsExecuted()', () => {
      createBeforeHook();

      it('expect to revert when the sender is not the account', async () => {
        const { accountRegistry } = fixture;

        const tx = accountRegistry.emitAccountTransactionsExecuted([], [], []);

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'MsgSenderIsNotTheAccount',
        );
      });

      it('expect to emit event when the sender is the account', async () => {
        const { accountRegistry, accounts } = fixture;

        const account = await getContractAt(
          'AccountImpl',
          accounts.created.address,
          accounts.created.owner,
        );

        const to = [randomAddress()];
        const value = [0];
        const data = ['0x'];

        const tx = account.executeTransactions(to, value, data);

        await expect(tx)
          .emit(accountRegistry, 'AccountTransactionsExecuted')
          .withArgs(accounts.created.address, to, value, data);
      });
    });
  });
});
