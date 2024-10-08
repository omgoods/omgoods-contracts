import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { utils } from 'hardhat';
import { expect } from 'chai';
import { setupTokenFactoryMock } from './fixtures';

const { randomAddress, randomHex } = utils;

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

          const tx = tokenImpl.initialize(ZeroAddress, true);

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
          const forwarder = randomAddress();
          const locked = true;

          const token = await computeToken(salt);

          await tokenFactory.createToken(
            salt,
            token.interface.encodeFunctionData('initialize', [
              forwarder,
              locked,
            ]),
            '0x',
          );

          expect(await token.forwarder()).eq(forwarder);
          expect(await token.getTokenRegistry()).eq(
            await tokenRegistry.getAddress(),
          );
          expect(await token.locked()).eq(locked);
        });

        describe('# after initialization', () => {
          it('expect to revert', async () => {
            const { token } = fixture;

            const tx = token.initialize(ZeroAddress, true);

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
