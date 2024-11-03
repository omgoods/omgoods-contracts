import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { utils } from 'hardhat';
import { expect } from 'chai';
import { setupCloneFactoryMock } from './fixtures';

const { randomHex } = utils;

describe('proxy/CloneFactory // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupCloneFactoryMock>>;

  before(async () => {
    fixture = await loadFixture(setupCloneFactoryMock);
  });

  describe('# getters', () => {
    describe('_computeClone()', () => {
      it('expect to compute the clone address', async () => {
        const { cloneFactory, computeCloneAddress } = fixture;

        const salt = randomHex();

        const res = await cloneFactory.computeClone(salt);

        expect(res).eq(await computeCloneAddress(salt));
      });
    });
  });

  describe('# setters', () => {
    describe('_createClone()', () => {
      it('expect to create the clone', async () => {
        const { cloneImpl, cloneFactory, computeCloneAddress } = fixture;

        const a = 40;
        const salt = randomHex();
        const initData = cloneImpl.interface.encodeFunctionData('initialize', [
          a,
        ]);

        await cloneFactory.createClone(salt, cloneImpl, initData);

        const clone = cloneImpl.attach(
          await computeCloneAddress(salt),
        ) as typeof cloneImpl;

        expect(await clone.getImpl()).eq(await cloneImpl.getAddress());
        expect(await clone.getFactory()).eq(await cloneFactory.getAddress());
        expect(await clone.a()).eq(a);
      });
    });
  });
});
