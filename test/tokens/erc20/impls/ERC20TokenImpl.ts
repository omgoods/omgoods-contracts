import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { ethers, utils } from 'hardhat';
import { expect } from 'chai';
import { TOKEN_METADATA, TokenNotificationKinds } from '../../constants';
import { setupTokenImplMock } from './fixtures';

const { AbiCoder } = ethers;
const { randomAddress } = utils;

describe('tokens/erc20/impls/ERC20TokenImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupTokenImplMock>>;

  const createBeforeHook = (ready = false) => {
    before(async () => {
      fixture = await loadFixture(setupTokenImplMock);

      if (ready) {
        const { token } = fixture;

        await token.setReady();
      }
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('name()', () => {
      it('expect to return token name', async () => {
        const { token } = fixture;

        const res = await token.name();

        expect(res).eq(TOKEN_METADATA.name);
      });
    });

    describe('symbol()', () => {
      it('expect to return token symbol', async () => {
        const { token } = fixture;

        const res = await token.symbol();

        expect(res).eq(TOKEN_METADATA.symbol);
      });
    });

    describe('decimals()', () => {
      it('expect to return token symbol', async () => {
        const { token } = fixture;

        const res = await token.decimals();

        expect(res).eq(TOKEN_METADATA.decimals);
      });
    });
  });

  describe('# setters', () => {
    describe('approve()', () => {
      createBeforeHook();

      it('expect to revert when the token is not ready or msg.sender is not the manager', async () => {
        const { signers, token } = fixture;

        const tx = token
          .connect(signers.unknown.at(0))
          .approve(randomAddress(), 0);

        await expect(tx).revertedWithCustomError(token, 'TokenNotReady');
      });

      it('expect to approve the spender', async () => {
        const { signers, token, tokenFactory } = fixture;

        const sender = signers.owner;
        const spender = randomAddress();
        const value = 100;

        const tx = token.connect(sender).approve(spender, value);

        await expect(tx)
          .emit(token, 'Approval')
          .withArgs(sender.address, spender, value);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.ERC20Approve,
            AbiCoder.defaultAbiCoder().encode(
              ['address', 'address', 'uint8'],
              [sender.address, spender, value],
            ),
            anyValue,
          );
      });
    });

    describe('transfer()', () => {
      createBeforeHook();

      it('expect to revert when the token is not ready or msg.sender is not the manager', async () => {
        const { signers, token } = fixture;

        const tx = token
          .connect(signers.unknown.at(0))
          .transfer(randomAddress(), 0);

        await expect(tx).revertedWithCustomError(token, 'TokenNotReady');
      });

      it('expect to transfer the tokens', async () => {
        const { signers, token, tokenFactory } = fixture;

        const sender = signers.owner;
        const to = randomAddress();
        const value = 100;

        const tx = token.connect(sender).transfer(to, value);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(sender.address, to, value);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.ERC20Update,
            AbiCoder.defaultAbiCoder().encode(
              ['address', 'address', 'uint8'],
              [sender.address, to, value],
            ),
            anyValue,
          );
      });
    });

    describe('transferFrom()', () => {
      createBeforeHook();

      it('expect to revert when the token is not ready or msg.sender is not the manager', async () => {
        const { signers, token } = fixture;

        const tx = token
          .connect(signers.unknown.at(0))
          .transferFrom(randomAddress(), randomAddress(), 0);

        await expect(tx).revertedWithCustomError(token, 'TokenNotReady');
      });

      it('expect to transfer the tokens', async () => {
        const { signers, token, tokenFactory } = fixture;

        const sender = signers.controller;
        const from = signers.owner;
        const to = randomAddress();
        const value = 100;

        const tx = token.connect(sender).transferFrom(from, to, value);

        await expect(tx).emit(token, 'Transfer').withArgs(from, to, value);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.ERC20Update,
            AbiCoder.defaultAbiCoder().encode(
              ['address', 'address', 'uint8'],
              [from.address, to, value],
            ),
            anyValue,
          );
      });
    });
  });
});
