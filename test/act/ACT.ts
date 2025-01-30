import { viem } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';

const { getPublicClient, deployContract } = viem;

describe('act/ACT', function () {
  async function deployACTMockFixture() {
    const act = await deployContract('ACTMock');
    const publicClient = await getPublicClient();

    return {
      act,
      publicClient,
    };
  }

  describe('# external getters', function () {
    describe('name()', function () {
      it('Should return token name', async function () {
        const name = 'example';

        const { act } = await loadFixture(deployACTMockFixture);

        await act.write.setName([name]);

        expect(await act.read.name()).eq(name);
      });
    });
  });
});
