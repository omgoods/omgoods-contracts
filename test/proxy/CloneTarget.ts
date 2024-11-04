import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { utils } from 'hardhat';
import { expect } from 'chai';
import { setupCloneMock } from './fixtures';

const { randomAddress } = utils;

describe('proxy/CloneTarget // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupCloneMock>>;

  before(async () => {
    fixture = await loadFixture(setupCloneMock);
  });

  describe('# deployment', () => {
    describe('initialize()', () => {
      it('expect to revert', async () => {
        const { cloneTarget } = fixture;

        const tx = cloneTarget.initialize(randomAddress(), '0x');

        await expect(tx).revertedWithCustomError(
          cloneTarget,
          'AlreadyInitialized',
        );
      });
    });
  });

  describe('# fallbacks', () => {
    describe('receive()', () => {
      it('expect to receive msg.value', async () => {
        const { signers, clone } = fixture;

        const sender = signers.unknown.at(0);
        const value = 100n;

        const tx = sender.sendTransaction({
          to: clone,
          value,
        });

        await expect(tx).changeEtherBalances(
          [sender.address, await clone.getAddress()],
          [-value, value],
        );
      });
    });
  });
});
