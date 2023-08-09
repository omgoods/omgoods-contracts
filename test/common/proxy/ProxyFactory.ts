import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployProxyFactoryMock } from './fixtures';
import { getProxyImplAddress, createProxyAddressFactory } from './helpers';

const { ZeroAddress } = ethers;

const { randomAddress, randomHex } = helpers;

describe('common/proxy/ProxyFactory (using mock)', () => {
  let fixture: Awaited<ReturnType<typeof deployProxyFactoryMock>>;

  before(async () => {
    fixture = await loadFixture(deployProxyFactoryMock);
  });

  describe('# external functions (setters)', () => {
    describe('createProxy() // mocked', () => {
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

        const computeProxyAddress = await createProxyAddressFactory(
          proxyFactoryMock,
          proxyImp,
        );

        const proxy = computeProxyAddress(salt);

        await proxyFactoryMock.createProxy(proxyImp, salt);

        expect(await getProxyImplAddress(proxy)).eq(proxyImp);
      });

      it('expect to return the zero address when a proxy has already been created', async () => {
        const { proxyFactoryMock } = fixture;

        expect(
          await proxyFactoryMock.createProxy.staticCall(
            createdProxy.proxyImp,
            createdProxy.salt,
          ),
        ).eq(ZeroAddress);
      });
    });
  });
});
