import { ethers } from 'hardhat';

const { ZeroAddress } = ethers;

export const EMPTY_USER_OP = {
  sender: ZeroAddress,
  nonce: 0,
  initCode: '0x',
  callData: '0x',
  callGasLimit: 0,
  verificationGasLimit: 0,
  preVerificationGas: 0,
  maxFeePerGas: 0,
  maxPriorityFeePerGas: 0,
  paymasterAndData: '0x',
  signature: '0x',
};