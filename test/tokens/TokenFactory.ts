import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyUint } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress, randomHex } from '../common';
import { deployTokenFactoryMock, setupTokenFactoryMock } from './fixtures';

describe('tokens/TokenFactory // mocked', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployTokenFactoryMock>>;

    before(async () => {
      fixture = await loadFixture(deployTokenFactoryMock);
    });

    describe('initialize()', () => {
      it('expect to revert when the sender is not the owner', async () => {
        const { tokenFactory, signers } = fixture;

        const tx = tokenFactory
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress, ZeroAddress, randomAddress());

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect to revert when the token impl is the zero address', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.initialize(
          ZeroAddress,
          ZeroAddress,
          randomAddress(),
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'TokenImplIsTheZeroAddress',
        );
      });

      it('expect to revert when the token registry is the zero address', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.initialize(
          ZeroAddress,
          randomAddress(),
          ZeroAddress,
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'TokenRegistryIsTheZeroAddress',
        );
      });

      it('expect to initialize the contract', async () => {
        const { tokenFactory } = fixture;

        const forwarder = randomAddress();
        const tokenImpl = randomAddress();
        const tokenRegistry = randomAddress();

        const tx = tokenFactory.initialize(forwarder, tokenImpl, tokenRegistry);

        await expect(tx)
          .emit(tokenFactory, 'Initialized')
          .withArgs(forwarder, tokenImpl, tokenRegistry);

        expect(await tokenFactory.forwarder()).eq(forwarder);
        expect(await tokenFactory.getTokenImpl()).eq(tokenImpl);
        expect(await tokenFactory.getTokenRegistry()).eq(tokenRegistry);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { tokenFactory } = fixture;

          if (!(await tokenFactory.initialized())) {
            await tokenFactory.initialize(
              randomAddress(),
              randomAddress(),
              randomAddress(),
            );
          }
        });

        it('expect to revert', async () => {
          const { tokenFactory } = fixture;

          const tx = tokenFactory.initialize(
            ZeroAddress,
            ZeroAddress,
            ZeroAddress,
          );

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
    describe('getTokenImpl()', () => {
      it('expect to return the token impl address', async () => {
        const { tokenFactory, tokenImpl } = fixture;

        const res = await tokenFactory.getTokenImpl();

        expect(res).eq(await tokenImpl.getAddress());
      });
    });

    describe('getTokenRegistry()', () => {
      it('expect to return the token registry address', async () => {
        const { tokenFactory, tokenRegistry } = fixture;

        const res = await tokenFactory.getTokenRegistry();

        expect(res).eq(await tokenRegistry.getAddress());
      });
    });

    describe('_computeToken()', () => {
      it('expect to compute the token address', async () => {
        const { tokenFactory, computeTokenAddress } = fixture;

        const salt = randomHex();

        const res = await tokenFactory.computeToken(salt);

        expect(res).eq(await computeTokenAddress(salt));
      });
    });
  });

  describe('# setters', () => {
    describe('_createToken()', () => {
      it('expect to create the token without signature verification if the sender is the owner', async () => {
        const { tokenImpl, tokenFactory, tokenRegistry, computeTokenAddress } =
          fixture;

        const salt = randomHex();
        const initCode = tokenImpl.interface.encodeFunctionData('initialize', [
          ZeroAddress,
          true,
        ]);

        const tx = tokenFactory.createToken(salt, initCode, '0x');

        await expect(tx)
          .emit(tokenRegistry, 'TokenCreated')
          .withArgs(
            await computeTokenAddress(salt),
            await tokenImpl.getAddress(),
            initCode,
            anyUint,
          );
      });

      it("expect to verify the guardian's signature if the sender is not the owner", async () => {
        const {
          tokenImpl,
          tokenFactory,
          typedDataHelper,
          signers,
          tokenRegistry,
          computeTokenAddress,
        } = fixture;

        const salt = randomHex();
        const initCode = tokenImpl.interface.encodeFunctionData('initialize', [
          ZeroAddress,
          true,
        ]);

        const tx = tokenFactory.connect(signers.unknown.at(0)).createToken(
          salt,
          initCode,
          await typedDataHelper.sign(signers.guardian, 'Token', {
            tokenImpl: await tokenImpl.getAddress(),
            initCode,
          }),
        );

        await expect(tx)
          .emit(tokenRegistry, 'TokenCreated')
          .withArgs(
            await computeTokenAddress(salt),
            await tokenImpl.getAddress(),
            initCode,
            anyUint,
          );
      });
    });
  });
});
