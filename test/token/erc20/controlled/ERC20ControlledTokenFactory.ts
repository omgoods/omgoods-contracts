import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import {
  deployERC20ControlledTokenFactory,
  setupERC20ControlledTokenFactory,
} from './fixtures';
import { RC20_CONTROLLED_TOKEN_DATA } from './constants';

const { ZeroAddress } = ethers;

const { randomAddress } = helpers;

describe('token/erc20/controlled/ERC20ControlledTokenFactory', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployERC20ControlledTokenFactory>>;

    before(async () => {
      fixture = await loadFixture(deployERC20ControlledTokenFactory);
    });

    describe('initialize()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { erc20ControlledTokenFactory, signers } = fixture;

        const tx = erc20ControlledTokenFactory
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress, ZeroAddress, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          erc20ControlledTokenFactory,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to initialize the contract', async () => {
        const { erc20ControlledTokenFactory } = fixture;

        const gateway = randomAddress();
        const tokenRegistry = randomAddress();
        const tokenImpl = randomAddress();

        const tx = erc20ControlledTokenFactory.initialize(
          gateway,
          tokenRegistry,
          tokenImpl,
        );

        await expect(tx)
          .emit(erc20ControlledTokenFactory, 'Initialized')
          .withArgs(gateway, tokenRegistry, tokenImpl);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { erc20ControlledTokenFactory } = fixture;

          if (!(await erc20ControlledTokenFactory.initialized())) {
            await erc20ControlledTokenFactory.initialize(
              randomAddress(),
              randomAddress(),
              randomAddress(),
            );
          }
        });

        it('expect to revert', async () => {
          const { erc20ControlledTokenFactory } = fixture;

          const tx = erc20ControlledTokenFactory.initialize(
            ZeroAddress,
            ZeroAddress,
            ZeroAddress,
          );

          await expect(tx).revertedWithCustomError(
            erc20ControlledTokenFactory,
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
        const { erc20ControlledTokenFactory, computeTokenAddress } = fixture;

        const symbol = 'TEST';

        const res = await erc20ControlledTokenFactory.computeToken(symbol);

        expect(res).eq(computeTokenAddress(symbol));
      });
    });

    describe('hashToken()', () => {
      it('expect to return the correct hash', async () => {
        const { erc20ControlledTokenFactory, tokenTypeEncoder } = fixture;

        const res = await erc20ControlledTokenFactory.hashToken(
          RC20_CONTROLLED_TOKEN_DATA,
        );

        expect(res).eq(tokenTypeEncoder.hash(RC20_CONTROLLED_TOKEN_DATA));
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('createToken()', () => {
      it('expect to revert when the token owner is the zero address', async () => {
        const { erc20ControlledTokenFactory } = fixture;

        const tx = erc20ControlledTokenFactory.createToken(
          {
            ...RC20_CONTROLLED_TOKEN_DATA,
            owner: ZeroAddress,
          },
          '0x',
        );

        await expect(tx).revertedWithCustomError(
          erc20ControlledTokenFactory,
          'TokenOwnerIsTheZeroAddress',
        );
      });

      it('expect to revert when the minter is the zero address', async () => {
        const { erc20ControlledTokenFactory } = fixture;

        const tx = erc20ControlledTokenFactory.createToken(
          {
            ...RC20_CONTROLLED_TOKEN_DATA,
            minter: ZeroAddress,
          },
          '0x',
        );

        await expect(tx).revertedWithCustomError(
          erc20ControlledTokenFactory,
          'MinterIsTheZeroAddress',
        );
      });

      it('expect to revert when the guardian signature is invalid', async () => {
        const { erc20ControlledTokenFactory, erc20TokenRegistry, signers } =
          fixture;

        const tx = erc20ControlledTokenFactory.createToken(
          RC20_CONTROLLED_TOKEN_DATA,
          await signers.unknown.at(0).signMessage('invalid'),
        );

        await expect(tx).revertedWithCustomError(
          erc20TokenRegistry,
          'InvalidGuardianSignature',
        );
      });

      it('expect to create a token', async () => {
        const {
          erc20ControlledTokenFactory,
          erc20TokenRegistry,
          signers,
          tokenTypeEncoder,
          computeTokenAddress,
        } = fixture;

        const token = computeTokenAddress(RC20_CONTROLLED_TOKEN_DATA.symbol);

        const tx = erc20ControlledTokenFactory.createToken(
          RC20_CONTROLLED_TOKEN_DATA,
          await signers.owner.signTypedData(
            tokenTypeEncoder.domain,
            tokenTypeEncoder.types,
            RC20_CONTROLLED_TOKEN_DATA,
          ),
        );

        await expect(tx)
          .emit(erc20ControlledTokenFactory, 'TokenCreated')
          .withArgs(
            token,
            RC20_CONTROLLED_TOKEN_DATA.name,
            RC20_CONTROLLED_TOKEN_DATA.symbol,
            RC20_CONTROLLED_TOKEN_DATA.owner,
            RC20_CONTROLLED_TOKEN_DATA.minter,
            RC20_CONTROLLED_TOKEN_DATA.burner,
            RC20_CONTROLLED_TOKEN_DATA.initialSupply,
          );

        await expect(tx)
          .emit(erc20TokenRegistry, 'TokenCreated')
          .withArgs(token, await erc20ControlledTokenFactory.getAddress());
      });
    });
  });
});
