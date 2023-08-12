import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployBytesMock } from './fixtures';

const { keccak256, concat } = ethers;

const { randomHex } = helpers;

describe('common/utils/Bytes // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployBytesMock>>;

  before(async () => {
    fixture = await loadFixture(deployBytesMock);
  });

  describe('# getters', () => {
    describe('toKeccak256()', () => {
      it('expect to return the correct hash', async () => {
        const { bytesMock } = fixture;

        const data = [randomHex(10), randomHex(20), randomHex(30)];

        const res = await bytesMock.toKeccak256(data);

        expect(res).eq(keccak256(concat(data.map((item) => keccak256(item)))));
      });

      it('expect to return the correct hash for empty data', async () => {
        const { bytesMock } = fixture;

        const res = await bytesMock.toKeccak256([]);

        expect(res).eq(keccak256('0x'));
      });
    });
  });
});
