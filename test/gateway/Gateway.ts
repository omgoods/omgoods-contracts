import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, testing } from 'hardhat';
import { expect } from 'chai';
import { setupGateway } from './fixtures';
import { GATEWAY_REQUEST, GATEWAY_REQUEST_BATCH } from './constants';
import { randomHash } from 'hardhat/internal/hardhat-network/provider/utils/random';

const { ZeroAddress } = ethers;

const { randomAddress } = testing;

describe('gateway/Gateway', () => {
  let fixture: Awaited<ReturnType<typeof setupGateway>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupGateway);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('getNextNonce()', () => {
      it('expect to return the correct nonce', async () => {
        const { gateway } = fixture;

        const res = await gateway.getNextNonce(randomAddress());

        expect(res).eq(0);
      });
    });

    describe('hashRequest()', () => {
      it('expect to return the correct hash', async () => {
        const { gateway, requestEncoder } = fixture;

        const res = await gateway.hashRequest(GATEWAY_REQUEST);

        expect(res).eq(requestEncoder.hash(GATEWAY_REQUEST));
      });
    });

    describe('hashRequestBatch()', () => {
      it('expect to return the correct hash', async () => {
        const { gateway, requestBatchEncoder } = fixture;

        const res = await gateway.hashRequestBatch(GATEWAY_REQUEST_BATCH);

        expect(res).eq(requestBatchEncoder.hash(GATEWAY_REQUEST_BATCH));
      });
    });
  });

  describe('# setters', () => {
    describe('sendRequest()', () => {
      createBeforeHook();

      it('expect to revert when sending to the zero address', async () => {
        const { gateway } = fixture;

        const tx = gateway.sendRequest(ZeroAddress, '0x');

        await expect(tx).revertedWithCustomError(
          gateway,
          'CallToTheZeroAddress',
        );
      });

      it('expect to revert due to the reverted call', async () => {
        const { gateway, erc1271AccountMock } = fixture;

        const tx = gateway.sendRequest(
          await erc1271AccountMock.getAddress(),
          erc1271AccountMock.interface.encodeFunctionData('setOwner', [
            ZeroAddress,
          ]),
        );

        await expect(tx).revertedWithCustomError(
          erc1271AccountMock,
          'OwnerIsTheZeroAddress',
        );
      });

      it('expect request to be sent successfully', async () => {
        const { gateway, gatewayRecipientMock, signers } = fixture;

        const account = signers.unknown.at(0);
        const to = await gatewayRecipientMock.getAddress();
        const data =
          gatewayRecipientMock.interface.encodeFunctionData('emitMsgSender');

        const tx = gateway.connect(account).sendRequest(to, data);

        await expect(tx)
          .emit(gateway, 'RequestSent')
          .withArgs(account.address, 0, to, data);

        await expect(tx)
          .emit(gatewayRecipientMock, 'MsgSender')
          .withArgs(account.address);
      });
    });

    describe('sendRequestBatch()', () => {
      createBeforeHook();

      it('expect to revert when the request batch is empty', async () => {
        const { gateway } = fixture;

        const tx = gateway.sendRequestBatch([], []);

        await expect(tx).revertedWithCustomError(gateway, 'EmptyRequestBatch');
      });

      it('expect to revert when the request batch size is invalid', async () => {
        const { gateway } = fixture;

        const tx = gateway.sendRequestBatch([randomAddress()], []);

        await expect(tx).revertedWithCustomError(
          gateway,
          'InvalidRequestBatchSize',
        );
      });

      it('expect request batch to be sent successfully', async () => {
        const { gateway, gatewayRecipientMock, signers } = fixture;

        const account = signers.unknown.at(0);
        const to = [await gatewayRecipientMock.getAddress()];
        const data = [
          gatewayRecipientMock.interface.encodeFunctionData('emitMsgSender'),
        ];

        const tx = gateway.connect(account).sendRequestBatch(to, data);

        await expect(tx).not.emit(gateway, 'RequestSent');

        await expect(tx)
          .emit(gateway, 'RequestBatchSent')
          .withArgs(account.address, 0, to, data);

        await expect(tx)
          .emit(gatewayRecipientMock, 'MsgSender')
          .withArgs(account.address);
      });
    });

    describe('forwardRequest()', () => {
      createBeforeHook();

      it('expect to revert when the account is the zero address', async () => {
        const { gateway } = fixture;

        const tx = gateway.forwardRequest(
          ZeroAddress,
          GATEWAY_REQUEST.to,
          GATEWAY_REQUEST.data,
          GATEWAY_REQUEST.data,
        );

        await expect(tx).revertedWithCustomError(
          gateway,
          'AccountIsTheZeroAddress',
        );
      });

      it('expect to revert when the request signature is invalid', async () => {
        const { gateway, signers } = fixture;

        const tx = gateway.forwardRequest(
          GATEWAY_REQUEST.account,
          GATEWAY_REQUEST.to,
          GATEWAY_REQUEST.data,
          await signers.owner.signMessage('aaa'),
        );

        await expect(tx).revertedWithCustomError(gateway, 'InvalidSignature');
      });

      it('expect to revert when the request signer is not the account owner', async () => {
        const { gateway, signers, erc1271AccountMock } = fixture;

        const tx = gateway.forwardRequest(
          erc1271AccountMock,
          GATEWAY_REQUEST.to,
          GATEWAY_REQUEST.data,
          await signers.owner.signMessage('aaa'),
        );

        await expect(tx).revertedWithCustomError(gateway, 'InvalidSignature');
      });

      it('expect request to be sent successfully', async () => {
        const { gateway, gatewayRecipientMock, requestEncoder, signers } =
          fixture;

        const signer = signers.unknown.at(0);

        const request = {
          ...GATEWAY_REQUEST,
          account: signer.address,
          to: await gatewayRecipientMock.getAddress(),
          data: gatewayRecipientMock.interface.encodeFunctionData(
            'emitMsgSender',
          ),
        };

        const tx = gateway
          .connect(signers.forwarder)
          .forwardRequest(
            request.account,
            request.to,
            request.data,
            await requestEncoder.sign(signer, request),
          );

        await expect(tx)
          .emit(gateway, 'RequestSent')
          .withArgs(request.account, request.nonce, request.to, request.data);

        await expect(tx)
          .emit(gatewayRecipientMock, 'MsgSender')
          .withArgs(request.account);

        expect(await gateway.getNextNonce(request.account)).eq(
          request.nonce + 1,
        );
      });
    });

    describe('forwardRequestBatch()', () => {
      it('expect request batch to be sent successfully', async () => {
        const {
          gateway,
          gatewayRecipientMock,
          erc1271AccountMock,
          requestBatchEncoder,
          signers,
        } = fixture;

        const signer = signers.owner;

        const requestBatch = {
          ...GATEWAY_REQUEST_BATCH,
          account: await erc1271AccountMock.getAddress(),
          to: [await gatewayRecipientMock.getAddress()],
          data: [
            gatewayRecipientMock.interface.encodeFunctionData('emitMsgSender'),
          ],
        };

        const tx = gateway
          .connect(signers.forwarder)
          .forwardRequestBatch(
            requestBatch.account,
            requestBatch.to,
            requestBatch.data,
            await requestBatchEncoder.sign(signer, requestBatch),
          );

        await expect(tx)
          .emit(gateway, 'RequestBatchSent')
          .withArgs(
            requestBatch.account,
            requestBatch.nonce,
            requestBatch.to,
            requestBatch.data,
          );

        await expect(tx)
          .emit(gatewayRecipientMock, 'MsgSender')
          .withArgs(requestBatch.account);

        expect(await gateway.getNextNonce(requestBatch.account)).eq(
          requestBatch.nonce + 1,
        );
      });
    });
  });
});
