import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress, randomBytes, hashMessage } from 'ethers';
import { expect } from 'chai';
import { randomAddress, randomHex } from '../common';
import { TOKEN_MOCK } from './constants';
import { deployTokenFactoryMock, setupTokenFactoryMock } from './fixtures';

describe('token/TokenFactory // mocked', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployTokenFactoryMock>>;

    before(async () => {
      fixture = await loadFixture(deployTokenFactoryMock);
    });

    describe('initialize()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { tokenFactoryMock, signers } = fixture;

        const tx = tokenFactoryMock
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress, [], ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenFactoryMock,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the token impl is the zero address', async () => {
        const { tokenFactoryMock } = fixture;

        const tx = tokenFactoryMock.initialize(ZeroAddress, [], ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenFactoryMock,
          'TokenImplIsTheZeroAddress',
        );
      });

      it('expect to initialize the contract', async () => {
        const { tokenFactoryMock } = fixture;

        const gateway = randomAddress();
        const guardians = [randomAddress()];
        const tokenImpl = randomAddress();

        const tx = tokenFactoryMock.initialize(gateway, guardians, tokenImpl);

        await expect(tx)
          .emit(tokenFactoryMock, 'Initialized')
          .withArgs(gateway, guardians, tokenImpl);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { tokenFactoryMock } = fixture;

          if (!(await tokenFactoryMock.initialized())) {
            await tokenFactoryMock.initialize(
              randomAddress(),
              [],
              randomAddress(),
            );
          }
        });

        it('expect to revert', async () => {
          const { tokenFactoryMock } = fixture;

          const tx = tokenFactoryMock.initialize(ZeroAddress, [], ZeroAddress);

          await expect(tx).revertedWithCustomError(
            tokenFactoryMock,
            'AlreadyInitialized',
          );
        });
      });
    });
  });

  let fixture: Awaited<ReturnType<typeof setupTokenFactoryMock>>;

  before(async () => {
    fixture = await loadFixture(setupTokenFactoryMock);
  });

  describe('# getters', () => {
    describe('hasToken()', () => {
      it('expect to return true when the token exists', async () => {
        const { tokenFactoryMock, tokenMock } = fixture;

        const res = await tokenFactoryMock.hasToken(tokenMock);

        expect(res).true;
      });

      it("expect to return false when the token doesn't exist", async () => {
        const { tokenFactoryMock } = fixture;

        const res = await tokenFactoryMock.hasToken(randomAddress());

        expect(res).false;
      });
    });

    describe('_computeToken()', () => {
      it('expect to return the correct address', async () => {
        const { tokenFactoryMock, computeTokenMock } = fixture;

        const salt = randomHex();

        const res = await tokenFactoryMock.computeToken(salt);

        expect(res).eq(computeTokenMock(salt));
      });
    });

    describe('_verifyGuardianSignature()', () => {
      const message = randomBytes(32);
      const hash = hashMessage(message);

      it('expect not to revert when the guardian signature is valid', async () => {
        const { tokenFactoryMock, signers } = fixture;

        const tx = tokenFactoryMock
          .connect(signers.unknown.at(0))
          .verifyGuardianSignature(
            hash,
            await signers.guardian.signMessage(message),
          );

        await expect(tx).not.revertedWithCustomError(
          tokenFactoryMock,
          'InvalidGuardianSignature',
        );
      });

      it('expect not to revert when the owner signature is valid', async () => {
        const { tokenFactoryMock, signers } = fixture;

        const tx = tokenFactoryMock
          .connect(signers.unknown.at(0))
          .verifyGuardianSignature(
            hash,
            await signers.owner.signMessage(message),
          );

        await expect(tx).not.revertedWithCustomError(
          tokenFactoryMock,
          'InvalidGuardianSignature',
        );
      });

      it('expect not to revert when the sender is the owner', async () => {
        const { tokenFactoryMock, signers } = fixture;

        const tx = tokenFactoryMock.verifyGuardianSignature(
          hash,
          await signers.unknown.at(0).signMessage(message),
        );

        await expect(tx).not.revertedWithCustomError(
          tokenFactoryMock,
          'InvalidGuardianSignature',
        );
      });

      it('expect to revert when the signature is invalid', async () => {
        const { tokenFactoryMock, signers } = fixture;

        const tx = tokenFactoryMock
          .connect(signers.unknown.at(0))
          .verifyGuardianSignature(
            hash,
            await signers.unknown.at(0).signMessage(message),
          );

        await expect(tx).revertedWithCustomError(
          tokenFactoryMock,
          'InvalidGuardianSignature',
        );
      });
    });
  });

  describe('# setters', () => {
    describe('emitTokenOwnerUpdated()', () => {
      it('expect to revert when the sender is not a token', async () => {
        const { tokenFactoryMock } = fixture;

        const tx = tokenFactoryMock.emitTokenOwnerUpdated(randomAddress());

        await expect(tx).revertedWithCustomError(
          tokenFactoryMock,
          'MsgSenderIsNotTheToken',
        );
      });

      it('expect to emit the event', async () => {
        const { tokenFactoryMock, signers } = fixture;

        const owner = randomAddress();

        const tx = tokenFactoryMock
          .connect(signers.token)
          .emitTokenOwnerUpdated(owner);

        await expect(tx)
          .emit(tokenFactoryMock, 'TokenOwnerUpdated')
          .withArgs(signers.token.address, owner);
      });
    });

    describe('_createToken()', () => {
      it('expect to revert when the token already exists', async () => {
        const { tokenFactoryMock } = fixture;

        const tx = tokenFactoryMock.createToken(
          TOKEN_MOCK.salt,
          TOKEN_MOCK.name,
          TOKEN_MOCK.symbol,
          randomAddress(),
        );

        await expect(tx).revertedWithCustomError(
          tokenFactoryMock,
          'ERC1167FailedCreateClone',
        );
      });

      it('expect to create a token', async () => {
        const { tokenFactoryMock, computeTokenMock } = fixture;

        const salt = randomHex();

        const res = await tokenFactoryMock.createToken.staticCall(
          salt,
          TOKEN_MOCK.name,
          TOKEN_MOCK.symbol,
          randomAddress(),
        );

        expect(res).eq(computeTokenMock(salt));
      });
    });
  });
});
