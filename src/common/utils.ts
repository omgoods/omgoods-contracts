import { randomBytes } from 'node:crypto';
import { getAddress, parseEther, toHex } from 'viem';

export function randomHex(length: number) {
  return toHex(randomBytes(length));
}

export function randomHex32() {
  return randomHex(32);
}

export function randomAddress() {
  return getAddress(randomHex(20));
}

export function randomNumber(top = 100, bottom = 1) {
  return Math.random() * (1 + top - bottom) + bottom;
}

export function randomEther(top = 100, bottom = 1, precision = 4) {
  const multiplier = 10 ** precision;

  const value = Math.floor(randomNumber(top, bottom) * multiplier);

  return parseEther(value.toString()) / BigInt(multiplier);
}
