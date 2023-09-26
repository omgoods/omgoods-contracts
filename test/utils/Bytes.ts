import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { keccak256, concat } from 'ethers';
import { expect } from 'chai';
import { randomHex } from '../helpers';
import { deployBytesMock } from './fixtures';

describe('utils/Bytes // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployBytesMock>>;

  before(async () => {
    fixture = await loadFixture(deployBytesMock);
  });

  describe('# getters', () => {
    describe('deepKeccak256()', () => {
      it('expect to return the correct hash', async () => {
        const { bytesMock } = fixture;

        const data = [randomHex(10), randomHex(20), randomHex(30)];

        const res = await bytesMock.deepKeccak256(data);

        expect(res).eq(keccak256(concat(data.map((item) => keccak256(item)))));
      });

      it('expect to return the correct hash for empty data', async () => {
        const { bytesMock } = fixture;

        const res = await bytesMock.deepKeccak256([]);

        expect(res).eq(keccak256('0x'));
      });
    });
  });
});
