import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { deployCloneImplMock } from './fixtures';

describe('proxy/CloneImpl // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployCloneImplMock>>;

  before(async () => {
    fixture = await loadFixture(deployCloneImplMock);
  });

  describe('# modifiers', () => {
    describe('onlyFactory()', () => {
      it('expect to revert when msg.sender is not the factory', async () => {
        const { signers, cloneImpl } = fixture;

        const tx = cloneImpl.connect(signers.unknown.at(0)).initialize(1);

        await expect(tx).revertedWithCustomError(
          cloneImpl,
          'MsgSenderIsNotTheFactory',
        );
      });

      it('expect not to revert when msg.sender is the factory', async () => {
        const { signers, cloneImpl } = fixture;

        const tx = cloneImpl.connect(signers.factory).initialize(1);

        await expect(tx).not.revertedWithCustomError(
          cloneImpl,
          'MsgSenderIsNotTheFactory',
        );
      });
    });
  });
});
