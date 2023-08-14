import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployTokenFactoryMock, setupTokenFactoryMock } from './fixtures';

const { ZeroAddress, hashMessage } = ethers;

const { randomAddress, randomHex } = helpers;

describe('token/TokenFactory // mocked', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployTokenFactoryMock>>;

    before(async () => {
      fixture = await loadFixture(deployTokenFactoryMock);
    });

    describe('_initialize()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { tokenFactoryMock, signers } = fixture;

        const tx = tokenFactoryMock
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress, ZeroAddress, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenFactoryMock,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the token registry is the zero address', async () => {
        const { tokenFactoryMock } = fixture;

        const tx = tokenFactoryMock.initialize(
          ZeroAddress,
          ZeroAddress,
          ZeroAddress,
        );

        await expect(tx).revertedWithCustomError(
          tokenFactoryMock,
          'TokenRegistryIsTheZeroAddress',
        );
      });

      it('expect to revert when the token impl is the zero address', async () => {
        const { tokenFactoryMock } = fixture;

        const tx = tokenFactoryMock.initialize(
          ZeroAddress,
          randomAddress(),
          ZeroAddress,
        );

        await expect(tx).revertedWithCustomError(
          tokenFactoryMock,
          'TokenImplIsTheZeroAddress',
        );
      });

      it('expect to initialize the contract', async () => {
        const { tokenFactoryMock } = fixture;

        const gateway = randomAddress();
        const tokenRegistry = randomAddress();
        const tokenImpl = randomAddress();

        const tx = tokenFactoryMock.initialize(
          gateway,
          tokenRegistry,
          tokenImpl,
        );

        await expect(tx)
          .emit(tokenFactoryMock, 'Initialized')
          .withArgs(gateway, tokenRegistry, tokenImpl);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { tokenFactoryMock } = fixture;

          if (!(await tokenFactoryMock.initialized())) {
            await tokenFactoryMock.initialize(
              randomAddress(),
              randomAddress(),
              randomAddress(),
            );
          }
        });

        it('expect to revert', async () => {
          const { tokenFactoryMock } = fixture;

          const tx = tokenFactoryMock.initialize(
            ZeroAddress,
            ZeroAddress,
            ZeroAddress,
          );

          await expect(tx).revertedWithCustomError(
            tokenFactoryMock,
            'AlreadyInitialized',
          );
        });
      });
    });
  });

  let fixture: Awaited<ReturnType<typeof setupTokenFactoryMock>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupTokenFactoryMock);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('_createToken()', () => {
      it('expect to return the correct token address', async () => {
        const { tokenFactoryMock, computeTokenAddress } = fixture;

        const salt = randomHex();

        const res = await tokenFactoryMock.computeToken(salt);

        expect(res).eq(computeTokenAddress(salt));
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('_createToken()', () => {
      it('expect to create a token in the token registry', async () => {
        const { tokenFactoryMock, tokenMock, signers, computeTokenAddress } =
          fixture;

        const salt = randomHex();
        const initMessage = randomHex();
        const initHash = hashMessage(initMessage);

        const res = await tokenFactoryMock.createToken.staticCall(
          salt,
          initHash,
          await signers.owner.signMessage(initMessage),
        );

        expect(res).eq(computeTokenAddress(salt));
      });
    });
  });
});
