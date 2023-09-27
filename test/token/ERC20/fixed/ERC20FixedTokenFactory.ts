import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { randomAddress } from '../../../common';
import { FIXED_TOKEN } from './constants';
import { setupERC20FixedTokenFactory } from './fixtures';

describe('token/ERC20/fixed/ERC20FixedTokenFactory', () => {
  let fixture: Awaited<ReturnType<typeof setupERC20FixedTokenFactory>>;

  before(async () => {
    fixture = await loadFixture(setupERC20FixedTokenFactory);
  });

  describe('# getters', () => {
    describe('computeToken()', () => {
      it('expect to return the correct address', async () => {
        const { tokenFactory, computeToken } = fixture;

        const res = await tokenFactory.computeToken(FIXED_TOKEN.symbol);

        expect(res).eq(computeToken(FIXED_TOKEN.symbol));
      });
    });

    describe('hashToken()', () => {
      it('expect to return the correct hash', async () => {
        const { tokenFactory, typeDataHelper } = fixture;

        const tokenData = {
          ...FIXED_TOKEN,
          owner: randomAddress(),
        };

        const res = await tokenFactory.hashToken(tokenData);

        expect(res).eq(typeDataHelper.hash('Token', tokenData));
      });
    });
  });

  describe('# setters', () => {
    describe('creatToken()', () => {
      it('expect to revert when the signature is invalid', async () => {
        const { tokenFactory, typeDataHelper, signers } = fixture;

        const sender = signers.unknown.at(0);

        const tokenData = {
          ...FIXED_TOKEN,
          owner: randomAddress(),
        };

        const tx = tokenFactory
          .connect(sender)
          .createToken(
            tokenData,
            await typeDataHelper.sign(sender, 'Token', tokenData),
          );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'InvalidGuardianSignature',
        );
      });

      it('expect to create a token', async () => {
        const { tokenFactory, typeDataHelper, signers, computeToken } = fixture;

        const sender = signers.unknown.at(0);

        const tokenData = {
          ...FIXED_TOKEN,
          symbol: 'NEW',
          owner: randomAddress(),
        };

        const tx = tokenFactory
          .connect(sender)
          .createToken(
            tokenData,
            await typeDataHelper.sign(signers.guardian, 'Token', tokenData),
          );

        await expect(tx)
          .emit(tokenFactory, 'TokenCreated')
          .withArgs(
            computeToken(tokenData.symbol),
            tokenData.name,
            tokenData.symbol,
            tokenData.owner,
            tokenData.totalSupply,
          );
      });
    });
  });
});
