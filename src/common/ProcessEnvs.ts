import { getAddress, isHexString } from 'ethers';

export class ProcessEnvs {
  constructor(private namespace?: string) {
    //
  }

  getRaw(...path: string[]): string {
    const key = this.buildKey(...path);

    return process.env[key] || null;
  }

  getUrl(...path: string[]): string {
    let result: string = null;

    try {
      const value = new URL(this.getRaw(...path));

      switch (value.protocol) {
        case 'http:':
        case 'https:':
          result = value.toString();
          break;
      }
    } catch (err) {
      //
    }

    return result;
  }

  getAddress(...path: string[]): string {
    let result: string = null;

    const raw = this.getRaw(...path);

    try {
      const address = getAddress(raw);
      if (address) {
        result = address;
      }
    } catch (err) {
      //
    }

    return result;
  }

  getAddresses(...path: string[]): string[] {
    const result: string[] = [];

    const raw = this.getRaw(...path);

    if (raw) {
      const values = raw.replace(/([;,\.])/gi, '|').split('|');
      for (const value of values) {
        try {
          const address = getAddress(value);

          if (address) {
            result.push(address);
          }
        } catch (err) {
          //
        }
      }
    }

    return result;
  }

  getHex32(...path: string[]): string {
    const value = this.getRaw(...path);

    return isHexString(value, 32) ? value : null;
  }

  getBool(...path: string[]): boolean {
    let result = false;

    try {
      const value = this.getRaw(...path).toLowerCase();

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

  getInt(...path: string[]): number {
    let result = 0;

    try {
      const value = parseInt(this.getRaw(...path), 10);

      if (value) {
        result = value;
      }
    } catch (err) {
      //
    }

    return result;
  }

  private buildKey(...path: string[]): string {
    return [this.namespace, ...path]
      .filter((item) => !!item)
      .join('_')
      .replace(/([A-Z][a-z])/g, (char) => `_${char}`)
      .replace(/_+/g, '_')
      .toUpperCase();
  }
}
