import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { helpers } from 'hardhat';
import { expect } from 'chai';
import { deployProxyHelperMock } from './fixtures';
import { createProxyAddressFactory } from './helpers';

const { randomAddress, randomHex } = helpers;

describe('common/proxy/ProxyHelper // using mock', () => {
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

        const computeProxyAddress = await createProxyAddressFactory(
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
