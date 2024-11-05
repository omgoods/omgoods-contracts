import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, utils } from 'hardhat';
import { expect } from 'chai';
import { setupForwarderContextMock } from './fixtures';

const { concat } = ethers;
const { randomAddress, abiCoder } = utils;

describe('metatx/ForwarderContext // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupForwarderContextMock>>;

  before(async () => {
    fixture = await loadFixture(setupForwarderContextMock);
  });

  describe('# getters', () => {
    describe('forwarder()', () => {
      it('expect to return the forwarder', async () => {
        const { forwarderContext, signers } = fixture;

        const res = await forwarderContext.getForwarder();

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
