import { randomBytes } from 'node:crypto';
import { getAddress, toHex, Hash } from 'viem';

export function randomHex(length: number) {
  return toHex(randomBytes(length));
}

export function randomHex32() {
  return randomHex(32);
}

export function randomAddress() {
  return getAddress(randomHex(20));
}

export function resolveAddress(
  address:
    | {
        address: Hash;
      }
    | Hash
    | never,
): Hash | undefined {
  let result: Hash | undefined;

  if (address) {
    switch (typeof address) {
      case 'object':
        result = address?.address;
        break;

      case 'string':
        result = address as Hash;
        break;
    }
  }

  return result;
}
