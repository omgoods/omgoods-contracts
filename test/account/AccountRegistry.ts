import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployAccountRegistry, setupAccountRegistry } from './fixtures';
import { AccountStates } from './constants';

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

    describe('# external functions (getters)', () => {
      let createdAccount: {
        address: string;
        owner: string;
      };

      let definedAccount: typeof createdAccount;

      createBeforeHook(async () => {
        const { accountRegistry, computeAccountAddress } = fixture;

        {
          const owner = signers[0].address;
          await accountRegistry.forceAccountCreation(owner);

          createdAccount = {
            address: computeAccountAddress(owner),
            owner,
          };
        }

        {
          const sender = signers[1];
          const owner = sender.address;
          const address = computeAccountAddress(owner);

          await accountRegistry
            .connect(sender)
            .addAccountOwner(address, randomAddress());

          definedAccount = {
            address,
            owner,
          };
        }
      });

      describe('computeAccount()', () => {
        it('expect to compute a correct account address', async () => {
          const { accountRegistry, computeAccountAddress } = fixture;

          const saltOwner = randomAddress();

          expect(await accountRegistry.computeAccount(saltOwner)).eq(
            computeAccountAddress(saltOwner),
          );
        });

        it('expect to return the zero address for a zero address salt owner', async () => {
          const { accountRegistry } = fixture;

          expect(await accountRegistry.computeAccount(ZeroAddress)).eq(
            ZeroAddress,
          );
        });
      });

      describe('isAccountOwner()', () => {
        it('expect to return false for the zero address account', async () => {
          const { accountRegistry } = fixture;

          expect(
            await accountRegistry.isAccountOwner(ZeroAddress, randomAddress()),
          ).false;
        });

        it('expect to return false for the zero address owner', async () => {
          const { accountRegistry } = fixture;

          expect(
            await accountRegistry.isAccountOwner(randomAddress(), ZeroAddress),
          ).false;
        });

        it('expect to return false for a not existing account owner', async () => {
          const { accountRegistry } = fixture;

          expect(
            await accountRegistry.isAccountOwner(
              randomAddress(),
              randomAddress(),
            ),
          ).false;
        });

        it('expect to return true for the account with an unknown state and an existing owner', async () => {
          const { accountRegistry, computeAccountAddress } = fixture;

          const owner = randomAddress();
          const account = computeAccountAddress(owner);

          expect(await accountRegistry.isAccountOwner(account, owner)).true;
        });

        it('expect to return true for the account with a known state and an existing owner', async () => {
          const { accountRegistry } = fixture;

          expect(
            await accountRegistry.isAccountOwner(
              definedAccount.address,
              definedAccount.owner,
            ),
          ).true;
        });
      });

      describe('getAccountState()', () => {
        it('expect to return the correct account state', async () => {
          const { accountRegistry } = fixture;

          expect(await accountRegistry.getAccountState(randomAddress())).eq(
            AccountStates.Unknown,
          );

          expect(
            await accountRegistry.getAccountState(createdAccount.address),
          ).eq(AccountStates.Created);

          expect(
            await accountRegistry.getAccountState(definedAccount.address),
          ).eq(AccountStates.Defined);
        });
      });
    });

    describe('# external functions (setters)', () => {
      describe('createAccount()', () => {
        createBeforeHook(async () => {
          const { accountRegistry } = fixture;

          await accountRegistry.forceAccountCreation(signers[0]);
        });

        it('expect to revert when the account is the zero address', async () => {
          const { accountRegistry } = fixture;

          await expect(
            accountRegistry.createAccount(ZeroAddress),
          ).revertedWithCustomError(accountRegistry, 'AccountIsTheZeroAddress');
        });

        it('expect to revert when the msg.sender is not the account owner', async () => {
          const { accountRegistry, computeAccountAddress } = fixture;

          await expect(
            accountRegistry.createAccount(
              computeAccountAddress(signers[0].address),
            ),
          ).revertedWithCustomError(
            accountRegistry,
            'MsgSenderIsNotTheAccountOwner',
          );
        });

        it('expect to revert when the account has already been created', async () => {
          const { accountRegistry, computeAccountAddress } = fixture;

          await expect(
            accountRegistry
              .connect(signers[0])
              .createAccount(computeAccountAddress(signers[0].address)),
          ).revertedWithCustomError(accountRegistry, 'AccountAlreadyCreated');
        });

        it('expect to create an account', async () => {
          const { accountRegistry, computeAccountAddress } = fixture;

          const owner = signers[1];
          const account = computeAccountAddress(owner.address);

          const tx = accountRegistry.connect(owner).createAccount(account);

          await expect(tx)
            .emit(accountRegistry, 'AccountCreated')
            .withArgs(account);
        });
      });
    });
  }
});
