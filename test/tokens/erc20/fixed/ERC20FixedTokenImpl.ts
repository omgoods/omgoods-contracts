import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { deployERC20FixedTokenImpl } from './fixtures';

describe('tokens/erc20/fixed/ERC20FixedTokenImpl', () => {
  let fixture: Awaited<ReturnType<typeof deployERC20FixedTokenImpl>>;

  before(async () => {
    fixture = await loadFixture(deployERC20FixedTokenImpl);
  });

  describe('# deployment', () => {
    describe('initialize()', () => {
      it('expect to revert', async () => {
        const { tokenImpl } = fixture;

        const tx = tokenImpl.initialize(ZeroAddress, '', '', ZeroAddress, 0);

        await expect(tx).revertedWithCustomError(
          tokenImpl,
          'AlreadyInitialized',
        );
      });
    });
  });
});
