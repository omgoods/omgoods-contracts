import { setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { AddressLike, BigNumberish } from 'ethers';

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

  async setBalance(address: AddressLike, balance?: BigNumberish) {
    const {
      ethers: { resolveAddress, parseEther },
    } = this.hre;

    await setBalance(
      await resolveAddress(address),
      typeof balance === 'undefined' ? parseEther('1') : balance,
    );
  }
}
