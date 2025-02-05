import { randomBytes } from 'node:crypto';
import { getAddress, toHex } from 'viem';

export function randomHex(length: number) {
  return toHex(randomBytes(length));
}

export function randomHex32() {
  return randomHex(32);
}

export function randomAddress() {
  return getAddress(randomHex(20));
}
