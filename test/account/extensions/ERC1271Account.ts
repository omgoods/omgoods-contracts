import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { deployERC1271AccountMock } from './fixtures';

const { getSigners, hashMessage, randomBytes } = ethers;

describe('account/extensions/ERC1271Account // using mock', () => {
  let owner: HardhatEthersSigner;
  let signer: HardhatEthersSigner;
  let fixture: Awaited<ReturnType<typeof deployERC1271AccountMock>>;

  before(async () => {
    [owner, signer] = await getSigners();

    fixture = await loadFixture(deployERC1271AccountMock);
  });

  describe('# external functions (getters)', () => {
    describe('isValidSignature()', () => {
      const message = randomBytes(32);
      const hash = hashMessage(message);

      it('expect to return the method selector on a valid signature', async () => {
        const { erc1271AccountMock } = fixture;

        expect(
          await erc1271AccountMock.isValidSignature(
            hash,
            await owner.signMessage(message),
          ),
        ).eq(
          erc1271AccountMock.interface.getFunction('isValidSignature').selector,
        );
      });

      it('expect to return 0xffffffff on an invalid signature', async () => {
        const { erc1271AccountMock } = fixture;

        expect(
          await erc1271AccountMock.isValidSignature(
            hash,
            await signer.signMessage(message),
          ),
        ).eq('0xffffffff');
      });
    });
  });
});
