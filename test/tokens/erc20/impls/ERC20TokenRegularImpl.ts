import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { ethers, utils } from 'hardhat';
import { expect } from 'chai';
import { TOKEN_METADATA, TokenNotificationKinds } from '../../constants';
import { setupTokenRegularImpl } from './fixtures';

const { AbiCoder, ZeroAddress } = ethers;
const { randomAddress } = utils;

describe('tokens/erc20/impls/ERC20TokenRegularImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupTokenRegularImpl>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupTokenRegularImpl);
    });
  };

  describe('# deployment', () => {
    createBeforeHook();

    describe('initialize()', () => {
      it('expect to revert when the msg.sender is not the factory', async () => {
        const { signers, token } = fixture;

        const tx = token
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress, ZeroAddress, ZeroAddress, '', '', 0, false);

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheFactory',
        );
      });
    });
  });

  describe('# getters', () => {
    createBeforeHook();

    describe('hashInitialization()', () => {
      it('expect to return initialization hash', async () => {
        const { tokenImpl, tokenImplTypedData } = fixture;

        const typedData = {
          owner: randomAddress(),
          controller: randomAddress(),
          name: TOKEN_METADATA.name,
          symbol: TOKEN_METADATA.symbol,
          decimals: TOKEN_METADATA.decimals,
          ready: true,
        };

        const res = await tokenImpl.hashInitialization(typedData);

        expect(res).eq(tokenImplTypedData.hash('Initialization', typedData));
      });
    });
  });

  describe('# setters', () => {
    describe('mint()', () => {
      createBeforeHook();

      it('expect to revert when msg.sender is not the current manager', async () => {
        const { signers, token } = fixture;

        const tx = token
          .connect(signers.unknown.at(0))
          .mint(randomAddress(), 0);

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect to mint the tokens', async () => {
        const { signers, token, tokenFactory } = fixture;

        const to = randomAddress();
        const value = 100;

        const tx = token.connect(signers.owner).mint(to, value);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(ZeroAddress, to, value);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.ERC20Update,
            AbiCoder.defaultAbiCoder().encode(
              ['address', 'address', 'uint8'],
              [ZeroAddress, to, value],
            ),
            anyValue,
          );
      });
    });

    describe('burn()', () => {
      createBeforeHook();

      it('expect to revert when msg.sender is not the current manager', async () => {
        const { signers, token } = fixture;

        const tx = token
          .connect(signers.unknown.at(0))
          .burn(randomAddress(), 0);

        await expect(tx).revertedWithCustomError(
          token,
          'MsgSenderIsNotTheOwner',
        );
      });

      it('expect to burn the tokens', async () => {
        const { signers, token, tokenFactory } = fixture;

        const from = signers.owner.address;
        const value = 100;

        const tx = token.connect(signers.owner).burn(from, value);

        await expect(tx)
          .emit(token, 'Transfer')
          .withArgs(from, ZeroAddress, value);

        await expect(tx)
          .emit(tokenFactory, 'TokenNotification')
          .withArgs(
            await token.getAddress(),
            TokenNotificationKinds.ERC20Update,
            AbiCoder.defaultAbiCoder().encode(
              ['address', 'address', 'uint8'],
              [from, ZeroAddress, value],
            ),
            anyValue,
          );
      });
    });
  });
});
