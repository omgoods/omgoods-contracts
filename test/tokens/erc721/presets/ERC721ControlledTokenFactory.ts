import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { randomAddress } from '../../../common';
import { TOKEN } from '../../constants';
import { setupERC721ControlledTokenFactory } from './fixtures';

describe('tokens/erc721/presets/ERC721ControlledTokenFactory', () => {
  let fixture: Awaited<ReturnType<typeof setupERC721ControlledTokenFactory>>;

  before(async () => {
    fixture = await loadFixture(setupERC721ControlledTokenFactory);
  });

  describe('# getters', () => {
    describe('computeToken()', () => {
      it('expect to return the correct address', async () => {
        const { tokenFactory, computeToken } = fixture;

        const res = await tokenFactory.computeToken(TOKEN.symbol);

        expect(res).eq(computeToken(TOKEN.symbol));
      });
    });

    describe('hashToken()', () => {
      it('expect to return the correct hash', async () => {
        const { tokenFactory, typeDataHelper } = fixture;

        const tokenData = {
          ...TOKEN,
          controllers: [randomAddress()],
        };

        const res = await tokenFactory.hashToken(tokenData);

        expect(res).eq(typeDataHelper.hash('Token', tokenData));
      });
    });
  });

  describe('# setters', () => {
    describe('createToken()', () => {
      it('expect to revert when the controllers list is empty', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.createToken(
          {
            ...TOKEN,
            controllers: [],
          },
          '0x',
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'NotEnoughTokenControllers',
        );
      });

      it('expect to revert when the signature is invalid', async () => {
        const { tokenFactory, typeDataHelper, signers } = fixture;

        const sender = signers.unknown.at(0);

        const tokenData = {
          ...TOKEN,
          controllers: [randomAddress()],
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
          ...TOKEN,
          symbol: 'NEW',
          controllers: [randomAddress()],
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
            tokenData.controllers,
          );
      });
    });
  });
});
