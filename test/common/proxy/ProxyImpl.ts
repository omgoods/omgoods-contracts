import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, testing } from 'hardhat';
import { expect } from 'chai';
import { deployProxyImplMock } from './fixtures';
import { getProxyImplAddress } from './helpers';

const { ZeroAddress } = ethers;

const { randomAddress } = testing;

describe('common/proxy/ProxyImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployProxyImplMock>>;

  const createBeforeHook = (inner?: () => Promise<void>) => {
    before(async () => {
      fixture = await loadFixture(deployProxyImplMock);

      if (inner) {
        await inner();
      }
    });
  };

  describe('# getters', () => {
    const proxyImpl = randomAddress();

    createBeforeHook(async () => {
      const { proxyImplMock } = fixture;

      await proxyImplMock.setProxyImpl(proxyImpl);
    });

    describe('getImpl()', () => {
      it('expect to return the proxy impl address', async () => {
        const { proxyImplMock } = fixture;

        expect(await proxyImplMock.getProxyImpl()).eq(proxyImpl);
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('_setProxyImpl()', () => {
      it('expect to revert when the proxy impl is the zero address', async () => {
        const { proxyImplMock } = fixture;

        await expect(
          proxyImplMock.setProxyImpl(ZeroAddress),
        ).revertedWithCustomError(proxyImplMock, 'ProxyImplIsTheZeroAddress');
      });

      it('expect to update the proxy impl', async () => {
        const { proxyImplMock } = fixture;

        const proxyImpl = randomAddress();

        const tx = await proxyImplMock.setProxyImpl(proxyImpl);

        await expect(tx)
          .emit(proxyImplMock, 'ProxyImplUpdated')
          .withArgs(proxyImpl);

        expect(await getProxyImplAddress(proxyImplMock)).eq(proxyImpl);
      });
    });
  });
});
