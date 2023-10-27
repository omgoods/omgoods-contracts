import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress, randomHex } from '../common';
import { deployTokenRegistry, setupTokenRegistry } from './fixtures';
import { TokenNotificationsKinds } from './constants';

describe('tokens/TokenRegistry // mocked', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployTokenRegistry>>;

    before(async () => {
      fixture = await loadFixture(deployTokenRegistry);
    });

    describe('initialize()', () => {
      it('expect to revert when the sender is not the owner', async () => {
        const { tokenRegistry, signers } = fixture;

        const tx = tokenRegistry
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress, []);

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect to initialize the contract', async () => {
        const { tokenRegistry } = fixture;

        const gateway = randomAddress();
        const guardians = [randomAddress()];

        const tx = tokenRegistry.initialize(gateway, guardians);

        await expect(tx)
          .emit(tokenRegistry, 'Initialized')
          .withArgs(gateway, guardians);

        expect(await tokenRegistry.getGateway()).eq(gateway);
        expect(await tokenRegistry.hasGuardian(guardians[0])).true;
      });

      describe('# after initialization', () => {
        before(async () => {
          const { tokenRegistry } = fixture;

          if (!(await tokenRegistry.initialized())) {
            await tokenRegistry.initialize(randomAddress(), []);
          }
        });

        it('expect to revert', async () => {
          const { tokenRegistry } = fixture;

          const tx = tokenRegistry.initialize(ZeroAddress, []);

          await expect(tx).revertedWithCustomError(
            tokenRegistry,
            'AlreadyInitialized',
          );
        });
      });
    });
  });

  let fixture: Awaited<ReturnType<typeof setupTokenRegistry>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupTokenRegistry);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('hashToken()', () => {
      it('expect to return the token hash', async () => {
        const { tokenRegistry, typedDataHelper } = fixture;

        const tokenData = {
          tokenImpl: randomAddress(),
          initCode: randomHex(),
        };

        const res = await tokenRegistry.hashToken(tokenData);

        expect(res).eq(typedDataHelper.hash('Token', tokenData));
      });
    });

    describe('hasToken()', () => {
      it('expect to return true when the token exists in the registry', async () => {
        const { signers, tokenRegistry } = fixture;

        const res = await tokenRegistry.hasToken(signers.token);

        expect(res).true;
      });

      it("expect to return false when the token doesn't exist in the registry", async () => {
        const { tokenRegistry } = fixture;

        const res = await tokenRegistry.hasToken(randomAddress());

        expect(res).false;
      });
    });

    describe('hasTokenFactory()', () => {
      it('expect to return true when the token factory exists in the registry', async () => {
        const { signers, tokenRegistry } = fixture;

        const res = await tokenRegistry.hasTokenFactory(signers.tokenFactory);

        expect(res).true;
      });

      it("expect to return false when the token factory doesn't exist in the registry", async () => {
        const { tokenRegistry } = fixture;

        const res = await tokenRegistry.hasTokenFactory(randomAddress());

        expect(res).false;
      });
    });
  });

  describe('# setters', () => {
    describe('createToken()', () => {
      createBeforeHook();

      it('expect to revert when the guardian signature is invalid', async () => {
        const { tokenRegistry, signers } = fixture;

        const tx = tokenRegistry['createToken(address,bytes32,bytes,bytes)'](
          randomAddress(),
          randomHex(),
          randomHex(),
          await signers.owner.signMessage('invalid'),
        );

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'InvalidGuardianSignature',
        );
      });

      it('expect to revert when the sender is not the token factory', async () => {
        const { tokenRegistry } = fixture;

        const tx = tokenRegistry['createToken(address,bytes32,bytes)'](
          randomAddress(),
          randomHex(),
          randomHex(),
        );

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'MsgSenderIsNotTheTokenFactory',
        );
      });

      it('expect to revert when the init code call failed', async () => {
        const { tokenRegistry, tokenImpl, signers } = fixture;

        const tx = tokenRegistry
          .connect(signers.tokenFactory)
          ['createToken(address,bytes32,bytes)'](
            tokenRegistry,
            randomHex(),
            tokenImpl.interface.encodeFunctionData('setOwner', [
              randomAddress(),
            ]),
          );

        await expect(tx).revertedWithCustomError(
          tokenImpl,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect to create a new token', async () => {
        const { tokenRegistry, tokenImpl, signers, computeTokenAddress } =
          fixture;

        const salt = randomHex();
        const initCode = tokenImpl.interface.encodeFunctionData('initialize', [
          randomAddress(),
        ]);

        const tx = tokenRegistry
          .connect(signers.tokenFactory)
          ['createToken(address,bytes32,bytes)'](tokenImpl, salt, initCode);

        await expect(tx)
          .emit(tokenRegistry, 'TokenCreated')
          .withArgs(
            await computeTokenAddress(tokenImpl, salt),
            await tokenImpl.getAddress(),
            initCode,
          );
      });
    });

    describe('addToken()', () => {
      createBeforeHook();

      it('expect to revert when the sender is not the owner', async () => {
        const { tokenRegistry, signers } = fixture;

        const tx = tokenRegistry
          .connect(signers.unknown.at(0))
          .addToken(randomAddress());

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect to revert when the token is the zero address', async () => {
        const { tokenRegistry } = fixture;

        const tx = tokenRegistry.addToken(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'TokenIsTheZeroAddress',
        );
      });

      it('expect to revert when the token already exists', async () => {
        const { tokenRegistry, signers } = fixture;

        const tx = tokenRegistry.addToken(signers.token);

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'TokenAlreadyExists',
        );
      });

      it('expect to add a new token', async () => {
        const { tokenRegistry } = fixture;

        const token = randomAddress();

        const tx = tokenRegistry.addToken(token);

        await expect(tx).emit(tokenRegistry, 'TokenAdded').withArgs(token);
      });
    });

    describe('addTokenFactory()', () => {
      createBeforeHook();

      it('expect to revert when the sender is not the owner', async () => {
        const { tokenRegistry, signers } = fixture;

        const tx = tokenRegistry
          .connect(signers.unknown.at(0))
          .addTokenFactory(randomAddress());

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect to revert when the token factory is the zero address', async () => {
        const { tokenRegistry } = fixture;

        const tx = tokenRegistry.addTokenFactory(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'TokenFactoryIsTheZeroAddress',
        );
      });

      it('expect to revert when the token factory already exists', async () => {
        const { tokenRegistry, signers } = fixture;

        const tx = tokenRegistry.addTokenFactory(signers.tokenFactory);

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'TokenFactoryAlreadyExists',
        );
      });

      it('expect to add a new token factory', async () => {
        const { tokenRegistry } = fixture;

        const tokenFactory = randomAddress();

        const tx = tokenRegistry.addTokenFactory(tokenFactory);

        await expect(tx)
          .emit(tokenRegistry, 'TokenFactoryAdded')
          .withArgs(tokenFactory);
      });
    });

    describe('removeTokenFactory()', () => {
      createBeforeHook();

      it('expect to revert when the sender is not the owner', async () => {
        const { tokenRegistry, signers } = fixture;

        const tx = tokenRegistry
          .connect(signers.unknown.at(0))
          .removeTokenFactory(randomAddress());

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect to revert when the token factory is the zero address', async () => {
        const { tokenRegistry } = fixture;

        const tx = tokenRegistry.removeTokenFactory(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'TokenFactoryIsTheZeroAddress',
        );
      });

      it("expect to revert when the token factory doesn't exist", async () => {
        const { tokenRegistry } = fixture;

        const tx = tokenRegistry.removeTokenFactory(randomAddress());

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'TokenFactoryDoesntExist',
        );
      });

      it('expect to remove the token factory', async () => {
        const { tokenRegistry, signers } = fixture;

        const tx = tokenRegistry.removeTokenFactory(signers.tokenFactory);

        await expect(tx)
          .emit(tokenRegistry, 'TokenFactoryRemoved')
          .withArgs(signers.tokenFactory.address);
      });
    });

    describe('sendTokenNotification()', () => {
      createBeforeHook();

      it('expect to revert when the sender is not the token', async () => {
        const { tokenRegistry, signers } = fixture;

        const tx = tokenRegistry
          .connect(signers.unknown.at(0))
          .sendTokenNotification(1, randomHex());

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'MsgSenderIsNotTheToken',
        );
      });

      it('expect to send the token notification', async () => {
        const { tokenRegistry, signers } = fixture;

        const kind = TokenNotificationsKinds.Unlocked;
        const encodedData = randomHex(100);

        const tx = tokenRegistry
          .connect(signers.token)
          .sendTokenNotification(kind, encodedData);

        await expect(tx)
          .emit(tokenRegistry, 'TokenNotificationSent')
          .withArgs(signers.token.address, kind, encodedData);
      });
    });
  });
});
