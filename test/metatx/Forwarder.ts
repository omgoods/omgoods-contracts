import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyUint } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { ZeroAddress } from 'ethers';
import { utils } from 'hardhat';
import { expect } from 'chai';
import { setupForwarder } from './fixtures';
import { FORWARDER_REQUEST, FORWARDER_REQUEST_BATCH } from './constants';

const { randomAddress } = utils;

describe('metatx/Forwarder', () => {
  let fixture: Awaited<ReturnType<typeof setupForwarder>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupForwarder);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('getNextNonce()', () => {
      it('expect to return the correct nonce', async () => {
        const { forwarder } = fixture;

        const res = await forwarder.getNextNonce(randomAddress());

        expect(res).eq(0);
      });
    });

    describe('hashRequest()', () => {
      it('expect to return the correct hash', async () => {
        const { forwarder, typedDataHelper } = fixture;

        const res = await forwarder.hashRequest(FORWARDER_REQUEST);

        expect(res).eq(typedDataHelper.hash('Request', FORWARDER_REQUEST));
      });
    });

    describe('hashRequestBatch()', () => {
      it('expect to return the correct hash', async () => {
        const { forwarder, typedDataHelper } = fixture;

        const res = await forwarder.hashRequestBatch(FORWARDER_REQUEST_BATCH);

        expect(res).eq(
          typedDataHelper.hash('RequestBatch', FORWARDER_REQUEST_BATCH),
        );
      });
    });
  });

  describe('# setters', () => {
    describe('sendRequest()', () => {
      createBeforeHook();

      it('expect to revert when sending to the zero address', async () => {
        const { forwarder } = fixture;

        const tx = forwarder.sendRequest(ZeroAddress, '0x');

        await expect(tx).revertedWithCustomError(
          forwarder,
          'CallToTheZeroAddress',
        );
      });

      it('expect to revert due to the reverted call', async () => {
        const { forwarder, account } = fixture;

        const tx = forwarder.sendRequest(
          await account.getAddress(),
          account.interface.encodeFunctionData('setOwner', [ZeroAddress]),
        );

        await expect(tx).revertedWithCustomError(
          account,
          'OwnerIsTheZeroAddress',
        );
      });

      it('expect request to be sent successfully', async () => {
        const { forwarder, forwarderContext, signers } = fixture;

        const account = signers.unknown.at(0);
        const to = await forwarderContext.getAddress();
        const data =
          forwarderContext.interface.encodeFunctionData('emitMsgSender');

        const tx = forwarder.connect(account).sendRequest(to, data);

        await expect(tx)
          .emit(forwarder, 'RequestSent')
          .withArgs(account.address, 0, to, data, anyUint);

        await expect(tx)
          .emit(forwarderContext, 'MsgSender')
          .withArgs(account.address);
      });
    });

    describe('sendRequestBatch()', () => {
      createBeforeHook();

      it('expect to revert when the request batch is empty', async () => {
        const { forwarder } = fixture;

        const tx = forwarder.sendRequestBatch([], []);

        await expect(tx).revertedWithCustomError(
          forwarder,
          'EmptyRequestBatch',
        );
      });

      it('expect to revert when the request batch size is invalid', async () => {
        const { forwarder } = fixture;

        const tx = forwarder.sendRequestBatch([randomAddress()], []);

        await expect(tx).revertedWithCustomError(
          forwarder,
          'InvalidRequestBatchSize',
        );
      });

      it('expect request batch to be sent successfully', async () => {
        const { forwarder, forwarderContext, signers } = fixture;

        const account = signers.unknown.at(0);
        const to = [await forwarderContext.getAddress()];
        const data = [
          forwarderContext.interface.encodeFunctionData('emitMsgSender'),
        ];

        const tx = forwarder.connect(account).sendRequestBatch(to, data);

        await expect(tx).not.emit(forwarder, 'RequestSent');

        await expect(tx)
          .emit(forwarder, 'RequestBatchSent')
          .withArgs(account.address, 0, to, data, anyUint);

        await expect(tx)
          .emit(forwarderContext, 'MsgSender')
          .withArgs(account.address);
      });
    });

    describe('forwardRequest()', () => {
      createBeforeHook();

      it('expect to revert when the account is the zero address', async () => {
        const { forwarder } = fixture;

        const tx = forwarder.forwardRequest(
          ZeroAddress,
          FORWARDER_REQUEST.to,
          FORWARDER_REQUEST.data,
          FORWARDER_REQUEST.data,
        );

        await expect(tx).revertedWithCustomError(
          forwarder,
          'AccountIsTheZeroAddress',
        );
      });

      it('expect to revert when the request signature is invalid', async () => {
        const { forwarder, signers } = fixture;

        const tx = forwarder.forwardRequest(
          FORWARDER_REQUEST.account,
          FORWARDER_REQUEST.to,
          FORWARDER_REQUEST.data,
          await signers.owner.signMessage('aaa'),
        );

        await expect(tx).revertedWithCustomError(forwarder, 'InvalidSignature');
      });

      it('expect to revert when the request signer is not the account owner', async () => {
        const { forwarder, signers, account } = fixture;

        const tx = forwarder.forwardRequest(
          account,
          FORWARDER_REQUEST.to,
          FORWARDER_REQUEST.data,
          await signers.owner.signMessage('aaa'),
        );

        await expect(tx).revertedWithCustomError(forwarder, 'InvalidSignature');
      });

      it('expect request to be sent successfully', async () => {
        const { forwarder, forwarderContext, typedDataHelper, signers } =
          fixture;

        const signer = signers.unknown.at(0);

        const request = {
          ...FORWARDER_REQUEST,
          account: signer.address,
          to: await forwarderContext.getAddress(),
          data: forwarderContext.interface.encodeFunctionData('emitMsgSender'),
        };

        const tx = forwarder
          .connect(signers.forwarder)
          .forwardRequest(
            request.account,
            request.to,
            request.data,
            await typedDataHelper.sign(signer, 'Request', request),
          );

        await expect(tx)
          .emit(forwarder, 'RequestSent')
          .withArgs(
            request.account,
            request.nonce,
            request.to,
            request.data,
            anyUint,
          );

        await expect(tx)
          .emit(forwarderContext, 'MsgSender')
          .withArgs(request.account);

        expect(await forwarder.getNextNonce(request.account)).eq(
          request.nonce + 1,
        );
      });
    });

    describe('forwardRequestBatch()', () => {
      it('expect request batch to be sent successfully', async () => {
        const {
          forwarder,
          forwarderContext,
          account,
          typedDataHelper,
          signers,
        } = fixture;

        const signer = signers.owner;

        const requestBatch = {
          ...FORWARDER_REQUEST_BATCH,
          account: await account.getAddress(),
          to: [await forwarderContext.getAddress()],
          data: [
            forwarderContext.interface.encodeFunctionData('emitMsgSender'),
          ],
        };

        const tx = forwarder
          .connect(signers.forwarder)
          .forwardRequestBatch(
            requestBatch.account,
            requestBatch.to,
            requestBatch.data,
            await typedDataHelper.sign(signer, 'RequestBatch', requestBatch),
          );

        await expect(tx)
          .emit(forwarder, 'RequestBatchSent')
          .withArgs(
            requestBatch.account,
            requestBatch.nonce,
            requestBatch.to,
            requestBatch.data,
            anyUint,
          );

        await expect(tx)
          .emit(forwarderContext, 'MsgSender')
          .withArgs(requestBatch.account);

        expect(await forwarder.getNextNonce(requestBatch.account)).eq(
          requestBatch.nonce + 1,
        );
      });
    });
  });
});
