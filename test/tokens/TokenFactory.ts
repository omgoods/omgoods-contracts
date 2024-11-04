import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { utils, ethers } from 'hardhat';
import { expect } from 'chai';
import { setupTokenFactory } from './fixtures';

const { ZeroAddress } = ethers;

const { randomHex, randomAddress } = utils;

describe('tokens/TokenHelper', () => {
  let fixture: Awaited<ReturnType<typeof setupTokenFactory>>;

  before(async () => {
    fixture = await loadFixture(setupTokenFactory);
  });

  describe('# deployment', () => {
    describe('initialize()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { signers, tokenFactory } = fixture;

        const tx = tokenFactory
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress, []);

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect to initialize the contract', async () => {
        const { tokenFactory } = fixture;

        const forwarder = randomAddress();
        const guardians = [randomAddress()];

        const tx = tokenFactory.initialize(forwarder, guardians);

        await expect(tx)
          .emit(tokenFactory, 'Initialized')
          .withArgs(forwarder, guardians);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { tokenFactory } = fixture;

          if (!(await tokenFactory.isInitialized())) {
            await tokenFactory.initialize(ZeroAddress, []);
          }
        });

        it('expect to revert', async () => {
          const { tokenFactory } = fixture;

          const tx = tokenFactory.initialize(ZeroAddress, []);

          await expect(tx).revertedWithCustomError(
            tokenFactory,
            'AlreadyInitialized',
          );
        });
      });
    });
  });

  describe('# getters', () => {
    describe('computeToken()', () => {
      it('expect to compute the token address', async () => {
        const { tokenFactory, computeTokenAddress } = fixture;

        const salt = randomHex();

        const res = await tokenFactory.computeToken(salt);

        expect(res).eq(await computeTokenAddress(salt));
      });
    });

    describe('isToken()', () => {
      it('expect to return true when token exists', async () => {
        const { token, tokenFactory } = fixture;

        const res = await tokenFactory.isToken(await token.getAddress());

        expect(res).true;
      });

      it("expect to return false when token doesn't exist", async () => {
        const { tokenFactory } = fixture;

        const res = await tokenFactory.isToken(randomAddress());

        expect(res).false;
      });
    });

    describe('hashToken()', () => {
      it('expect to return token hash', async () => {
        const { tokenFactory, typedDataHelper } = fixture;

        const salt = randomHex();
        const impl = randomAddress();
        const initData = randomHex();

        const res = await tokenFactory.hashToken({
          salt,
          impl,
          initData,
        });

        expect(res).eq(
          typedDataHelper.hash('Token', {
            salt,
            impl,
            initData,
          }),
        );
      });
    });
  });

  describe('# setters', () => {
    describe('createToken', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { signers, tokenFactory } = fixture;

        const tx = tokenFactory
          .connect(signers.unknown.at(0))
          [
            'createToken(bytes32,address,bytes)'
          ](randomHex(), ZeroAddress, '0x');

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect to revert on invalid guardian signature', async () => {
        const { signers, tokenFactory } = fixture;

        const signer = signers.unknown.at(0);

        const tx = tokenFactory
          .connect(signer)
          [
            'createToken(bytes32,address,bytes,bytes)'
          ](randomHex(), ZeroAddress, '0x', await signer.signMessage(''));

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'InvalidGuardianSignature',
        );
      });

      it('expect to create the token', async () => {
        const { signers, tokenFactory, tokenImpl, computeTokenAddress } =
          fixture;

        const salt = randomHex();
        const owner = signers.owner.address;
        const controller = signers.controller.address;
        const ready = true;

        const initData = tokenImpl.interface.encodeFunctionData('initialize', [
          owner,
          controller,
          ready,
        ]);

        const tx = tokenFactory['createToken(bytes32,address,bytes)'](
          salt,
          tokenImpl,
          initData,
        );

        await expect(tx)
          .emit(tokenFactory, 'TokenCreated')
          .withArgs(computeTokenAddress(salt), tokenImpl, initData, anyValue);
      });

      it('expect to create the token with guardian signature', async () => {
        const {
          signers,
          tokenFactory,
          tokenImpl,
          computeTokenAddress,
          typedDataHelper,
        } = fixture;

        const salt = randomHex();
        const owner = signers.owner.address;
        const controller = signers.controller.address;
        const ready = true;

        const initData = tokenImpl.interface.encodeFunctionData('initialize', [
          owner,
          controller,
          ready,
        ]);

        const signature = await typedDataHelper.sign(signers.owner, 'Token', {
          salt,
          impl: await tokenImpl.getAddress(),
          initData,
        });

        const tx = tokenFactory['createToken(bytes32,address,bytes,bytes)'](
          salt,
          tokenImpl,
          initData,
          signature,
        );

        await expect(tx)
          .emit(tokenFactory, 'TokenCreated')
          .withArgs(computeTokenAddress(salt), tokenImpl, initData, anyValue);
      });
    });

    describe('emitTokenNotification', () => {
      it('expect to revert when the msg.sender is not the token', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.emitTokenNotification(1, '0x');

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'MsgSenderIsNotTheToken',
        );
      });

      it('expect to emit token notification', async () => {
        const { tokenFactory, token } = fixture;

        const tx = token.setReady();

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(await token.getAddress(), 0n, '0x', anyValue);
      });
    });
  });
});
