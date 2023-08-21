import { ethers } from 'ethers';

const { getAddress } = ethers;

function getEnvKey(...path: string[]): string {
  return path
    .join('_')
    .replace(/([A-Z][a-z])/g, (char) => `_${char}`)
    .replace(/_+/g, '_')
    .toUpperCase();
}

export function getEnv(...path: string[]): string {
  const key = getEnvKey(...path);

  return process.env[key] || null;
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
        result = true;
        break;
    }
  } catch (err) {
    //
  }

  return result;
}

export function getEnvAsInt(...path: string[]): number {
  let result = 0;

  try {
    const value = parseInt(getEnv(...path), 10);

    if (value) {
      result = value;
    }
  } catch (err) {
    //
  }

  return result;
}

export function prepareAddress(address: string): string {
  let result: string;

  try {
    result = getAddress(address);
  } catch (err) {}

  return result || null;
}

export function toConstantName(text: string, ...texts: string[]): string;
export function toConstantName(...parts: string[]): string {
  let text = parts.join('');

  if (text) {
    text = text.replace('ERC', 'erc');

    text = text.replace(
      /([a-z0-9][A-Z])/g,
      (value: string) => `${value[0]}_${value[1]}`,
    );

    text = text.toUpperCase();
  }

  return text;
}

export function toKebabCase(text: string): string {
  if (text) {
    text = text.replace('ERC', 'erc');
    text = text.replace(
      /([a-z0-9][A-Z])/g,
      (value: string) => `${value[0]}-${value[1]}`,
    );
    text = text.toLowerCase();
  }

  return text;
}
