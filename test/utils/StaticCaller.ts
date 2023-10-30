import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomHex, abiCoder } from '../common';
import { deployStaticCaller } from './fixtures';

describe('utils/StaticCaller', () => {
  let fixture: Awaited<ReturnType<typeof deployStaticCaller>>;

  before(async () => {
    fixture = await loadFixture(deployStaticCaller);
  });

  describe('# getters', () => {
    describe('callTarget()', () => {
      it('expect to omit the result if the target is the zero address', async () => {
        const { staticCaller } = fixture;

        const res = await staticCaller.callTarget(ZeroAddress, [randomHex()]);

        expect(res).empty;
      });

      it('expect to return the empty response for a failed call', async () => {
        const { staticCaller, erc721Token, erc20Token } = fixture;

        const res = await staticCaller.callTarget(erc721Token, [
          erc20Token.interface.encodeFunctionData('decimals'),
        ]);

        expect(res[0]).eq('0x');
      });

      it('expect to return an array of the correct responses', async () => {
        const { staticCaller, erc20Token } = fixture;

        const res = await staticCaller.callTarget(erc20Token, [
          erc20Token.interface.encodeFunctionData('name'),
          erc20Token.interface.encodeFunctionData('symbol'),
          erc20Token.interface.encodeFunctionData('decimals'),
        ]);

        expect(res[0]).same.eq(
          abiCoder.encode(['string'], [await erc20Token.name()]),
        );
        expect(res[1]).same.eq(
          abiCoder.encode(['string'], [await erc20Token.symbol()]),
        );
        expect(res[2]).same.eq(
          abiCoder.encode(['uint8'], [await erc20Token.decimals()]),
        );
      });
    });

    describe('callTargets()', () => {
      it('expect to omit the result if the targets and the data length are not the same', async () => {
        const { staticCaller } = fixture;

        const res = await staticCaller.callTargets([], [randomHex()]);

        expect(res).empty;
      });

      it('expect to return the empty response for the zero address targets', async () => {
        const { staticCaller } = fixture;

        const res = await staticCaller.callTargets(
          [ZeroAddress],
          [randomHex()],
        );

        expect(res[0]).eq('0x');
      });

      it('expect to return the empty response for a failed call', async () => {
        const { staticCaller, erc721Token, erc20Token } = fixture;

        const res = await staticCaller.callTargets(
          [erc721Token],
          [erc20Token.interface.encodeFunctionData('decimals')],
        );

        expect(res[0]).eq('0x');
      });

      it('expect to return an array of the correct responses', async () => {
        const { staticCaller, erc20Token } = fixture;

        const res = await staticCaller.callTargets(
          [erc20Token, erc20Token, erc20Token],
          [
            erc20Token.interface.encodeFunctionData('name'),
            erc20Token.interface.encodeFunctionData('symbol'),
            erc20Token.interface.encodeFunctionData('decimals'),
          ],
        );

        expect(res[0]).same.eq(
          abiCoder.encode(['string'], [await erc20Token.name()]),
        );
        expect(res[1]).same.eq(
          abiCoder.encode(['string'], [await erc20Token.symbol()]),
        );
        expect(res[2]).same.eq(
          abiCoder.encode(['uint8'], [await erc20Token.decimals()]),
        );
      });
    });
  });
});
