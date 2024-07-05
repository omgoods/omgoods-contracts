import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyUint } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { abiCoder, randomAddress } from '../../common';
import { TokenNotificationsKinds } from '../constants';
import { setupERC721TokenMock } from './fixtures';
import { ERC721_TOKEN } from './constants';

describe('tokens/erc721/ERC721Token // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupERC721TokenMock>>;

  before(async () => {
    fixture = await loadFixture(setupERC721TokenMock);
  });

  describe('# setters', () => {
    describe('_update()', () => {
      it('expect to send the notification after update', async () => {
        const { token, tokenRegistry, signers } = fixture;

        const from = signers.owner.address;
        const to = randomAddress();
        const tokenId = ERC721_TOKEN.tokenIds.at(0);

        const tx = token.transferFrom(from, to, tokenId);

        await expect(tx)
          .emit(tokenRegistry, 'TokenNotificationSent')
          .withArgs(
            await token.getAddress(),
            TokenNotificationsKinds.ERC721Update,
            abiCoder.encode(
              ['address', 'address', 'uint256'],
              [from, to, tokenId],
            ),
            anyUint,
          );
      });
    });

    describe('_approve()', () => {
      it('expect to send the notification after approval', async () => {
        const { token, tokenRegistry, signers } = fixture;

        const approved = randomAddress();
        const tokenId = ERC721_TOKEN.tokenIds.at(1);

        const tx = token.approve(approved, tokenId);

        await expect(tx)
          .emit(tokenRegistry, 'TokenNotificationSent')
          .withArgs(
            await token.getAddress(),
            TokenNotificationsKinds.ERC721Approve,
            abiCoder.encode(
              ['address', 'address', 'uint256'],
              [signers.owner.address, approved, tokenId],
            ),
            anyUint,
          );
      });
    });

    describe('_setApprovalForAll()', () => {
      it('expect to send the notification after approval for all', async () => {
        const { token, tokenRegistry, signers } = fixture;

        const operator = randomAddress();
        const approved = true;

        const tx = token.setApprovalForAll(operator, approved);

        await expect(tx)
          .emit(tokenRegistry, 'TokenNotificationSent')
          .withArgs(
            await token.getAddress(),
            TokenNotificationsKinds.ERC721ApproveForAll,
            abiCoder.encode(
              ['address', 'address', 'bool'],
              [signers.owner.address, operator, approved],
            ),
            anyUint,
          );
      });
    });
  });
});
