import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { FIXED_TOKEN } from './constants';
import { setupERC20FixedTokenFactory } from './fixtures';
import { ZeroAddress } from 'ethers';

describe('tokens/erc20/presets/ERC20FixedTokenFactory', () => {
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

        const res = await tokenFactory.hashToken(FIXED_TOKEN);

        expect(res).eq(typeDataHelper.hash('Token', FIXED_TOKEN));
      });
    });
  });

  describe('# setters', () => {
    describe('createToken()', () => {
      it('expect to revert when the owner is the zero address', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.createToken(
          {
            ...FIXED_TOKEN,
            owner: ZeroAddress,
          },
          '0x',
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'TokenOwnerIsTheZeroAddress',
        );
      });

      it('expect to revert when the total supply is the zero', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.createToken(
          {
            ...FIXED_TOKEN,
            totalSupply: 0,
          },
          '0x',
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'InvalidTokenTotalSupply',
        );
      });

      it('expect to revert when the signature is invalid', async () => {
        const { tokenFactory, typeDataHelper, signers } = fixture;

        const sender = signers.unknown.at(0);

        const tx = tokenFactory
          .connect(sender)
          .createToken(
            FIXED_TOKEN,
            await typeDataHelper.sign(sender, 'Token', FIXED_TOKEN),
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
