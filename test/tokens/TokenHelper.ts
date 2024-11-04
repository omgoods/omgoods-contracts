import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { utils } from 'hardhat';
import { expect } from 'chai';
import { setupTokenHelper } from './fixtures';

const { randomAddress } = utils;

describe('tokens/TokenHelper', () => {
  let fixture: Awaited<ReturnType<typeof setupTokenHelper>>;

  before(async () => {
    fixture = await loadFixture(setupTokenHelper);
  });

  describe('# getters', () => {
    describe('getTokenMetadata()', () => {
      it('expect to return empty metadata for non-contract', async () => {
        const { tokenHelper } = fixture;

        const res = await tokenHelper.getTokenMetadata(randomAddress());

        expect(res[0]).empty;
        expect(res[1]).empty;
        expect(res[2]).eq(0);
      });

      it('expect to return empty metadata for non-token', async () => {
        const { tokenHelper } = fixture;

        const res = await tokenHelper.getTokenMetadata(tokenHelper);

        expect(res[0]).empty;
        expect(res[1]).empty;
        expect(res[2]).eq(0);
      });

      it('expect to return ERC20 token metadata', async () => {
        const { tokenHelper, erc20Token } = fixture;

        const res = await tokenHelper.getTokenMetadata(erc20Token);

        expect(res[0]).eq(await erc20Token.name());
        expect(res[1]).eq(await erc20Token.symbol());
        expect(res[2]).eq(await erc20Token.decimals());
      });

      it('expect to return ERC721 token metadata', async () => {
        const { tokenHelper, erc721Token } = fixture;

        const res = await tokenHelper.getTokenMetadata(erc721Token);

        expect(res[0]).eq(await erc721Token.name());
        expect(res[1]).eq(await erc721Token.symbol());
        expect(res[2]).eq(0);
      });
    });
  });
});
