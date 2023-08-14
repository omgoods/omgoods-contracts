import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, helpers } from 'hardhat';
import { expect } from 'chai';
import { deployGateway, setupGateway } from './fixtures';

const { ZeroAddress, randomBytes, hashMessage } = ethers;

const { randomAddress, randomHex } = helpers;

describe('gateway/Gateway', () => {
  describe('# deployment', () => {
    let fixture: Awaited<ReturnType<typeof deployGateway>>;

    before(async () => {
      fixture = await loadFixture(deployGateway);
    });

    describe('initialize()', () => {
      it('expect to revert when the msg.sender is not the owner', async () => {
        const { gateway, signers } = fixture;

        const tx = gateway
          .connect(signers.unknown.at(0))
          .initialize(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          gateway,
          'MsgSenderIsNotTheContractOwner',
        );
      });

      it('expect to revert when the account registry is the zero address', async () => {
        const { gateway } = fixture;

        const tx = gateway.initialize(ZeroAddress);

        await expect(tx).revertedWithCustomError(
          gateway,
          'AccountRegistryIsTheZeroAddress',
        );
      });

      it('expect to initialize the contract', async () => {
        const { gateway } = fixture;

        const accountRegistry = randomAddress();

        const tx = gateway.initialize(accountRegistry);

        await expect(tx).emit(gateway, 'Initialized').withArgs(accountRegistry);
      });

      describe('# after initialization', () => {
        before(async () => {
          const { gateway } = fixture;

          if (!(await gateway.initialized())) {
            await gateway.initialize(randomAddress());
          }
        });

        it('expect to revert', async () => {
          const { gateway } = fixture;

          const tx = gateway.initialize(ZeroAddress);

          await expect(tx).revertedWithCustomError(
            gateway,
            'AlreadyInitialized',
          );
        });
      });
    });
  });

  let fixture: Awaited<ReturnType<typeof setupGateway>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(setupGateway);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('getNonce()', () => {
      it('expect to return the correct nonce', async () => {
        const { gateway } = fixture;

        const res = await gateway.getNonce(randomAddress());

        expect(res).eq(0);
      });
    });

    describe('hashRequest()', () => {
      it('expect to return the correct hash', async () => {
        const { gateway, requestTypeEncoder } = fixture;

        const request = {
          from: randomAddress(),
          nonce: 10,
          to: randomAddress(),
          value: 5,
          data: randomHex(20),
        };

        const res = await gateway.hashRequest(request);

        expect(res).eq(requestTypeEncoder.hash(request));
      });
    });

    describe('hashRequests()', () => {
      it('expect to return the correct hash', async () => {
        const { gateway, requestsTypeEncoder } = fixture;

        const requests = {
          from: randomAddress(),
          nonce: 10,
          to: [randomAddress(), randomAddress()],
          value: [5, 2],
          data: [randomHex(20), randomHex(10)],
        };

        const res = await gateway.hashRequests(requests);

        expect(res).eq(requestsTypeEncoder.hash(requests));
      });
    });

    describe('recoverTrustedSigner()', () => {
      it('expect to return the zero address when the signer is untrusted ', async () => {
        const { gateway, signers } = fixture;

        const res = await gateway.recoverTrustedSigner(
          randomAddress(),
          randomHex(),
          await signers.unknown.at(0).signMessage(randomHex()),
        );

        expect(res).eq(ZeroAddress);
      });

      it('expect to return the signer is equal to the account', async () => {
        const { gateway, signers } = fixture;

        const message = randomBytes(32);
        const hash = hashMessage(message);
        const signer = signers.unknown.at(0);

        const res = await gateway.recoverTrustedSigner(
          signer.address,
          hash,
          await signer.signMessage(message),
        );

        expect(res).eq(signer.address);
      });

      it('expect to return the signer when they are the account owner', async () => {
        const { gateway, accounts } = fixture;

        const message = randomBytes(32);
        const hash = hashMessage(message);
        const account = accounts.unknown;

        const res = await gateway.recoverTrustedSigner(
          account.address,
          hash,
          await account.owner.signMessage(message),
        );

        expect(res).eq(account.owner.address);
      });

      it('expect to return the account when the signer is the ERC1271 account owner', async () => {
        const { gateway, signers, erc1271AccountMock } = fixture;

        const message = randomBytes(32);
        const hash = hashMessage(message);
        const account = await erc1271AccountMock.getAddress();

        const res = await gateway.recoverTrustedSigner(
          account,
          hash,
          await signers.owner.signMessage(message),
        );

        expect(res).eq(account);
      });
    });
  });

  describe('# setters', () => {
    createBeforeHook();

    describe('sendRequest()', () => {
      it('expect to revert when sending to the zero address', async () => {
        const { gateway } = fixture;

        const tx = gateway.sendRequest(ZeroAddress, 0, '0x');

        await expect(tx).revertedWithCustomError(
          gateway,
          'RequestToTheZeroAddress',
        );
      });

      it('expect to revert when sending to the gateway address', async () => {
        const { gateway } = fixture;

        const tx = gateway.sendRequest(await gateway.getAddress(), 0, '0x');

        await expect(tx).revertedWithCustomError(
          gateway,
          'RequestToTheInvalidAddress',
        );
      });

      it('expect to revert due to the reverted call', async () => {
        const { gateway, accountRegistry } = fixture;

        const tx = gateway.sendRequest(
          await accountRegistry.getAddress(),
          0,
          accountRegistry.interface.encodeFunctionData('initialize', [
            ZeroAddress,
            ZeroAddress,
            ZeroAddress,
          ]),
        );

        await expect(tx).revertedWithCustomError(
          accountRegistry,
          'AlreadyInitialized',
        );
      });

      it('expect request to be sent successfully', async () => {
        const { gateway, gatewayRecipientMock, signers } = fixture;

        const sender = signers.unknown.at(0);
        const to = await gatewayRecipientMock.getAddress();
        const value = 0;
        const data =
          gatewayRecipientMock.interface.encodeFunctionData('emitMsgSender');

        const tx = gateway.connect(sender).sendRequest(to, value, data);

        await expect(tx)
          .emit(gateway, 'RequestSent')
          .withArgs(sender.address, sender.address, to, value, data);

        await expect(tx)
          .emit(gatewayRecipientMock, 'MsgSender')
          .withArgs(sender.address);
      });
    });

    describe('sendRequests()', () => {
      it('expect to revert when the requests batch is empty', async () => {
        const { gateway } = fixture;

        const tx = gateway.sendRequests([], [], []);

        await expect(tx).revertedWithCustomError(gateway, 'EmptyRequestsBatch');
      });

      it('expect to revert when the requests batch size is invalid', async () => {
        const { gateway } = fixture;

        let tx = gateway.sendRequests([randomAddress()], [], []);

        await expect(tx).revertedWithCustomError(
          gateway,
          'InvalidRequestsBatchSize',
        );

        tx = gateway.sendRequests([randomAddress()], [0], []);

        await expect(tx).revertedWithCustomError(
          gateway,
          'InvalidRequestsBatchSize',
        );
      });

      it('expect requests to be sent successfully', async () => {
        const { gateway, gatewayRecipientMock, signers } = fixture;

        const sender = signers.unknown.at(0);
        const to = [await gatewayRecipientMock.getAddress()];
        const value = [0];
        const data = [
          gatewayRecipientMock.interface.encodeFunctionData('emitMsgSender'),
        ];

        const tx = gateway.connect(sender).sendRequests(to, value, data);

        await expect(tx).not.emit(gateway, 'RequestSent');

        await expect(tx)
          .emit(gateway, 'RequestsSent')
          .withArgs(sender.address, sender.address, to, value, data);

        await expect(tx)
          .emit(gatewayRecipientMock, 'MsgSender')
          .withArgs(sender.address);
      });
    });

    describe('sendRequestFrom()', () => {
      it('expect to revert when sending from the zero address', async () => {
        const { gateway } = fixture;

        const tx = gateway.sendRequestFrom(ZeroAddress, ZeroAddress, 0, '0x');

        await expect(tx).revertedWithCustomError(
          gateway,
          'RequestFromTheZeroAddress',
        );
      });

      it('expect to revert when the sender is not trusted', async () => {
        const { gateway } = fixture;

        const tx = gateway.sendRequestFrom(
          randomAddress(),
          ZeroAddress,
          0,
          '0x',
        );

        await expect(tx).revertedWithCustomError(gateway, 'RequestForbidden');
      });

      it('expect request to be sent successfully', async () => {
        const { gateway, gatewayRecipientMock, accounts } = fixture;

        const account = accounts.created;
        const to = await gatewayRecipientMock.getAddress();
        const value = 0;
        const data =
          gatewayRecipientMock.interface.encodeFunctionData('emitMsgSender');

        const tx = gateway
          .connect(account.owner)
          .sendRequestFrom(account.address, to, value, data);

        await expect(tx)
          .emit(gateway, 'RequestSent')
          .withArgs(account.owner.address, account.address, to, value, data);

        await expect(tx)
          .emit(gatewayRecipientMock, 'MsgSender')
          .withArgs(account.address);
      });
    });

    describe('sendRequestsFrom()', () => {
      it('expect requests to be sent successfully', async () => {
        const { gateway, gatewayRecipientMock, accounts } = fixture;

        const account = accounts.created;
        const to = [await gatewayRecipientMock.getAddress()];
        const value = [0];
        const data = [
          gatewayRecipientMock.interface.encodeFunctionData('emitMsgSender'),
        ];

        const tx = gateway
          .connect(account.owner)
          .sendRequestsFrom(account.address, to, value, data);

        await expect(tx)
          .emit(gateway, 'RequestsSent')
          .withArgs(account.owner.address, account.address, to, value, data);

        await expect(tx)
          .emit(gatewayRecipientMock, 'MsgSender')
          .withArgs(account.address);
      });
    });

    describe('forwardRequest()', () => {
      it('expect to revert when the request nonce is invalid', async () => {
        const { gateway, signers } = fixture;

        const tx = gateway.forwardRequest(
          randomAddress(),
          1,
          ZeroAddress,
          0,
          '0x',
          await signers.owner.signMessage('aaa'),
        );

        await expect(tx).revertedWithCustomError(
          gateway,
          'InvalidRequestNonce',
        );
      });

      it('expect to revert when the request signature is invalid', async () => {
        const { gateway, signers } = fixture;

        const tx = gateway.forwardRequest(
          randomAddress(),
          0,
          ZeroAddress,
          0,
          '0x',
          await signers.owner.signMessage('aaa'),
        );

        await expect(tx).revertedWithCustomError(gateway, 'RequestForbidden');
      });

      it('expect request to be sent successfully', async () => {
        const { gateway, gatewayRecipientMock, accounts, requestTypeEncoder } =
          fixture;

        const account = accounts.created;
        const to = await gatewayRecipientMock.getAddress();
        const nonce = 0;
        const value = 0;
        const data =
          gatewayRecipientMock.interface.encodeFunctionData('emitMsgSender');

        const tx = gateway.connect(account.owner).forwardRequest(
          account.address,
          nonce,
          to,
          value,
          data,
          await account.owner.signTypedData(
            requestTypeEncoder.domain,
            requestTypeEncoder.types,
            {
              from: account.address,
              nonce,
              to,
              value,
              data,
            },
          ),
        );

        await expect(tx)
          .emit(gateway, 'NonceUpdated')
          .withArgs(account.address, nonce + 1);

        await expect(tx)
          .emit(gateway, 'RequestSent')
          .withArgs(account.owner.address, account.address, to, value, data);

        await expect(tx)
          .emit(gatewayRecipientMock, 'MsgSender')
          .withArgs(account.address);
      });
    });

    describe('forwardRequest()', () => {
      it('expect requests to be sent successfully', async () => {
        const { gateway, gatewayRecipientMock, accounts, requestsTypeEncoder } =
          fixture;

        const account = accounts.unknown;
        const nonce = 0;
        const to = [await gatewayRecipientMock.getAddress()];
        const value = [0];
        const data = [
          gatewayRecipientMock.interface.encodeFunctionData('emitMsgSender'),
        ];

        const tx = gateway.connect(account.owner).forwardRequests(
          account.address,
          nonce,
          to,
          value,
          data,
          await account.owner.signTypedData(
            requestsTypeEncoder.domain,
            requestsTypeEncoder.types,
            {
              from: account.address,
              nonce,
              to,
              value,
              data,
            },
          ),
        );

        await expect(tx)
          .emit(gateway, 'NonceUpdated')
          .withArgs(account.address, nonce + 1);

        await expect(tx)
          .emit(gateway, 'RequestsSent')
          .withArgs(account.owner.address, account.address, to, value, data);

        await expect(tx)
          .emit(gatewayRecipientMock, 'MsgSender')
          .withArgs(account.address);
      });
    });
  });
});
