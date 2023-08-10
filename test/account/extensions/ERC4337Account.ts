import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { deployERC4337AccountMock } from './fixtures';
import { EMPTY_USER_OP } from './constants';

const { getSigners, randomBytes } = ethers;

describe('account/extensions/ERC4337Account // using mock', () => {
  let owner: HardhatEthersSigner;
  let entryPoint: HardhatEthersSigner;
  let signer: HardhatEthersSigner;
  let fixture: Awaited<ReturnType<typeof deployERC4337AccountMock>>;

  before(async () => {
    [owner, entryPoint, signer] = await getSigners();

    fixture = await loadFixture(deployERC4337AccountMock);
  });

  describe('# external functions (setters)', () => {
    describe('validateUserOp()', () => {
      const userOpHash = randomBytes(32);

      it('expect to revert when msg.sender is not the entry point', async () => {
        const { erc4337AccountMock } = fixture;

        await expect(
          erc4337AccountMock.validateUserOp(EMPTY_USER_OP, userOpHash, 0),
        ).revertedWithCustomError(
          erc4337AccountMock,
          'MsgSenderIsNotTheEntryPoint',
        );
      });

      it('expect to return 0 when the user op hash signer is an owner', async () => {
        const { erc4337AccountMock } = fixture;

        expect(
          await erc4337AccountMock
            .connect(entryPoint)
            .validateUserOp.staticCall(
              {
                ...EMPTY_USER_OP,
                signature: await owner.signMessage(userOpHash),
              },
              userOpHash,
              0,
            ),
        ).eq(0);
      });

      it('expect to return 1 when the user op hash signer is not an owner', async () => {
        const { erc4337AccountMock } = fixture;

        expect(
          await erc4337AccountMock
            .connect(entryPoint)
            .validateUserOp.staticCall(
              {
                ...EMPTY_USER_OP,
                signature: await signer.signMessage(userOpHash),
              },
              userOpHash,
              0,
            ),
        ).eq(1);
      });

      it('expect to transfer the missing funds even if the user op hash signer is not an owner', async () => {
        const { erc4337AccountMock } = fixture;

        const missingFunds = 1000;

        const tx = erc4337AccountMock.connect(entryPoint).validateUserOp(
          {
            ...EMPTY_USER_OP,
            signature: await signer.signMessage(userOpHash),
          },
          userOpHash,
          missingFunds,
        );

        await expect(tx).changeEtherBalances(
          [entryPoint, erc4337AccountMock],
          [missingFunds, -missingFunds],
        );

        await expect(tx)
          .emit(erc4337AccountMock, 'TransactionExecuted')
          .withArgs(entryPoint.address, entryPoint.address, missingFunds, '0x');
      });
    });
  });
});
