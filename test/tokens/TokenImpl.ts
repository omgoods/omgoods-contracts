import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress, randomHex } from '../common';
import { setupTokenFactoryMock } from './fixtures';

describe('tokens/TokenImpl // mocked', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof setupTokenFactoryMock>>;

    before(async () => {
      fixture = await loadFixture(setupTokenFactoryMock);
    });

    describe('initialize()', () => {
      describe('# using direct deployment', () => {
        it('expect to revert', async () => {
          const { tokenImpl } = fixture;

          const tx = tokenImpl.initialize(ZeroAddress);

          await expect(tx).revertedWithCustomError(
            tokenImpl,
            'AlreadyInitialized',
          );
        });
      });

      describe('# using token factory', () => {
        it('expect to initialize the contract', async () => {
          const { tokenRegistry, tokenFactory, computeToken } = fixture;

          const salt = randomHex();
          const gateway = randomAddress();

          const token = await computeToken(salt);

          await tokenFactory.createToken(
            salt,
            token.interface.encodeFunctionData('initialize', [gateway]),
            '0x',
          );

          expect(await token.getGateway()).eq(gateway);
          expect(await token.getTokenRegistry()).eq(
            await tokenRegistry.getAddress(),
          );
        });

        describe('# after initialization', () => {
          it('expect to revert', async () => {
            const { token } = fixture;

            const tx = token.initialize(ZeroAddress);

            await expect(tx).revertedWithCustomError(
              token,
              'AlreadyInitialized',
            );
          });
        });
      });
    });
  });
});
