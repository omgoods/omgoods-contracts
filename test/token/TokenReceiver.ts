import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, testing } from 'hardhat';
import { expect } from 'chai';
import { deployTokenReceiverMock } from './fixtures';
import { TOKEN_RECEIVER_SUPPORTED_INTERFACE_IDS } from './constants';

const { ZeroAddress } = ethers;

const { randomHex } = testing;

describe('token/TokenReceiver // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployTokenReceiverMock>>;

  before(async () => {
    fixture = await loadFixture(deployTokenReceiverMock);
  });

  describe('# getters', () => {
    describe('supportsInterface()', () => {
      it('expect to return false when the interface is not supported', async () => {
        const { tokenReceiverMock } = fixture;

        const res = await tokenReceiverMock.supportsInterface(randomHex(4));

        expect(res).false;
      });

      it('expect to return true when the interface is supported', async () => {
        const { tokenReceiverMock } = fixture;

        for (const interfaceId of TOKEN_RECEIVER_SUPPORTED_INTERFACE_IDS) {
          const res = await tokenReceiverMock.supportsInterface(interfaceId);

          expect(res).true;
        }
      });
    });
  });

  describe('# setters', () => {
    describe('onERC721Received()', () => {
      it('expect to return the onERC721Received selector', async () => {
        const { tokenReceiverMock } = fixture;

        const res = await tokenReceiverMock.onERC721Received.staticCall(
          ZeroAddress,
          ZeroAddress,
          0,
          '0x',
        );

        expect(res).eq(tokenReceiverMock.onERC721Received.fragment.selector);
      });
    });

    describe('tokensReceived()', () => {
      it('expect not to revert', async () => {
        const { tokenReceiverMock } = fixture;

        const tx = tokenReceiverMock.tokensReceived(
          ZeroAddress,
          ZeroAddress,
          ZeroAddress,
          0,
          '0x',
          '0x',
        );

        await expect(tx).not.reverted;
      });
    });

    describe('onERC1155Received()', () => {
      it('expect to return the onERC1155Received selector', async () => {
        const { tokenReceiverMock } = fixture;

        const res = await tokenReceiverMock.onERC1155Received.staticCall(
          ZeroAddress,
          ZeroAddress,
          0,
          0,
          '0x',
        );

        expect(res).eq(tokenReceiverMock.onERC1155Received.fragment.selector);
      });
    });

    describe('onERC1155BatchReceived()', () => {
      it('expect to return the onERC1155BatchReceived selector', async () => {
        const { tokenReceiverMock } = fixture;

        const res = await tokenReceiverMock.onERC1155BatchReceived.staticCall(
          ZeroAddress,
          ZeroAddress,
          [],
          [],
          '0x',
        );

        expect(res).eq(
          tokenReceiverMock.onERC1155BatchReceived.fragment.selector,
        );
      });
    });
  });
});
