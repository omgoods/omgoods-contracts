import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { keccak256, concat } from 'ethers';
import { utils } from 'hardhat';
import { expect } from 'chai';
import { deployBytesMock } from './fixtures';

const { randomHex } = utils;

describe('utils/Bytes // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployBytesMock>>;

  before(async () => {
    fixture = await loadFixture(deployBytesMock);
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
