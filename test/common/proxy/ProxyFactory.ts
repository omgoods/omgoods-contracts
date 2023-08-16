import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, proxyUtils, testsUtils } from 'hardhat';
import { expect } from 'chai';
import { deployProxyFactoryMock } from './fixtures';

const { ZeroAddress } = ethers;

const { createAddressFactory, getImplAddress } = proxyUtils;

const { randomAddress, randomHex } = testsUtils;

describe('common/proxy/ProxyFactory // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployProxyFactoryMock>>;

  before(async () => {
    fixture = await loadFixture(deployProxyFactoryMock);
  });

  describe('# setters', () => {
    describe('_createProxy()', () => {
      const createdProxy = {
        proxyImp: randomAddress(),
        salt: randomHex(),
      };

      before(async () => {
        const { proxyFactoryMock } = fixture;

        await proxyFactoryMock.createProxy(
          createdProxy.proxyImp,
          createdProxy.salt,
        );
      });

      it('expect to create the proxy', async () => {
        const { proxyFactoryMock } = fixture;

        const proxyImp = randomAddress();
        const salt = randomHex();

        const computeProxyAddress = await createAddressFactory(
          proxyFactoryMock,
          proxyImp,
        );

        const proxy = computeProxyAddress(salt);

        await proxyFactoryMock.createProxy(proxyImp, salt);

        expect(await getImplAddress(proxy)).eq(proxyImp);
      });

      it('expect to return the zero address when a proxy has already been created', async () => {
        const { proxyFactoryMock } = fixture;

        const res = await proxyFactoryMock.createProxy.staticCall(
          createdProxy.proxyImp,
          createdProxy.salt,
        );

        expect(res).eq(ZeroAddress);
      });
    });
  });
});
