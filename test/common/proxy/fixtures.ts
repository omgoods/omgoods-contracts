import { ethers } from 'hardhat';
import { AddressLike } from 'ethers';

const { deployContract } = ethers;

export async function deployProxyImplMock() {
  const proxyImplMock = await deployContract('ProxyImplMock');

  return {
    proxyImplMock,
  };
}

export async function deployProxy(
  options: {
    proxyImpl?: AddressLike;
  } = {},
) {
  let { proxyImpl } = options;

  if (!proxyImpl) {
    ({ proxyImplMock: proxyImpl } = await deployProxyImplMock());
  }

  const proxy = await deployContract('Proxy', [proxyImpl]);

  return {
    proxy,
  };
}

export async function deployProxyFactoryMock() {
  const proxyFactoryMock = await deployContract('ProxyFactoryMock');

  return {
    proxyFactoryMock,
  };
}

export async function deployProxyHelperMock() {
  const proxyHelperMock = await deployContract('ProxyHelperMock');

  return {
    proxyHelperMock,
  };
}
