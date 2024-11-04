import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, utils } from 'hardhat';
import { expect } from 'chai';
import { setupBytesMock } from './fixtures';

const { keccak256, concat } = ethers;
const { randomHex } = utils;

describe('utils/Bytes // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupBytesMock>>;

  before(async () => {
    fixture = await loadFixture(setupBytesMock);
  });

  describe('# getters', () => {
    describe('deepKeccak256()', () => {
      it('expect to return the correct hash', async () => {
        const { bytes } = fixture;

        const data = [randomHex(10), randomHex(20), randomHex(30)];

        const res = await bytes.deepKeccak256(data);

        expect(res).eq(keccak256(concat(data.map((item) => keccak256(item)))));
      });

      it('expect to return the correct hash for empty data', async () => {
        const { bytes } = fixture;

        const res = await bytes.deepKeccak256([]);

        expect(res).eq(keccak256('0x'));
      });
    });
  });
});
