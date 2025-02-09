import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { viem } from 'hardhat';
import { zeroHash, zeroAddress } from 'viem';
import { expect } from 'chai';
import { ACTVariants, randomAddress, TypedDataDomainNames } from '@/common';
import { deployRegistry } from './fixtures';

const { getPublicClient } = viem;

describe.only('act/ACTRegistry', () => {
  describe('# getters', () => {
    describe('eip712Domain()', () => {
      it('Should return correct EIP712 domain', async () => {
        const { registry } = await loadFixture(deployRegistry);

        const client = await getPublicClient();

        const res = (await registry.read.eip712Domain()) as unknown[];

        expect(res[1]).eq(TypedDataDomainNames.ACTRegistry);
        expect(res[2]).eq('1');
        expect(res[3]).eq(client.chain.id);
        expect(res[4]).eq(registry.address);
        expect(res[5]).eq(zeroHash);
      });
    });
  });

  describe('# setters', () => {
    describe('setVariant()', () => {
      it('Should revert if variant impl is the zero address', async () => {
        const { registry } = await loadFixture(deployRegistry);

        await expect(
          registry.write.setVariant([ACTVariants.Fungible, zeroAddress]),
        ).revertedWithCustomError(registry, 'ZeroAddressVariantImpl');
      });

      it('Should revert if variant type is UnknownOrAny', async () => {
        const { registry } = await loadFixture(deployRegistry);

        await expect(
          registry.write.setVariant([
            ACTVariants.UnknownOrAny,
            randomAddress(),
          ]),
        ).revertedWithCustomError(registry, 'InvalidVariant');
      });

      it('Should set variant impl', async () => {
        const { registry } = await loadFixture(deployRegistry);

        const impl = randomAddress();

        await expect(registry.write.setVariant([ACTVariants.Fungible, impl]))
          .emit(registry, 'VariantUpdated')
          .withArgs(ACTVariants.Fungible, impl);
      });
    });
  });
});
