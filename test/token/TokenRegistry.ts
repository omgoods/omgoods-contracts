import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployTokenRegistryMock, setupTokenRegistryMock } from './fixtures';

const { ZeroAddress, hashMessage } = ethers;

const { randomAddress, randomHex } = helpers;

describe('token/TokenRegistry // mocked', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployTokenRegistryMock>>;

    before(async () => {
      fixture = await loadFixture(deployTokenRegistryMock);
    });

    describe('_initialize()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { tokenRegistryMock, signers } = fixture;

        const tx = tokenRegistryMock
          .connect(signers.unknown.at(0))
          .initialize([]);

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to initialize the contract', async () => {
        const { tokenRegistryMock } = fixture;

        const guardians = [randomAddress(), randomAddress()];

        const tx = tokenRegistryMock.initialize(guardians);

        await expect(tx)
          .emit(tokenRegistryMock, 'Initialized')
          .withArgs(guardians);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { tokenRegistryMock } = fixture;

          if (!(await tokenRegistryMock.initialized())) {
            await tokenRegistryMock.initialize([]);
          }
        });

        it('expect to revert', async () => {
          const { tokenRegistryMock } = fixture;

          const tx = tokenRegistryMock.initialize([]);

          await expect(tx).revertedWithCustomError(
            tokenRegistryMock,
            'AlreadyInitialized',
          );
        });
      });
    });
  });

  let fixture: Awaited<ReturnType<typeof setupTokenRegistryMock>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupTokenRegistryMock);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('hasToken()', () => {
      it('expect to return true when the token exists', async () => {
        const { tokenRegistryMock, signers } = fixture;

        const res = await tokenRegistryMock.hasToken(signers.token);

        expect(res).true;
      });

      it("expect to return false when the token doesn't exist", async () => {
        const { tokenRegistryMock } = fixture;

        const res = await tokenRegistryMock.hasToken(randomAddress());

        expect(res).false;
      });
    });

    describe('hasToken()', () => {
      it('expect to return true when the token factory exists', async () => {
        const { tokenRegistryMock, signers } = fixture;

        const res = await tokenRegistryMock.hasTokenFactory(
          signers.tokenFactory,
        );

        expect(res).true;
      });

      it("expect to return false when the token factory doesn't exist", async () => {
        const { tokenRegistryMock } = fixture;

        const res = await tokenRegistryMock.hasTokenFactory(randomAddress());

        expect(res).false;
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('addToken()', () => {
      it('expect to revert when the sender is not the owner', async () => {
        const { tokenRegistryMock, signers } = fixture;

        const tx = tokenRegistryMock
          .connect(signers.unknown.at(0))
          .addToken(randomAddress());

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the token is the zero address', async () => {
        const { tokenRegistryMock } = fixture;

        const tx = tokenRegistryMock.addToken(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'TokenIsTheZeroAddress',
        );
      });

      it('expect to revert when the token already exists', async () => {
        const { tokenRegistryMock, signers } = fixture;

        const tx = tokenRegistryMock.addToken(signers.token);

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'TokenAlreadyExists',
        );
      });

      it('expect to add a token', async () => {
        const { tokenRegistryMock } = fixture;

        const token = randomAddress();

        const tx = tokenRegistryMock.addToken(token);

        await expect(tx).emit(tokenRegistryMock, 'TokenAdded').withArgs(token);
      });
    });

    describe('createToken()', () => {
      it('expect to revert when the sender is not a token factory', async () => {
        const { tokenRegistryMock, signers } = fixture;

        const tx = tokenRegistryMock
          .connect(signers.unknown.at(0))
          .createToken(
            randomAddress(),
            randomHex(),
            randomHex(),
            await signers.owner.signMessage(randomHex()),
          );

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'MsgSenderIsNotTheTokenFactory',
        );
      });

      it('expect to revert when the guardian signature is invalid', async () => {
        const { tokenRegistryMock, signers } = fixture;

        const initMessage = randomHex();
        const initHash = hashMessage(initMessage);

        const tx = tokenRegistryMock
          .connect(signers.tokenFactory)
          .createToken(
            randomAddress(),
            randomHex(),
            initHash,
            await signers.unknown.at(0).signMessage(initMessage),
          );

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'InvalidGuardianSignature',
        );
      });

      it('expect to revert when the token already exists', async () => {
        const { tokenRegistryMock, signers, existingToken } = fixture;

        const initMessage = randomHex();
        const initHash = hashMessage(initMessage);

        const tx = tokenRegistryMock
          .connect(signers.tokenFactory)
          .createToken(
            existingToken.impl,
            existingToken.salt,
            initHash,
            await signers.owner.signMessage(initMessage),
          );

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'TokenAlreadyExists',
        );
      });

      it('expect to create a token', async () => {
        const { tokenRegistryMock, signers } = fixture;

        const initMessage = randomHex();
        const initHash = hashMessage(initMessage);

        const tx = tokenRegistryMock
          .connect(signers.tokenFactory)
          .createToken(
            randomAddress(),
            randomHex(),
            initHash,
            await signers.owner.signMessage(initMessage),
          );

        await expect(tx).emit(tokenRegistryMock, 'TokenCreated');
      });
    });

    describe('addTokenFactory()', () => {
      it('expect to revert when the sender is not the owner', async () => {
        const { tokenRegistryMock, signers } = fixture;

        const tx = tokenRegistryMock
          .connect(signers.unknown.at(0))
          .addTokenFactory(randomAddress());

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the token factory is the zero address', async () => {
        const { tokenRegistryMock } = fixture;

        const tx = tokenRegistryMock.addTokenFactory(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'TokenFactoryIsTheZeroAddress',
        );
      });

      it('expect to revert when the token factory already exists', async () => {
        const { tokenRegistryMock, signers } = fixture;

        const tx = tokenRegistryMock.addTokenFactory(signers.tokenFactory);

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'TokenFactoryAlreadyExists',
        );
      });

      it('expect to add a token factory', async () => {
        const { tokenRegistryMock } = fixture;

        const tokenFactory = randomAddress();

        const tx = tokenRegistryMock.addTokenFactory(tokenFactory);

        await expect(tx)
          .emit(tokenRegistryMock, 'TokenFactoryAdded')
          .withArgs(tokenFactory);
      });
    });

    describe('removeTokenFactory()', () => {
      it('expect to revert when the sender is not the owner', async () => {
        const { tokenRegistryMock, signers } = fixture;

        const tx = tokenRegistryMock
          .connect(signers.unknown.at(0))
          .removeTokenFactory(randomAddress());

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the token factory is the zero address', async () => {
        const { tokenRegistryMock } = fixture;

        const tx = tokenRegistryMock.removeTokenFactory(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'TokenFactoryIsTheZeroAddress',
        );
      });

      it("expect to revert when the token factory doesn't exist", async () => {
        const { tokenRegistryMock } = fixture;

        const tx = tokenRegistryMock.removeTokenFactory(randomAddress());

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'TokenFactoryDoesntExist',
        );
      });

      it('expect to remove a token factory', async () => {
        const { tokenRegistryMock, existingTokenFactory } = fixture;

        const tx = tokenRegistryMock.removeTokenFactory(existingTokenFactory);

        await expect(tx)
          .emit(tokenRegistryMock, 'TokenFactoryRemoved')
          .withArgs(existingTokenFactory);
      });
    });

    describe('emitTokenOwnerUpdated()', () => {
      it('expect to revert when the sender is not a token', async () => {
        const { tokenRegistryMock, signers } = fixture;

        const tx = tokenRegistryMock
          .connect(signers.unknown.at(0))
          .emitTokenOwnerUpdated(randomAddress());

        await expect(tx).revertedWithCustomError(
          tokenRegistryMock,
          'MsgSenderIsNotTheToken',
        );
      });

      it('expect to emit an event', async () => {
        const { tokenRegistryMock, signers } = fixture;

        const owner = randomAddress();

        const tx = tokenRegistryMock
          .connect(signers.token)
          .emitTokenOwnerUpdated(owner);

        await expect(tx)
          .emit(tokenRegistryMock, 'TokenOwnerUpdated')
          .withArgs(signers.token.address, owner);
      });
    });
  });
});
