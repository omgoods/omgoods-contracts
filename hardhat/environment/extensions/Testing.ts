import { setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { AddressLike, BigNumberish } from 'ethers';
import { Signers } from './interfaces';

export class Testing {
  constructor(private readonly hre: HardhatRuntimeEnvironment) {
    const methods = Object.getOwnPropertyNames(Testing.prototype);

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

  async buildSigners<K extends string>(
    ...names: Array<K>
  ): Promise<Signers<K>> {
    const {
      ethers: { getSigners },
    } = this.hre;

    const signers = await getSigners();

    const named = names.reduce((result, name, index) => {
      return {
        ...result,
        [name]: signers.at(index),
      };
    }, {});

    return {
      ...named,
      unknown: signers.slice(names.length),
    } as Signers<K>;
  }
}
