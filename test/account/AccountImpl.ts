import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { deployAccountImpl } from './fixtures';

const { ZeroAddress } = ethers;

describe('account/AccountImpl', () => {
  describe('# deployment functions', () => {
    let fixture: Awaited<ReturnType<typeof deployAccountImpl>>;

    before(async () => {
      fixture = await loadFixture(deployAccountImpl);
    });

    describe('initialize()', () => {
      it('expect to revert', async () => {
        const { accountImpl } = fixture;

        await expect(
          accountImpl.initialize(ZeroAddress, ZeroAddress),
        ).revertedWithCustomError(accountImpl, 'AlreadyInitialized');
      });
    });
  });
});
