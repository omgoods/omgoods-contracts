import { isHexString, getAddress } from 'ethers';

export function getEnvKey(...path: string[]): string {
  return path
    .join('_')
    .replace(/([A-Z][a-z])/g, (char) => `_${char}`)
    .replace(/_+/g, '_')
    .toUpperCase();
}

export function getEnv(...path: string[]): string {
  return process.env[getEnvKey(...path)] || null;
}

export function getEnvAsUrl(...path: string[]): string {
  let result: string = null;

  try {
    const value = new URL(getEnv(...path));

    switch (value.protocol) {
      case 'http:':
      case 'https:':
      case 'ws:':
      case 'wss:':
        result = value.toString();
        break;
    }
  } catch (err) {
    //
  }

  return result;
}

export function getEnvAsBool(...path: string[]): boolean {
  let result = false;

  try {
    const value = getEnv(...path).toLowerCase();

    switch (value.charAt(0)) {
      case '1':
      case 'y':
      case 't':
        result = this;
        break;
    }
  } catch (err) {
    //
  }

  return result;
}

export function isPrivateKey(privateKey: string): boolean {
  return isHexString(privateKey, 32);
}

export function prepareAddress(address: string): string {
  let result: string;

  try {
    result = getAddress(address);
  } catch (err) {}

  return result || null;
}
