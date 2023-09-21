import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, testing } from 'hardhat';
import { expect } from 'chai';
import {
  deployERC20ControlledTokenFactory,
  setupERC20ControlledTokenFactory,
} from './fixtures';
import { ERC20_CONTROLLED_TOKEN } from './constants';

const { ZeroAddress } = ethers;

const { randomAddress } = testing;

describe('token/erc20/controlled/ERC20ControlledTokenFactory', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployERC20ControlledTokenFactory>>;

    before(async () => {
      fixture = await loadFixture(deployERC20ControlledTokenFactory);
    });

    describe('initialize()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { tokenFactory, signers } = fixture;

        const tx = tokenFactory
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress, ZeroAddress, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to initialize the contract', async () => {
        const { tokenFactory } = fixture;

        const gateway = randomAddress();
        const tokenRegistry = randomAddress();
        const tokenImpl = randomAddress();

        const tx = tokenFactory.initialize(gateway, tokenRegistry, tokenImpl);

        await expect(tx)
          .emit(tokenFactory, 'Initialized')
          .withArgs(gateway, tokenRegistry, tokenImpl);
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

  let fixture: Awaited<ReturnType<typeof setupERC20ControlledTokenFactory>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupERC20ControlledTokenFactory);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('computeToken()', () => {
      it('expect to compute the correct token address', async () => {
        const { tokenFactory, computeTokenAddress } = fixture;

        const symbol = 'TEST';

        const res = await tokenFactory.computeToken(symbol);

        expect(res).eq(computeTokenAddress(symbol));
      });
    });

    describe('hashToken()', () => {
      it('expect to return the correct hash', async () => {
        const { tokenFactory, typedDataEncoder } = fixture;

        const res = await tokenFactory.hashToken(ERC20_CONTROLLED_TOKEN);

        expect(res).eq(typedDataEncoder.hash('Token', ERC20_CONTROLLED_TOKEN));
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('createToken()', () => {
      it('expect to revert when the token owner is the zero address', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.createToken(
          {
            ...ERC20_CONTROLLED_TOKEN,
            owner: ZeroAddress,
          },
          '0x',
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'TokenOwnerIsTheZeroAddress',
        );
      });

      it('expect to revert when the minter is the zero address', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.createToken(
          {
            ...ERC20_CONTROLLED_TOKEN,
            minter: ZeroAddress,
          },
          '0x',
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'MinterIsTheZeroAddress',
        );
      });

      it('expect to revert when the guardian signature is invalid', async () => {
        const { tokenFactory, tokenRegistry, signers } = fixture;

        const tx = tokenFactory.createToken(
          ERC20_CONTROLLED_TOKEN,
          await signers.unknown.at(0).signMessage('invalid'),
        );

        await expect(tx).revertedWithCustomError(
          tokenRegistry,
          'InvalidGuardianSignature',
        );
      });

      it('expect to create a token', async () => {
        const {
          tokenFactory,
          tokenRegistry,
          signers,
          typedDataEncoder,
          computeTokenAddress,
        } = fixture;

        const token = computeTokenAddress(ERC20_CONTROLLED_TOKEN.symbol);

        const tx = tokenFactory.createToken(
          ERC20_CONTROLLED_TOKEN,
          await typedDataEncoder.sign(
            signers.owner,
            'Token',
            ERC20_CONTROLLED_TOKEN,
          ),
        );

        await expect(tx)
          .emit(tokenFactory, 'TokenCreated')
          .withArgs(
            token,
            ERC20_CONTROLLED_TOKEN.name,
            ERC20_CONTROLLED_TOKEN.symbol,
            ERC20_CONTROLLED_TOKEN.owner,
            ERC20_CONTROLLED_TOKEN.minter,
            ERC20_CONTROLLED_TOKEN.burner,
            ERC20_CONTROLLED_TOKEN.initialSupply,
          );

        await expect(tx)
          .emit(tokenRegistry, 'TokenCreated')
          .withArgs(token, await tokenFactory.getAddress());
      });
    });
  });
});
