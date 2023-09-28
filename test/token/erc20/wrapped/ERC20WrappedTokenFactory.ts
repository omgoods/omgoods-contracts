import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ZeroAddress } from 'ethers';
import { randomAddress } from '../../../common';
import { TOKEN } from '../../constants';
import { setupERC20WrappedTokenFactory } from './fixtures';

describe('token/erc20/wrapped/ERC20WrappedTokenFactory', () => {
  let fixture: Awaited<ReturnType<typeof setupERC20WrappedTokenFactory>>;

  before(async () => {
    fixture = await loadFixture(setupERC20WrappedTokenFactory);
  });

  describe('# getters', () => {
    describe('computeToken()', () => {
      it('expect to return the correct address', async () => {
        const { tokenFactory, computeToken } = fixture;

        const underlyingToken = randomAddress();

        const res = await tokenFactory.computeToken(underlyingToken);

        expect(res).eq(computeToken(underlyingToken));
      });
    });

    describe('hashToken()', () => {
      it('expect to return the correct hash', async () => {
        const { tokenFactory, typeDataHelper } = fixture;

        const underlyingToken = randomAddress();

        const res = await tokenFactory.hashToken(underlyingToken);

        expect(res).eq(
          typeDataHelper.hash('Token', {
            underlyingToken,
          }),
        );
      });
    });
  });

  describe('# setters', () => {
    describe('creatToken()', () => {
      it('expect to revert when the underlying token is the zero address', async () => {
        const { tokenFactory } = fixture;

        const tx = tokenFactory.createToken(ZeroAddress, '0x');

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'UnderlyingTokenIsTheZeroAddress',
        );
      });

      it('expect to revert when the underlying token is not supported', async () => {
        const { tokenFactory, unsupportedToken } = fixture;

        const tx = tokenFactory.createToken(unsupportedToken, '0x');

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'UnsupportedUnderlyingToken',
        );
      });

      it('expect to revert when the signature is invalid', async () => {
        const { tokenFactory, typeDataHelper, signers, supportedToken } =
          fixture;

        const sender = signers.unknown.at(0);

        const underlyingToken = await supportedToken.getAddress();

        const tx = tokenFactory.connect(sender).createToken(
          underlyingToken,
          await typeDataHelper.sign(sender, 'Token', {
            underlyingToken,
          }),
        );

        await expect(tx).revertedWithCustomError(
          tokenFactory,
          'InvalidGuardianSignature',
        );
      });

      it('expect to create a token', async () => {
        const {
          tokenFactory,
          typeDataHelper,
          signers,
          computeToken,
          supportedToken,
        } = fixture;

        const sender = signers.unknown.at(0);

        const underlyingToken = await supportedToken.getAddress();

        const tx = tokenFactory.connect(sender).createToken(
          underlyingToken,
          await typeDataHelper.sign(signers.guardian, 'Token', {
            underlyingToken,
          }),
        );

        await expect(tx)
          .emit(tokenFactory, 'TokenCreated')
          .withArgs(
            computeToken(underlyingToken),
            TOKEN.name,
            TOKEN.symbol,
            underlyingToken,
          );
      });
    });
  });
});
