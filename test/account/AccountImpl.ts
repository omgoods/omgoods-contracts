import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { deployAccountImpl, setupAccount } from './fixtures';

const { ZeroAddress } = ethers;

describe('account/AccountImpl', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployAccountImpl>>;

    before(async () => {
      fixture = await loadFixture(deployAccountImpl);
    });

    describe('initialize()', () => {
      it('expect to revert', async () => {
        const { accountImpl } = fixture;

        const tx = accountImpl.initialize(ZeroAddress, ZeroAddress);

        await expect(tx).revertedWithCustomError(
          accountImpl,
          'AlreadyInitialized',
        );
      });
    });
  });

  describe('# getters', () => {
    let fixture: Awaited<ReturnType<typeof setupAccount>>;

    before(async () => {
      fixture = await loadFixture(setupAccount);
    });

    describe('getProxyImpl()', () => {
      it('expect to return the current proxy impl', async () => {
        const { account, accountImpl } = fixture;

        const res = await account.getProxyImpl();

        expect(res).eq(await accountImpl.getAddress());
      });
    });

    describe('getGateway()', () => {
      it('expect to return the gateway', async () => {
        const { account, signers } = fixture;

        const res = await account.getGateway();

        expect(res).eq(signers.gateway.address);
      });
    });

    describe('getExternalOwners()', () => {
      it('expect to return external owners', async () => {
        const { account, accountRegistry, signers } = fixture;

        const res = await account.getExternalOwners();

        expect(res.accountRegistry).eq(await accountRegistry.getAddress());
        expect(res.entryPoint).eq(signers.entryPoint.address);
      });
    });
  });
});
