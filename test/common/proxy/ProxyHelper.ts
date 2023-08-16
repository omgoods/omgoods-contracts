import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { proxyUtils, testsUtils } from 'hardhat';
import { expect } from 'chai';
import { deployProxyHelperMock } from './fixtures';

const { createAddressFactory } = proxyUtils;

const { randomAddress, randomHex } = testsUtils;

describe('common/proxy/ProxyHelper // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployProxyHelperMock>>;

  before(async () => {
    fixture = await loadFixture(deployProxyHelperMock);
  });

  describe('# getters', () => {
    describe('computeProxy()', () => {
      it('expect to compute a correct proxy address', async () => {
        const { proxyHelperMock } = fixture;

        const proxyFactory = randomAddress();
        const proxyImpl = randomAddress();
        const salt = randomHex();

        const computeProxyAddress = await createAddressFactory(
          proxyFactory,
          proxyImpl,
        );

        const res = await proxyHelperMock.computeProxy(
          proxyFactory,
          proxyImpl,
          salt,
        );

        expect(res).eq(computeProxyAddress(salt));
      });
    });
  });
});
