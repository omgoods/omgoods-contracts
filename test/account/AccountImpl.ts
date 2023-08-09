import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployAccountImpl, setupAccountImpl } from './fixtures';
import { EMPTY_USER_OP } from './constants';

const { getSigners, ZeroAddress, hashMessage, randomBytes, concat } = ethers;

const { randomAddress } = helpers;

describe('account/AccountImpl', () => {
  let saltOwner: HardhatEthersSigner;
  let gateway: HardhatEthersSigner;
  let entryPoint: HardhatEthersSigner;
  let signers: HardhatEthersSigner[];

  before(async () => {
    [saltOwner, gateway, entryPoint, ...signers] = await getSigners();
  });

  describe('# deployment functions', () => {
    let fixture: Awaited<ReturnType<typeof deployAccountImpl>>;

    before(async () => {
      fixture = await loadFixture(deployAccountImpl);
    });

    describe('initialize()', () => {
      it('expect to revert', async () => {
        const { accountImpl } = fixture;

        await expect(
          accountImpl.initialize(ZeroAddress, ZeroAddress),
        ).revertedWithCustomError(accountImpl, 'AlreadyInitialized');
      });
    });
  });

  {
    let fixture: Awaited<ReturnType<typeof setupAccountImpl>>;

    const createBeforeHook = (inner?: () => Promise<void>) => {
      before(async () => {
        fixture = await loadFixture(setupAccountImpl);

        if (inner) {
          await inner();
        }
      });
    };

    describe('# wildcard functions', () => {
      createBeforeHook();

      describe('receive()', () => {
        it('expect to receive the funds', async () => {
          const { accountImpl } = fixture;

          const sender = signers[0];
          const value = 5;

          await expect(
            accountImpl.connect(sender).fallback({
              value,
            }),
          ).changeEtherBalances([sender, accountImpl], [-value, value]);
        });
      });
    });

    describe('# external functions (getters)', () => {
      createBeforeHook();

      describe('isValidSignature()', () => {
        const message = randomBytes(32);
        const hash = hashMessage(message);

        it('expect to return the method selector on a valid signature', async () => {
          const { accountImpl } = fixture;

          expect(
            await accountImpl.isValidSignature(
              hash,
              await saltOwner.signMessage(message),
            ),
          ).eq(accountImpl.interface.getFunction('isValidSignature').selector);
        });

        it('expect to return 0xffffffff on an invalid signature', async () => {
          const { accountImpl } = fixture;

          expect(
            await accountImpl.isValidSignature(
              hash,
              await signers[0].signMessage(message),
            ),
          ).eq('0xffffffff');
        });
      });

      describe('hasOwner()', () => {
        it('expect to return true when an owner exists', async () => {
          const { accountImpl } = fixture;

          expect(await accountImpl.hasOwner(saltOwner)).true;
        });

        it("expect to return false when an owner doesn't exist", async () => {
          const { accountImpl } = fixture;

          expect(await accountImpl.hasOwner(randomAddress())).false;
        });
      });
    });

    describe('# external functions (setters)', () => {
      describe('validateUserOp()', () => {
        createBeforeHook(async () => {
          const { accountImpl } = fixture;

          await accountImpl.fallback({
            value: 10_000,
          });
        });

        const userOpHash = randomBytes(32);

        it('expect to revert when msg.sender is not the entry point', async () => {
          const { accountImpl } = fixture;

          await expect(
            accountImpl.validateUserOp(EMPTY_USER_OP, userOpHash, 0),
          ).revertedWithCustomError(accountImpl, 'MsgSenderIsNotTheEntryPoint');
        });

        it('expect to return 0 when the user op hash signer is an owner', async () => {
          const { accountImpl } = fixture;

          expect(
            await accountImpl.connect(entryPoint).validateUserOp.staticCall(
              {
                ...EMPTY_USER_OP,
                signature: await saltOwner.signMessage(userOpHash),
              },
              userOpHash,
              0,
            ),
          ).eq(0);
        });

        it('expect to return 1 when the user op hash signer is not an owner', async () => {
          const { accountImpl } = fixture;

          expect(
            await accountImpl.connect(entryPoint).validateUserOp.staticCall(
              {
                ...EMPTY_USER_OP,
                signature: await signers[0].signMessage(userOpHash),
              },
              userOpHash,
              0,
            ),
          ).eq(1);
        });

        it('expect to transfer the missing funds even if the user op hash signer is not an owner', async () => {
          const { accountImpl, accountRegistry } = fixture;

          const missingFunds = 1000;

          const tx = accountImpl.connect(entryPoint).validateUserOp(
            {
              ...EMPTY_USER_OP,
              signature: await signers[0].signMessage(userOpHash),
            },
            userOpHash,
            missingFunds,
          );

          await expect(tx).changeEtherBalances(
            [entryPoint, accountImpl],
            [missingFunds, -missingFunds],
          );

          await expect(tx)
            .emit(accountRegistry, 'AccountTransactionExecuted')
            .withArgs(
              await accountImpl.getAddress(),
              entryPoint.address,
              missingFunds,
              '0x',
            );
        });
      });

      describe('addOwner()', () => {
        createBeforeHook();

        it('expect to revert when msg.sender is not the owner', async () => {
          const { accountImpl } = fixture;

          await expect(
            accountImpl.connect(signers[0]).addOwner(ZeroAddress),
          ).revertedWithCustomError(
            accountImpl,
            'MsgSenderIsNotTheAccountOwner',
          );
        });

        it('expect to add a new owner', async () => {
          const { accountImpl, accountRegistry } = fixture;

          const owner = randomAddress();

          const tx = accountImpl.addOwner(owner);

          await expect(tx).emit(accountImpl, 'OwnerAdded').withArgs(owner);

          await expect(tx)
            .emit(accountRegistry, 'AccountOwnerAdded')
            .withArgs(await accountImpl.getAddress(), owner);
        });
      });

      describe('removeOwner()', () => {
        const owner = randomAddress();

        createBeforeHook(async () => {
          const { accountImpl } = fixture;

          await accountImpl.addOwner(owner);
        });

        it('expect to revert when msg.sender is not the owner', async () => {
          const { accountImpl } = fixture;

          await expect(
            accountImpl.connect(signers[0]).removeOwner(ZeroAddress),
          ).revertedWithCustomError(
            accountImpl,
            'MsgSenderIsNotTheAccountOwner',
          );
        });

        it('expect to remove an owner', async () => {
          const { accountImpl, accountRegistry } = fixture;

          const tx = accountImpl.removeOwner(owner);

          await expect(tx).emit(accountImpl, 'OwnerRemoved').withArgs(owner);

          await expect(tx)
            .emit(accountRegistry, 'AccountOwnerRemoved')
            .withArgs(await accountImpl.getAddress(), owner);
        });
      });

      describe('executeTransaction()', () => {
        createBeforeHook(async () => {
          const { accountImpl } = fixture;

          await accountImpl.fallback({
            value: 10_000,
          });
        });

        it('expect to revert when msg.sender is not the owner', async () => {
          const { accountImpl } = fixture;

          await expect(
            accountImpl
              .connect(signers[0])
              .executeTransaction(ZeroAddress, 0, '0x'),
          ).revertedWithCustomError(
            accountImpl,
            'MsgSenderIsNotTheAccountOwner',
          );
        });

        it('expect to revert when transferred to the zero address', async () => {
          const { accountImpl } = fixture;

          await expect(
            accountImpl.executeTransaction(ZeroAddress, 0, '0x'),
          ).revertedWithCustomError(accountImpl, 'TransactionToTheZeroAddress');
        });

        it('expect to revert when the transaction fails', async () => {
          const { accountImpl, accountRegistry } = fixture;

          await expect(
            accountImpl.executeTransaction(
              accountRegistry,
              0,
              accountRegistry.interface.encodeFunctionData('initialize', [
                ZeroAddress,
                ZeroAddress,
                ZeroAddress,
              ]),
            ),
          ).revertedWithCustomError(
            accountRegistry,
            'MsgSenderIsNotTheContractOwner',
          );
        });

        it('expect to execute the transaction', async () => {
          const { accountImpl, accountRegistry } = fixture;

          const to = randomAddress();
          const value = 1000;
          const data = '0x';

          const tx = accountImpl.executeTransaction(to, value, data);

          await expect(tx)
            .emit(accountImpl, 'TransactionExecuted')
            .withArgs(to, value, data);

          await expect(tx)
            .emit(accountRegistry, 'AccountTransactionExecuted')
            .withArgs(await accountImpl.getAddress(), to, value, data);
        });

        it('expect to execute the transaction by the account registry', async () => {
          const { accountImpl, accountRegistry } = fixture;

          const to = randomAddress();
          const value = 1000;
          const data = '0x';

          const tx = gateway.sendTransaction({
            to: accountImpl,
            data: concat([
              accountImpl.interface.encodeFunctionData('executeTransaction', [
                to,
                value,
                data,
              ]),
              await accountRegistry.getAddress(),
            ]),
          });

          await expect(tx)
            .emit(accountImpl, 'TransactionExecuted')
            .withArgs(to, value, data);

          await expect(tx).not.emit(
            accountRegistry,
            'AccountTransactionExecuted',
          );
        });
      });
    });
  }
});
