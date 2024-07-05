import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { concat } from 'ethers';
import { expect } from 'chai';
import { abiCoder, randomAddress } from '../common';
import { deployForwarderContextMock } from './fixtures';

describe('metatx/ForwarderContext // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployForwarderContextMock>>;

  before(async () => {
    fixture = await loadFixture(deployForwarderContextMock);
  });

  describe('# getters', () => {
    describe('forwarder()', () => {
      it('expect to return the forwarder', async () => {
        const { forwarderContext, signers } = fixture;

        const res = await forwarderContext.forwarder();

        expect(res).eq(signers.forwarder.address);
      });
    });

    describe('_msgSender()', () => {
      it('expect it to return the correct address for calls from the forwarder', async () => {
        const { forwarderContext, signers } = fixture;

        const sender = randomAddress();

        const res = await signers.forwarder.call({
          to: forwarderContext,
          data: concat([
            forwarderContext.interface.encodeFunctionData('msgSender'),
            sender,
          ]),
        });

        expect(res).eq(abiCoder.encode(['address'], [sender]));
      });

      it('expect it to return the correct address for calls from outside the forwarder', async () => {
        const { forwarderContext, signers } = fixture;

        const sender = signers.unknown.at(0);

        const res = await forwarderContext.connect(sender).msgSender();

        expect(res).eq(sender.address);
      });
    });
  });
});
