import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { concat, AbiCoder, ZeroAddress } from 'ethers';
import { randomAddress } from '../../common';
import { TOKEN } from '../constants';
import { setupERC20TokenFactoryMock } from './fixtures';

describe('tokens/erc20/ERC20TokenImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupERC20TokenFactoryMock>>;

  before(async () => {
    fixture = await loadFixture(setupERC20TokenFactoryMock);
  });

  describe('# getters', () => {
    describe('name()', () => {
      it('expect to return the name', async () => {
        const { tokenImpl } = fixture;

        const res = await tokenImpl.name();

        expect(res).eq(TOKEN.name);
      });
    });

    describe('name()', () => {
      it('expect to return the symbol', async () => {
        const { tokenImpl } = fixture;

        const res = await tokenImpl.symbol();

        expect(res).eq(TOKEN.symbol);
      });
    });

    describe('_msgSender()', () => {
      it('expect it to return the correct address for calls from the gateway', async () => {
        const { tokenImpl, signers } = fixture;

        const sender = randomAddress();

        const res = await signers.gateway.call({
          to: tokenImpl,
          data: concat([
            tokenImpl.interface.encodeFunctionData('msgSender'),
            sender,
          ]),
        });

        expect(res).eq(
          AbiCoder.defaultAbiCoder().encode(['address'], [sender]),
        );
      });

      it('expect it to return the correct address for calls from outside the gateway', async () => {
        const { tokenImpl, signers } = fixture;

        const sender = signers.unknown.at(0);

        const res = await tokenImpl.connect(sender).msgSender();

        expect(res).eq(sender.address);
      });
    });
  });

  describe('# setters', () => {
    describe('_update()', () => {
      it('expect to emit an event in the token factory', async () => {
        const { tokenImpl, tokenFactory } = fixture;

        const from = ZeroAddress;
        const to = randomAddress();
        const value = 100;

        const tx = tokenImpl.update(from, to, value);

        await expect(tx)
          .emit(tokenFactory, 'TokenTransfer')
          .withArgs(await tokenImpl.getAddress(), from, to, value);
      });
    });

    describe('_approve()', () => {
      it('expect to emit an event in the token factory', async () => {
        const { tokenImpl, tokenFactory, signers } = fixture;

        const owner = signers.unknown.at(0);
        const spender = randomAddress();
        const value = 100;

        const tx = tokenImpl.connect(owner).approve(spender, value);

        await expect(tx)
          .emit(tokenFactory, 'TokenApproval')
          .withArgs(
            await tokenImpl.getAddress(),
            owner.address,
            spender,
            value,
          );
      });
    });
  });
});
