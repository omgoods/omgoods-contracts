import { HardhatRuntimeEnvironment } from 'hardhat/types';

export class Helpers {
  constructor(private readonly hre: HardhatRuntimeEnvironment) {
    const methods = Object.getOwnPropertyNames(Helpers.prototype);

    for (const method of methods) {
      if (method !== 'constructor') {
        this[method] = this[method].bind(this);
      }
    }
  }

  randomHex(bytesSize = 32): string {
    const {
      ethers: { hexlify, randomBytes },
    } = this.hre;

    return hexlify(randomBytes(bytesSize));
  }

  randomAddress(): string {
    const {
      ethers: { getAddress },
    } = this.hre;

    return getAddress(this.randomHex(20));
  }

  randomSigner(options: {} = {}) {
    const {
      ethers: { getSigner },
    } = this.hre;
  }
}
