import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../../common';
import { setupDefaultTokenImpl } from './fixtures';
import { TOKEN, TokenNotificationsKinds } from '../constants';

describe('tokens/presets/DefaultTokenImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupDefaultTokenImpl>>;

  const createBeforeHook = (unlock = false) => {
    before(async () => {
      fixture = await loadFixture(setupDefaultTokenImpl);

      if (unlock) {
        const { token } = fixture;

        await token.unlock();
      }
    });
  };

  describe('# modifiers', () => {
    describe('onlyOwnerWhenLocked()', () => {
      describe('# before unlocking', () => {
        createBeforeHook();

        it('expect to check the owner when contract is locked', async () => {
          const { token, signers } = fixture;

          const tx = token
            .connect(signers.unknown.at(0))
            .triggerOnlyOwnerWhenLocked();

          await expect(tx).revertedWithCustomError(
            token,
            'MsgSenderIsNotTheOwner',
          );
        });
      });

      describe('# after unlocking', () => {
        createBeforeHook(true);

        it('expect to omit the owner check', async () => {
          const { token, signers } = fixture;

          const res = await token
            .connect(signers.unknown.at(0))
            .triggerOnlyOwnerWhenLocked();

          expect(res).true;
        });
      });
    });

    describe('onlyController()', () => {
      describe('# before unlocking', () => {
        createBeforeHook();

        it('expect not to revert if the sender is the controller', async () => {
          const { token, signers } = fixture;

          const res = await token
            .connect(signers.controller)
            .triggerOnlyController.staticCall();

          expect(res).true;
        });

        it('expect to use the owner as the controller before unlocking', async () => {
          const { token } = fixture;

          const res = await token.triggerOnlyController.staticCall();

          expect(res).true;
        });
      });

      describe('# after unlocking', () => {
        createBeforeHook(true);

        it('expect to revert if the sender is not the controller', async () => {
          const { token } = fixture;

          const tx = token.triggerOnlyController();

          await expect(tx).revertedWithCustomError(
            token,
            'MsgSenderIsNotTheController',
          );
        });
      });
    });
  });

  describe('# deployment', () => {
    createBeforeHook();

    describe('initialize()', () => {
      describe('# using direct deployment', () => {
        it('expect to revert', async () => {
          const { tokenImpl } = fixture;

          const tx = tokenImpl.initialize(
            ZeroAddress,
            ZeroAddress,
            '',
            '',
            ZeroAddress,
            false,
          );

          await expect(tx).revertedWithCustomError(
            tokenImpl,
            'AlreadyInitialized',
          );
        });
      });

      describe('# using token factory', () => {
        it('expect to initialize the contract', async () => {
          const { tokenFactory, computeToken } = fixture;

          const owner = randomAddress();
          const name = 'Test';
          const symbol = 'TEST';
          const controller = randomAddress();
          const locked = true;

          const token = await computeToken(symbol);

          await tokenFactory.createToken(
            owner,
            name,
            symbol,
            controller,
            locked,
            '0x',
          );

          expect(await token.getOwner()).eq(owner);
          expect(await token.name()).eq(name);
          expect(await token.symbol()).eq(symbol);
          expect(await token.getController()).eq(controller);
          expect(await token.locked()).eq(locked);
        });

        describe('# after initialization', () => {
          it('expect to revert', async () => {
            const { token } = fixture;

            const tx = token.initialize(
              ZeroAddress,
              ZeroAddress,
              '',
              '',
              ZeroAddress,
              false,
            );

            await expect(tx).revertedWithCustomError(
              token,
              'AlreadyInitialized',
            );
          });
        });
      });
    });
  });

  describe('# getters', () => {
    createBeforeHook();

    describe('name()', () => {
      it('expect to return the name of the token', async () => {
        const { token } = fixture;

        const res = await token.name();

        expect(res).eq(TOKEN.name);
      });
    });

    describe('symbol()', () => {
      it('expect to return the symbol of the token', async () => {
        const { token } = fixture;

        const res = await token.symbol();

        expect(res).eq(TOKEN.symbol);
      });
    });

    describe('getController()', () => {
      it('expect to return the token controller', async () => {
        const { token, signers } = fixture;

        const res = await token.getController();

        expect(res).eq(signers.controller.address);
      });
    });

    describe('locked()', () => {
      describe('# before unlocking', () => {
        createBeforeHook();

        it('expect to return true', async () => {
          const { token } = fixture;

          const res = await token.locked();

          expect(res).true;
        });
      });

      describe('# after unlocking', () => {
        createBeforeHook(true);

        it('expect to return false', async () => {
          const { token } = fixture;

          const res = await token.locked();

          expect(res).false;
        });
      });
    });
  });

  describe('# setters', () => {
    describe('unlock()', () => {
      describe('# after unlocking', () => {
        createBeforeHook();

        it('expect to revert when the sender is not the owner', async () => {
          const { token, signers } = fixture;

          const tx = token.connect(signers.unknown.at(0)).unlock();

          await expect(tx).revertedWithCustomError(
            token,
            'MsgSenderIsNotTheOwner',
          );
        });

        it('expect to unlock the token', async () => {
          const { token, tokenRegistry } = fixture;

          const tx = token.unlock();

          await expect(tx).emit(token, 'Unlocked');

          await expect(tx)
            .emit(tokenRegistry, 'TokenNotificationSent')
            .withArgs(
              await token.getAddress(),
              TokenNotificationsKinds.Unlocked,
              '0x',
            );
        });
      });

      describe('# after unlocking', () => {
        createBeforeHook(true);

        it('expect to revert', async () => {
          const { token } = fixture;

          const tx = token.unlock();

          await expect(tx).revertedWithCustomError(token, 'ExpectedLocked');
        });
      });
    });
  });
});
