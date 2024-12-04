import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { ethers, utils } from 'hardhat';
import { expect } from 'chai';
import { TokenNotificationKinds } from '../../constants';
import { setupTokenWrappedImpl } from './fixtures';
import { WRAPPED_TOKEN_SYMBOL_PREFIX } from './constants';

const { AbiCoder, ZeroAddress } = ethers;
const { randomAddress } = utils;

describe('tokens/erc20/impls/ERC20TokenWrappedImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupTokenWrappedImpl>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupTokenWrappedImpl);
    });
  };

  describe('# deployment', () => {
    createBeforeHook();

    describe('initialize()', () => {
      it('expect to revert when the msg.sender is not the factory', async () => {
        const { signers, token } = fixture;

        const tx = token
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheFactory',
        );
      });
    });
  });

  describe('# getters', () => {
    createBeforeHook();

    describe('name()', () => {
      it('expect to return underlying token name', async () => {
        const { token, underlyingToken } = fixture;

        const res = await token.name();

        expect(res).eq(await underlyingToken.name());
      });
    });

    describe('symbol()', () => {
      it('expect to return underlying token symbol', async () => {
        const { token, underlyingToken } = fixture;

        const res = await token.symbol();

        const symbol = await underlyingToken.symbol();

        expect(res).eq(`${WRAPPED_TOKEN_SYMBOL_PREFIX}${symbol}`);
      });
    });

    describe('decimals()', () => {
      it('expect to return underlying token decimals', async () => {
        const { token, underlyingToken } = fixture;

        const res = await token.decimals();

        expect(res).eq(await underlyingToken.decimals());
      });
    });

    describe('getUnderlyingToken()', () => {
      it('expect to return underlying token address', async () => {
        const { token, underlyingToken } = fixture;

        const res = await token.getUnderlyingToken();

        expect(res).eq(await underlyingToken.getAddress());
      });
    });

    describe('hashInitialization()', () => {
      it('expect to return initialization hash', async () => {
        const { tokenImpl, tokenImplTypedData } = fixture;

        const typedData = {
          underlyingToken: randomAddress(),
        };

        const res = await tokenImpl.hashInitialization(typedData);

        expect(res).eq(tokenImplTypedData.hash('Initialization', typedData));
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('wrap()', () => {
      it('expect to wrap the tokens', async () => {
        const { signers, token, underlyingToken, tokenFactory } = fixture;

        const sender = signers.owner;
        const value = 100;

        const tx = token.connect(sender).wrap(value);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(ZeroAddress, sender.address, value);

        await expect(tx)
          .emit(underlyingToken, 'Transfer')
          .withArgs(sender.address, await token.getAddress(), value);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.ERC20Update,
            AbiCoder.defaultAbiCoder().encode(
              ['address', 'address', 'uint8'],
              [ZeroAddress, sender.address, value],
            ),
            anyValue,
          );
      });
    });

    describe('wrapTo()', () => {
      it('expect to wrap the tokens', async () => {
        const { signers, token, underlyingToken, tokenFactory } = fixture;

        const sender = signers.owner;
        const to = randomAddress();
        const value = 100;

        const tx = token.connect(sender).wrapTo(to, value);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(ZeroAddress, to, value);

        await expect(tx)
          .emit(underlyingToken, 'Transfer')
          .withArgs(sender.address, await token.getAddress(), value);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.ERC20Update,
            AbiCoder.defaultAbiCoder().encode(
              ['address', 'address', 'uint8'],
              [ZeroAddress, to, value],
            ),
            anyValue,
          );
      });
    });

    describe('unwrap()', () => {
      it('expect to unwrap the tokens', async () => {
        const { signers, token, underlyingToken, tokenFactory } = fixture;

        const sender = signers.owner;
        const value = 100;

        const tx = token.connect(sender).unwrap(value);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(sender.address, ZeroAddress, value);

        await expect(tx)
          .emit(underlyingToken, 'Transfer')
          .withArgs(await token.getAddress(), sender.address, value);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.ERC20Update,
            AbiCoder.defaultAbiCoder().encode(
              ['address', 'address', 'uint8'],
              [sender.address, ZeroAddress, value],
            ),
            anyValue,
          );
      });
    });

    describe('unwrapTo()', () => {
      it('expect to unwrap the tokens', async () => {
        const { signers, token, underlyingToken, tokenFactory } = fixture;

        const sender = signers.owner;
        const to = randomAddress();
        const value = 100;

        const tx = token.connect(sender).unwrapTo(to, value);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(sender.address, ZeroAddress, value);

        await expect(tx)
          .emit(underlyingToken, 'Transfer')
          .withArgs(await token.getAddress(), to, value);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.ERC20Update,
            AbiCoder.defaultAbiCoder().encode(
              ['address', 'address', 'uint8'],
              [sender.address, ZeroAddress, value],
            ),
            anyValue,
          );
      });
    });
  });
});
