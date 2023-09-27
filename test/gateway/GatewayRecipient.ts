import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { concat, AbiCoder } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../common';
import { deployGatewayRecipientMock } from './fixtures';

describe('gateway/GatewayRecipient // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployGatewayRecipientMock>>;

  before(async () => {
    fixture = await loadFixture(deployGatewayRecipientMock);
  });

  describe('# getters', () => {
    describe('getGateway()', () => {
      it('expect to return the gateway', async () => {
        const { gatewayRecipient, signers } = fixture;

        const res = await gatewayRecipient.getGateway();

        expect(res).eq(signers.gateway.address);
      });
    });

    describe('_msgSender()', () => {
      it('expect it to return the correct address for calls from the gateway', async () => {
        const { gatewayRecipient, signers } = fixture;

        const sender = randomAddress();

        const res = await signers.gateway.call({
          to: gatewayRecipient,
          data: concat([
            gatewayRecipient.interface.encodeFunctionData('msgSender'),
            sender,
          ]),
        });

        expect(res).eq(
          AbiCoder.defaultAbiCoder().encode(['address'], [sender]),
        );
      });

      it('expect it to return the correct address for calls from outside the gateway', async () => {
        const { gatewayRecipient, signers } = fixture;

        const sender = signers.unknown.at(0);

        const res = await gatewayRecipient.connect(sender).msgSender();

        expect(res).eq(sender.address);
      });
    });
  });
});
