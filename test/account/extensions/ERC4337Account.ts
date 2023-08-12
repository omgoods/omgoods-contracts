import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { deployERC4337AccountMock } from './fixtures';
import { EMPTY_USER_OP } from './constants';

const { randomBytes } = ethers;

describe('account/extensions/ERC4337Account // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployERC4337AccountMock>>;

  before(async () => {
    fixture = await loadFixture(deployERC4337AccountMock);
  });

  describe('# setters', () => {
    describe('validateUserOp()', () => {
      const userOpHash = randomBytes(32);

      it('expect to revert when msg.sender is not the entry point', async () => {
        const { erc4337AccountMock } = fixture;

        const tx = erc4337AccountMock.validateUserOp(
          EMPTY_USER_OP,
          userOpHash,
          0,
        );

        await expect(tx).revertedWithCustomError(
          erc4337AccountMock,
          'MsgSenderIsNotTheEntryPoint',
        );
      });

      it('expect to return 0 when the user op hash signer is an owner', async () => {
        const { erc4337AccountMock, signers } = fixture;

        const res = await erc4337AccountMock
          .connect(signers.entryPoint)
          .validateUserOp.staticCall(
            {
              ...EMPTY_USER_OP,
              signature: await signers.owner.signMessage(userOpHash),
            },
            userOpHash,
            0,
          );

        expect(res).eq(0);
      });

      it('expect to return 1 when the user op hash signer is not an owner', async () => {
        const { erc4337AccountMock, signers } = fixture;

        const res = await erc4337AccountMock
          .connect(signers.entryPoint)
          .validateUserOp.staticCall(
            {
              ...EMPTY_USER_OP,
              signature: await signers.unknown.at(0).signMessage(userOpHash),
            },
            userOpHash,
            0,
          );

        expect(res).eq(1);
      });

      it('expect to transfer the missing funds even if the user op hash signer is not an owner', async () => {
        const { erc4337AccountMock, signers } = fixture;

        const missingFunds = 1000;

        const tx = erc4337AccountMock
          .connect(signers.entryPoint)
          .validateUserOp(
            {
              ...EMPTY_USER_OP,
              signature: await signers.unknown.at(0).signMessage(userOpHash),
            },
            userOpHash,
            missingFunds,
          );

        await expect(tx).changeEtherBalances(
          [signers.entryPoint, erc4337AccountMock],
          [missingFunds, -missingFunds],
        );

        await expect(tx)
          .emit(erc4337AccountMock, 'TransactionExecuted')
          .withArgs(
            signers.entryPoint.address,
            signers.entryPoint.address,
            missingFunds,
            '0x',
          );
      });
    });
  });
});
