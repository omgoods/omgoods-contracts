import { setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  AddressLike,
  BigNumberish,
  TypedDataDomain,
  TypedDataField,
} from 'ethers';
import { Signers } from './interfaces';
import { PROXY_IMPL_SLOT } from './constants';

export class Helpers {
  constructor(private readonly hre: HardhatRuntimeEnvironment) {
    const methods = Object.getOwnPropertyNames(Helpers.prototype);

    for (const method of methods) {
      if (method !== 'constructor') {
        this[method] = this[method].bind(this);
      }
    }
  }

  async getNamedSigner(name: string): Promise<HardhatEthersSigner> {
    const {
      getNamedAccounts,
      ethers: { getSigner },
    } = this.hre;

    const accounts = await getNamedAccounts();

    let result: HardhatEthersSigner;

    try {
      result = await getSigner(accounts[name]);
    } catch (err) {
      result = null;
    }

    if (!result) {
      throw new Error(`Named signer "${name}" not found.`);
    }

    return result;
  }

  async getDeployedContractAddress(name: string): Promise<string> {
    const {
      deployments: { get },
    } = this.hre;

    let result: string;

    try {
      ({ address: result } = await get(name));
    } catch (err) {
      throw new Error(`${name} contract has not been deployed yet.`);
    }

    return result;
  }

  async createTypedDataEncoder<D = Record<string, any>>(
    verifyingContract: AddressLike,
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
  ): Promise<{
    encode: (data: D) => string;
    hash: (data: D) => string;
    domain: TypedDataDomain;
    types: Record<string, Array<TypedDataField>>;
  }> {
    const {
      network: {
        config: { chainId },
      },
      ethers: { resolveAddress, TypedDataEncoder },
    } = this.hre;

    domain = {
      ...domain,
      chainId,
      verifyingContract: await resolveAddress(verifyingContract),
    };

    return {
      encode: (data) => TypedDataEncoder.encode(domain, types, data),
      hash: (data) => TypedDataEncoder.hash(domain, types, data),
      domain,
      types,
    };
  }

  async getProxyImplAddress(contract: AddressLike): Promise<string> {
    const {
      ethers: { provider, AbiCoder },
    } = this.hre;

    const storage = await provider.getStorage(contract, PROXY_IMPL_SLOT);

    return AbiCoder.defaultAbiCoder().decode(['address'], storage).at(0);
  }

  async createProxyAddressFactory<T = string>(
    proxyFactory: AddressLike,
    proxyImpl: AddressLike,
    prepareSalt: (salt: T) => string = null,
  ): Promise<(salt: T) => string> {
    const {
      ethers: {
        resolveAddress,
        getContractFactory,
        zeroPadValue,
        concat,
        keccak256,
        getCreate2Address,
      },
    } = this.hre;

    const Proxy = await getContractFactory('Proxy');
    const deployer = await resolveAddress(proxyFactory);
    const initCodeHash = keccak256(
      concat([
        Proxy.bytecode,
        zeroPadValue((await resolveAddress(proxyImpl)).toLowerCase(), 32),
      ]),
    );

    return (salt) => {
      const preparedSalt = prepareSalt ? prepareSalt(salt) : (salt as string);

      return getCreate2Address(deployer, preparedSalt, initCodeHash);
    };
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
