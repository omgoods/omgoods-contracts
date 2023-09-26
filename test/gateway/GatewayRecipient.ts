import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { concat } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../helpers';
import { deployGatewayRecipientMock } from './fixtures';

describe('gateway/GatewayRecipient // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployGatewayRecipientMock>>;

  before(async () => {
    fixture = await loadFixture(deployGatewayRecipientMock);
  });

  describe('# getters', () => {
    describe('getGateway()', () => {
      it('expect to return the gateway', async () => {
        const { gatewayRecipientMock, signers } = fixture;

        const res = await gatewayRecipientMock.getGateway();

        expect(res).eq(signers.gateway.address);
      });
    });

    describe('_msgSender()', () => {
      it('expect it to return the correct address for calls from the gateway', async () => {
        const { gatewayRecipientMock, signers } = fixture;

        const sender = randomAddress();

        const tx = signers.gateway.sendTransaction({
          to: gatewayRecipientMock,
          data: concat([
            gatewayRecipientMock.interface.encodeFunctionData('emitMsgSender'),
            sender,
          ]),
        });

        await expect(tx)
          .emit(gatewayRecipientMock, 'MsgSender')
          .withArgs(sender);
      });

      it('expect it to return the correct address for calls from outside the gateway', async () => {
        const { gatewayRecipientMock, signers } = fixture;

        const sender = signers.unknown.at(0);

        const tx = gatewayRecipientMock.connect(sender).emitMsgSender();

        await expect(tx)
          .emit(gatewayRecipientMock, 'MsgSender')
          .withArgs(sender.address);
      });
    });
  });
});
