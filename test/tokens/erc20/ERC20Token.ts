import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyUint } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { abiCoder, randomAddress } from '../../common';
import { TokenNotificationsKinds } from '../constants';
import { setupERC20TokenMock } from './fixtures';

describe('tokens/erc20/ERC20Token // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupERC20TokenMock>>;

  before(async () => {
    fixture = await loadFixture(setupERC20TokenMock);
  });

  describe('# setters', () => {
    describe('_update()', () => {
      it('expect to send the notification after update', async () => {
        const { token, tokenRegistry, signers } = fixture;

        const to = randomAddress();
        const value = 100;

        const tx = token.transfer(to, value);

        await expect(tx)
          .emit(tokenRegistry, 'TokenNotificationSent')
          .withArgs(
            await token.getAddress(),
            TokenNotificationsKinds.ERC20Update,
            abiCoder.encode(
              ['address', 'address', 'uint256'],
              [signers.owner.address, to, value],
            ),
            anyUint,
          );
      });
    });

    describe('_approve()', () => {
      it('expect to send the notification after approval', async () => {
        const { token, tokenRegistry, signers } = fixture;

        const spender = randomAddress();
        const value = 200;

        const tx = token.approve(spender, value);

        await expect(tx)
          .emit(tokenRegistry, 'TokenNotificationSent')
          .withArgs(
            await token.getAddress(),
            TokenNotificationsKinds.ERC20Approve,
            abiCoder.encode(
              ['address', 'address', 'uint256'],
              [signers.owner.address, spender, value],
            ),
            anyUint,
          );
      });
    });
  });
});
