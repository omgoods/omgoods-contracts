import { AddressLike, BigNumberish, ContractTransactionResponse } from 'ethers';
import { logTx, randomAddress } from '../../common';

export async function generateERC20TokenEvents<
  C extends {
    approve(
      spender: AddressLike,
      value: BigNumberish,
    ): Promise<ContractTransactionResponse>;
    transfer(
      to: AddressLike,
      value: BigNumberish,
    ): Promise<ContractTransactionResponse>;
  },
>(
  token: C,
  options: {
    approves: BigNumberish[];
    transfers: BigNumberish[];
  },
): Promise<void> {
  for (const [index, value] of Object.entries(options.approves)) {
    await logTx(
      `(${index}) approving tokens`,
      token.approve(randomAddress(), value),
    );
  }

  for (const [index, value] of Object.entries(options.transfers)) {
    await logTx(
      `(${index}) transferring tokens`,
      token.transfer(randomAddress(), value),
    );
  }
}
