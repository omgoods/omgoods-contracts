import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, testing } from 'hardhat';
import { expect } from 'chai';
import { deployProxy } from './fixtures';
import { getProxyImplAddress } from './helpers';

const { getContractAt } = ethers;

const { randomAddress } = testing;

describe('common/proxy/Proxy', () => {
  describe('# deployment', () => {
    describe('constructor()', () => {
      it('expect to deploy the contract', async () => {
        const proxyImpl = randomAddress();

        const { proxy } = await deployProxy({
          proxyImpl,
        });

        expect(await getProxyImplAddress(proxy)).eq(proxyImpl);
      });
    });
  });

  describe('# wildcard', () => {
    let fixture: Awaited<ReturnType<typeof deployProxy>>;

    before(async () => {
      fixture = await loadFixture(deployProxy);
    });

    describe('fallback()', () => {
      it('expect to delegate a call', async () => {
        const { proxy } = fixture;

        const amount = 10;
        const value = 5;

        const proxyImplMock = await getContractAt(
          'ProxyImplMock',
          await proxy.getAddress(),
        );

        const tx = proxyImplMock.setAmount(amount, {
          value,
        });

        await expect(tx)
          .emit(proxyImplMock, 'AmountUpdated')
          .withArgs(amount, value);
      });
    });
  });
});
