import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { ethers, utils } from 'hardhat';
import { expect } from 'chai';
import { TOKEN_METADATA, TokenNotificationKinds } from '../../constants';
import { setupTokenImplMock } from './fixtures';
import { TOKEN_IDS, TOKEN_URI_PREFIX } from './constants';

const { AbiCoder } = ethers;
const { randomAddress } = utils;

describe('tokens/erc721/impls/ERC721TokenImpl // mocked', () => {
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

    describe('getUriPrefix()', () => {
      it('expect to return token symbol', async () => {
        const { token } = fixture;

        const res = await token.getUriPrefix();

        expect(res).eq(TOKEN_URI_PREFIX);
      });
    });

    describe('tokenURI()', () => {
      it('expect to return token url', async () => {
        const { token } = fixture;

        const tokenId = TOKEN_IDS.at(0);

        const res = await token.tokenURI(tokenId);

        expect(res).eq(`${TOKEN_URI_PREFIX}${tokenId}`);
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
        const tokenId = TOKEN_IDS.at(0);

        const tx = token.connect(sender).approve(spender, tokenId);

        await expect(tx)
          .emit(token, 'Approval')
          .withArgs(sender.address, spender, tokenId);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.ERC721Approve,
            AbiCoder.defaultAbiCoder().encode(
              ['address', 'address', 'uint8'],
              [sender.address, spender, tokenId],
            ),
            anyValue,
          );
      });
    });

    describe('setApprovalForAll()', () => {
      createBeforeHook();

      it('expect to revert when the token is not ready or msg.sender is not the manager', async () => {
        const { signers, token } = fixture;

        const tx = token
          .connect(signers.unknown.at(0))
          .setApprovalForAll(randomAddress(), true);

        await expect(tx).revertedWithCustomError(token, 'TokenNotReady');
      });

      it('expect to approve the operator', async () => {
        const { signers, token, tokenFactory } = fixture;

        const sender = signers.owner;
        const operator = randomAddress();
        const approved = true;

        const tx = token.connect(sender).setApprovalForAll(operator, approved);

        await expect(tx)
          .emit(token, 'ApprovalForAll')
          .withArgs(sender.address, operator, approved);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.ERC721ApproveForAll,
            AbiCoder.defaultAbiCoder().encode(
              ['address', 'address', 'bool'],
              [sender.address, operator, approved],
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

      it('expect to transfer the token', async () => {
        const { signers, token, tokenFactory } = fixture;

        const sender = signers.controller;
        const from = signers.owner;
        const to = randomAddress();
        const tokenId = TOKEN_IDS.at(0);

        const tx = token.connect(sender).transferFrom(from, to, tokenId);

        await expect(tx).emit(token, 'Transfer').withArgs(from, to, tokenId);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.ERC721Update,
            AbiCoder.defaultAbiCoder().encode(
              ['address', 'address', 'uint8'],
              [from.address, to, tokenId],
            ),
            anyValue,
          );
      });
    });

    describe('safeTransferFrom()', () => {
      createBeforeHook();

      it('expect to revert when the token is not ready or msg.sender is not the manager', async () => {
        const { signers, token } = fixture;

        const tx = token
          .connect(signers.unknown.at(0))
          [
            'safeTransferFrom(address,address,uint256)'
          ](randomAddress(), randomAddress(), 0);

        await expect(tx).revertedWithCustomError(token, 'TokenNotReady');
      });

      it('expect to transfer the token', async () => {
        const { signers, token, tokenFactory } = fixture;

        const sender = signers.controller;
        const from = signers.owner;
        const to = randomAddress();
        const tokenId = TOKEN_IDS.at(0);

        const tx = token
          .connect(sender)
          ['safeTransferFrom(address,address,uint256)'](from, to, tokenId);

        await expect(tx).emit(token, 'Transfer').withArgs(from, to, tokenId);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.ERC721Update,
            AbiCoder.defaultAbiCoder().encode(
              ['address', 'address', 'uint8'],
              [from.address, to, tokenId],
            ),
            anyValue,
          );
      });
    });
  });
});
