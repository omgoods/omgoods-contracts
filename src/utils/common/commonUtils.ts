import { ethers } from 'ethers';

export function bindAll(prototype: any, obj: any): void {
  const methods = Object.getOwnPropertyNames(prototype);

  for (const method of methods) {
    if (method !== 'constructor') {
      obj[method] = obj[method].bind(obj);
    }
  }
}

export function getAddress(address: string): string {
  let result: string;

  try {
    result = ethers.getAddress(address);
  } catch (err) {}

  return result || null;
}
