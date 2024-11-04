import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { setupCloneFactoryMock } from './fixtures';

describe('proxy/CloneImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof setupCloneFactoryMock>>;

  before(async () => {
    fixture = await loadFixture(setupCloneFactoryMock);
  });

  describe('# modifiers', () => {
    describe('onlyFactory()', () => {
      it('expect to revert when msg.sender is not the factory', async () => {
        const { clone } = fixture;

        const tx = clone.initialize(1);

        await expect(tx).revertedWithCustomError(
          clone,
          'MsgSenderIsNotTheFactory',
        );
      });

      it('expect not to revert when msg.sender is the factory', async () => {
        const { signers, cloneImpl } = fixture;

        await cloneImpl.connect(signers.factory).initialize(1);
      });
    });
  });
});
