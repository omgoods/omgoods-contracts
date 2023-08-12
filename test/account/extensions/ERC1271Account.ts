import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { deployERC1271AccountMock } from './fixtures';

const { hashMessage, randomBytes } = ethers;

describe('account/extensions/ERC1271Account // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployERC1271AccountMock>>;

  before(async () => {
    fixture = await loadFixture(deployERC1271AccountMock);
  });

  describe('# getters', () => {
    describe('isValidSignature()', () => {
      const message = randomBytes(32);
      const hash = hashMessage(message);

      it('expect to return the method selector on a valid signature', async () => {
        const { erc1271AccountMock, signers } = fixture;

        const res = await erc1271AccountMock.isValidSignature(
          hash,
          await signers.owner.signMessage(message),
        );

        expect(res).eq(
          erc1271AccountMock.interface.getFunction('isValidSignature').selector,
        );
      });

      it('expect to return 0xffffffff on an invalid signature', async () => {
        const { erc1271AccountMock, signers } = fixture;

        const res = await erc1271AccountMock.isValidSignature(
          hash,
          await signers.unknown.at(0).signMessage(message),
        );

        expect(res).eq('0xffffffff');
      });
    });
  });
});
