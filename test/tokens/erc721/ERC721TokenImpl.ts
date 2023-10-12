import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { concat, AbiCoder, ZeroAddress } from 'ethers';
import { randomAddress } from '../../common';
import { TOKEN } from '../constants';
import { setupERC721TokenFactoryMock } from './fixtures';
import { TOKEN_BASE_URL } from './constants';

describe('tokens/erc721/ERC721TokenImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupERC721TokenFactoryMock>>;

  before(async () => {
    fixture = await loadFixture(setupERC721TokenFactoryMock);
  });

  describe('# getters', () => {
    describe('name()', () => {
      it('expect to return the name', async () => {
        const { tokenImpl } = fixture;

        const res = await tokenImpl.name();

        expect(res).eq(TOKEN.name);
      });
    });

    describe('name()', () => {
      it('expect to return the symbol', async () => {
        const { tokenImpl } = fixture;

        const res = await tokenImpl.symbol();

        expect(res).eq(TOKEN.symbol);
      });
    });

    describe('tokenURI()', () => {
      const tokenId = 1;

      before(async () => {
        const { tokenImpl, signers } = fixture;

        await tokenImpl.mint(signers.owner, tokenId);
      });

      it('expect to return the token uri', async () => {
        const { tokenImpl, getTokenUrl } = fixture;

        const res = await tokenImpl.tokenURI(tokenId);

        expect(res).eq(await getTokenUrl(tokenImpl, tokenId));
      });
    });

    describe('_msgSender()', () => {
      it('expect it to return the correct address for calls from the gateway', async () => {
        const { tokenImpl, signers } = fixture;

        const sender = randomAddress();

        const res = await signers.gateway.call({
          to: tokenImpl,
          data: concat([
            tokenImpl.interface.encodeFunctionData('msgSender'),
            sender,
          ]),
        });

        expect(res).eq(
          AbiCoder.defaultAbiCoder().encode(['address'], [sender]),
        );
      });

      it('expect it to return the correct address for calls from outside the gateway', async () => {
        const { tokenImpl, signers } = fixture;

        const sender = signers.unknown.at(0);

        const res = await tokenImpl.connect(sender).msgSender();

        expect(res).eq(sender.address);
      });
    });
  });

  describe('# setters', () => {
    describe('_update()', () => {
      it('expect to emit an event in the token factory', async () => {
        const { tokenImpl, tokenFactory } = fixture;

        const from = ZeroAddress;
        const to = randomAddress();
        const tokenId = 2;

        const tx = tokenImpl.update(to, tokenId, ZeroAddress);

        await expect(tx)
          .emit(tokenFactory, 'TokenTransfer')
          .withArgs(await tokenImpl.getAddress(), from, to, tokenId);
      });
    });

    describe('_approve()', () => {
      const tokenId = 3;

      before(async () => {
        const { tokenImpl, signers } = fixture;

        await tokenImpl.mint(signers.owner, tokenId);
      });

      it('expect to emit an event in the token factory', async () => {
        const { tokenImpl, tokenFactory, signers } = fixture;

        const to = randomAddress();

        const tx = tokenImpl.approve(to, tokenId);

        await expect(tx)
          .emit(tokenFactory, 'TokenApproval')
          .withArgs(
            await tokenImpl.getAddress(),
            signers.owner.address,
            to,
            tokenId,
          );
      });
    });

    describe('_setApprovalForAll()', () => {
      it('expect to emit an event in the token factory', async () => {
        const { tokenImpl, tokenFactory, signers } = fixture;

        const to = randomAddress();
        const approved = true;

        const tx = tokenImpl.setApprovalForAll(to, approved);

        await expect(tx)
          .emit(tokenFactory, 'TokenApprovalForAll')
          .withArgs(
            await tokenImpl.getAddress(),
            signers.owner.address,
            to,
            approved,
          );
      });
    });
  });
});
