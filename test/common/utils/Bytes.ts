import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployBytesMock } from './fixtures';

const { keccak256, concat } = ethers;

const { randomHex } = helpers;

describe('common/utils/Bytes (using mock)', () => {
  let fixture: Awaited<ReturnType<typeof deployBytesMock>>;

  before(async () => {
    fixture = await loadFixture(deployBytesMock);
  });

  describe('# external functions (getters)', () => {
    describe('toKeccak256() // mocked', () => {
      it('expect to return the correct hash', async () => {
        const { bytesMock } = fixture;

        const data = [randomHex(10), randomHex(20), randomHex(30)];

        expect(await bytesMock.toKeccak256(data)).eq(
          keccak256(concat(data.map((item) => keccak256(item)))),
        );
      });

      it('expect to return the correct hash for empty data', async () => {
        const { bytesMock } = fixture;

        expect(await bytesMock.toKeccak256([])).eq(keccak256('0x'));
      });
    });
  });
});
