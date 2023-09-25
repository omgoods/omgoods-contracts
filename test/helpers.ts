import { hexlify, randomBytes, getAddress } from 'ethers';

export function randomHex(bytesSize = 32): string {
  return hexlify(randomBytes(bytesSize));
}

export function randomAddress(): string {
  return getAddress(randomHex(20));
}
