import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress, randomBytes, hashMessage } from 'ethers';
import { expect } from 'chai';
import { randomAddress, randomHex } from '../common';
import { TOKEN } from './constants';
import { deployTokenFactoryMock, setupTokenFactoryMock } from './fixtures';

describe('tokens/TokenFactory // mocked', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployTokenFactoryMock>>;

    before(async () => {
      fixture = await loadFixture(deployTokenFactoryMock);
    });

    describe('initialize()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { tokenFactory, signers } = fixture;

        const tx = tokenFactory
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress, [], ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the token impl is the zero address', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.initialize(ZeroAddress, [], ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'TokenImplIsTheZeroAddress',
        );
      });

      it('expect to initialize the contract', async () => {
        const { tokenFactory } = fixture;

        const gateway = randomAddress();
        const guardians = [randomAddress()];
        const tokenImpl = randomAddress();

        const tx = tokenFactory.initialize(gateway, guardians, tokenImpl);

        await expect(tx)
          .emit(tokenFactory, 'Initialized')
          .withArgs(gateway, guardians, tokenImpl);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { tokenFactory } = fixture;

          if (!(await tokenFactory.initialized())) {
            await tokenFactory.initialize(randomAddress(), [], randomAddress());
          }
        });

        it('expect to revert', async () => {
          const { tokenFactory } = fixture;

          const tx = tokenFactory.initialize(ZeroAddress, [], ZeroAddress);

          await expect(tx).revertedWithCustomError(
            tokenFactory,
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
        const { tokenFactory, token } = fixture;

        const res = await tokenFactory.hasToken(token);

        expect(res).true;
      });

      it("expect to return false when the token doesn't exist", async () => {
        const { tokenFactory } = fixture;

        const res = await tokenFactory.hasToken(randomAddress());

        expect(res).false;
      });
    });

    describe('_computeToken()', () => {
      it('expect to return the correct address', async () => {
        const { tokenFactory, computeToken } = fixture;

        const salt = randomHex();

        const res = await tokenFactory.computeToken(salt);

        expect(res).eq(computeToken(salt));
      });
    });

    describe('_verifyGuardianSignature()', () => {
      const message = randomBytes(32);
      const hash = hashMessage(message);

      it('expect not to revert when the guardian signature is valid', async () => {
        const { tokenFactory, signers } = fixture;

        const tx = tokenFactory
          .connect(signers.unknown.at(0))
          .verifyGuardianSignature(
            hash,
            await signers.guardian.signMessage(message),
          );

        await expect(tx).not.revertedWithCustomError(
          tokenFactory,
          'InvalidGuardianSignature',
        );
      });

      it('expect not to revert when the owner signature is valid', async () => {
        const { tokenFactory, signers } = fixture;

        const tx = tokenFactory
          .connect(signers.unknown.at(0))
          .verifyGuardianSignature(
            hash,
            await signers.owner.signMessage(message),
          );

        await expect(tx).not.revertedWithCustomError(
          tokenFactory,
          'InvalidGuardianSignature',
        );
      });

      it('expect not to revert when the sender is the owner', async () => {
        const { tokenFactory, signers } = fixture;

        const tx = tokenFactory.verifyGuardianSignature(
          hash,
          await signers.unknown.at(0).signMessage(message),
        );

        await expect(tx).not.revertedWithCustomError(
          tokenFactory,
          'InvalidGuardianSignature',
        );
      });

      it('expect to revert when the signature is invalid', async () => {
        const { tokenFactory, signers } = fixture;

        const tx = tokenFactory
          .connect(signers.unknown.at(0))
          .verifyGuardianSignature(
            hash,
            await signers.unknown.at(0).signMessage(message),
          );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'InvalidGuardianSignature',
        );
      });
    });
  });

  describe('# setters', () => {
    describe('_createToken()', () => {
      it('expect to revert when the token already exists', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.createToken(
          TOKEN.salt,
          TOKEN.name,
          TOKEN.symbol,
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'ERC1167FailedCreateClone',
        );
      });

      it('expect to create a token', async () => {
        const { tokenFactory, computeToken } = fixture;

        const salt = randomHex();

        const res = await tokenFactory.createToken.staticCall(
          salt,
          TOKEN.name,
          TOKEN.symbol,
        );

        expect(res).eq(computeToken(salt));
      });
    });
  });
});
