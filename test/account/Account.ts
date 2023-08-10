import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployAccountMock, setupAccountMock } from './fixtures';

const { getSigners, ZeroAddress, concat } = ethers;

const { randomAddress } = helpers;

describe('account/Account // using mock', () => {
  let owner: HardhatEthersSigner;
  let gateway: HardhatEthersSigner;
  let signers: HardhatEthersSigner[];

  before(async () => {
    [owner, gateway, , ...signers] = await getSigners();
  });

  describe('# deployment functions', () => {
    let fixture: Awaited<ReturnType<typeof deployAccountMock>>;

    before(async () => {
      fixture = await loadFixture(deployAccountMock);
    });

    describe('initialize() // mocked', () => {
      it('expect to initialize the contract', async () => {
        const { accountMock } = fixture;

        const gateway = randomAddress();
        const entryPoint = randomAddress();
        const accountRegistry = randomAddress();

        const tx = await accountMock.initialize(
          gateway,
          entryPoint,
          accountRegistry,
        );

        await expect(tx)
          .emit(accountMock, 'Initialized')
          .withArgs(gateway, entryPoint, accountRegistry);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { accountMock } = fixture;

          if (!(await accountMock.initialized())) {
            await accountMock.initialize(ZeroAddress, ZeroAddress, ZeroAddress);
          }
        });

        it('expect to revert', async () => {
          const { accountMock } = fixture;

          await expect(
            accountMock.initialize(ZeroAddress, ZeroAddress, ZeroAddress),
          ).revertedWithCustomError(accountMock, 'AlreadyInitialized');
        });
      });
    });
  });

  {
    let fixture: Awaited<ReturnType<typeof setupAccountMock>>;

    const createBeforeHook = (inner?: () => Promise<void>) => {
      before(async () => {
        fixture = await loadFixture(setupAccountMock);

        if (inner) {
          await inner();
        }
      });
    };

    describe('# wildcard functions', () => {
      createBeforeHook();

      describe('receive()', () => {
        it('expect to receive the funds', async () => {
          const { accountMock } = fixture;

          const sender = signers[0];
          const value = 5;

          await expect(
            accountMock.connect(sender).fallback({
              value,
            }),
          ).changeEtherBalances([sender, accountMock], [-value, value]);
        });
      });
    });

    describe('# external functions (getters)', () => {
      createBeforeHook();

      describe('hasOwner()', () => {
        it('expect to return true when an owner exists', async () => {
          const { accountMock } = fixture;

          expect(await accountMock.hasOwner(owner)).true;
        });

        it("expect to return false when an owner doesn't exist", async () => {
          const { accountMock } = fixture;

          expect(await accountMock.hasOwner(randomAddress())).false;
        });
      });
    });

    describe('# external functions (setters)', () => {
      describe('addOwner()', () => {
        createBeforeHook();

        it('expect to revert when msg.sender is not the owner', async () => {
          const { accountMock } = fixture;

          await expect(
            accountMock.connect(signers[0]).addOwner(ZeroAddress),
          ).revertedWithCustomError(
            accountMock,
            'MsgSenderIsNotTheAccountOwner',
          );
        });

        it('expect to add a new owner', async () => {
          const { accountMock, accountRegistryMock } = fixture;

          const owner = randomAddress();

          const tx = accountMock.addOwner(owner);

          await expect(tx).emit(accountMock, 'OwnerAdded').withArgs(owner);

          await expect(tx)
            .emit(accountRegistryMock, 'AccountOwnerAdded')
            .withArgs(await accountMock.getAddress(), owner);
        });
      });

      describe('removeOwner()', () => {
        const owner = randomAddress();

        createBeforeHook(async () => {
          const { accountMock } = fixture;

          await accountMock.addOwner(owner);
        });

        it('expect to revert when msg.sender is not the owner', async () => {
          const { accountMock } = fixture;

          await expect(
            accountMock.connect(signers[0]).removeOwner(ZeroAddress),
          ).revertedWithCustomError(
            accountMock,
            'MsgSenderIsNotTheAccountOwner',
          );
        });

        it('expect to remove an owner', async () => {
          const { accountMock, accountRegistryMock } = fixture;

          const tx = accountMock.removeOwner(owner);

          await expect(tx).emit(accountMock, 'OwnerRemoved').withArgs(owner);

          await expect(tx)
            .emit(accountRegistryMock, 'AccountOwnerRemoved')
            .withArgs(await accountMock.getAddress(), owner);
        });
      });

      describe('executeTransaction()', () => {
        createBeforeHook();

        it('expect to revert when the msg.sender is not the owner', async () => {
          const { accountMock } = fixture;

          await expect(
            accountMock
              .connect(signers[0])
              .executeTransaction(ZeroAddress, 0, '0x'),
          ).revertedWithCustomError(
            accountMock,
            'MsgSenderIsNotTheAccountOwner',
          );
        });

        it('expect to revert when transferred to the zero address', async () => {
          const { accountMock } = fixture;

          await expect(
            accountMock.executeTransaction(ZeroAddress, 0, '0x'),
          ).revertedWithCustomError(accountMock, 'TransactionToTheZeroAddress');
        });

        it('expect to revert when transferred to an invalid address', async () => {
          const { accountMock, accountRegistryMock } = fixture;

          await expect(
            accountMock.executeTransaction(accountRegistryMock, 0, '0x'),
          ).revertedWithCustomError(accountMock, 'TransactionToInvalidAddress');
        });

        it('expect to revert when the transaction fails', async () => {
          const { accountMock } = fixture;

          await expect(
            accountMock.executeTransaction(
              accountMock,
              0,
              accountMock.interface.encodeFunctionData('initialize', [
                ZeroAddress,
                ZeroAddress,
                ZeroAddress,
              ]),
            ),
          ).revertedWithCustomError(accountMock, 'AlreadyInitialized');
        });

        it('expect the transaction to be executed', async () => {
          const { accountMock, accountRegistryMock } = fixture;

          const to = randomAddress();
          const value = 1000;
          const data = '0x';

          const tx = accountMock.executeTransaction(to, value, data);

          await expect(tx)
            .emit(accountMock, 'TransactionExecuted')
            .withArgs(to, value, data);

          await expect(tx)
            .emit(accountRegistryMock, 'AccountTransactionExecuted')
            .withArgs(await accountMock.getAddress(), to, value, data);
        });

        it('expect to execute the transaction by the account registry', async () => {
          const { accountMock, accountRegistryMock } = fixture;

          const to = randomAddress();
          const value = 1000;
          const data = '0x';

          const tx = gateway.sendTransaction({
            to: accountMock,
            data: concat([
              accountMock.interface.encodeFunctionData('executeTransaction', [
                to,
                value,
                data,
              ]),
              await accountRegistryMock.getAddress(),
            ]),
          });

          await expect(tx)
            .emit(accountMock, 'TransactionExecuted')
            .withArgs(to, value, data);

          await expect(tx).not.emit(
            accountRegistryMock,
            'AccountTransactionExecuted',
          );
        });
      });

      describe('executeTransactions()', () => {
        createBeforeHook();

        it('expect to revert when the msg.sender is not the owner', async () => {
          const { accountMock } = fixture;

          await expect(
            accountMock.connect(signers[0]).executeTransactions([], [], []),
          ).revertedWithCustomError(
            accountMock,
            'MsgSenderIsNotTheAccountOwner',
          );
        });

        it('expect to revert when the transaction batch is empty', async () => {
          const { accountMock } = fixture;

          await expect(
            accountMock.executeTransactions([], [], []),
          ).revertedWithCustomError(accountMock, 'EmptyTransactionBatch');
        });

        it('expect to revert when the transaction batch size is invalid', async () => {
          const { accountMock } = fixture;

          await expect(
            accountMock.executeTransactions([ZeroAddress], [], []),
          ).revertedWithCustomError(accountMock, 'InvalidTransactionBatchSize');

          await expect(
            accountMock.executeTransactions([ZeroAddress], [ZeroAddress], []),
          ).revertedWithCustomError(accountMock, 'InvalidTransactionBatchSize');
        });

        it('expect the transactions to be executed', async () => {
          const { accountMock, accountRegistryMock } = fixture;

          const to = [randomAddress()];
          const value = [1000];
          const data = ['0x'];

          const tx = accountMock.executeTransactions(to, value, data);

          await expect(tx)
            .emit(accountMock, 'TransactionsExecuted')
            .withArgs(to, value, data);

          await expect(tx)
            .emit(accountRegistryMock, 'AccountTransactionsExecuted')
            .withArgs(await accountMock.getAddress(), to, value, data);
        });

        it('expect to execute the transactions by the account registry', async () => {
          const { accountMock, accountRegistryMock } = fixture;

          const to = [randomAddress()];
          const value = [1000];
          const data = ['0x'];

          const tx = gateway.sendTransaction({
            to: accountMock,
            data: concat([
              accountMock.interface.encodeFunctionData('executeTransactions', [
                to,
                value,
                data,
              ]),
              await accountRegistryMock.getAddress(),
            ]),
          });

          await expect(tx)
            .emit(accountMock, 'TransactionsExecuted')
            .withArgs(to, value, data);

          await expect(tx).not.emit(
            accountRegistryMock,
            'AccountTransactionsExecuted',
          );
        });
      });
    });
  }
});
