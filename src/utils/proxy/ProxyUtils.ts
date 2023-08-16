import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { AddressLike } from 'ethers';
import { commonUtils } from '../common';
import { PROXY_IMPL_SLOT } from './constants';

const { bindAll } = commonUtils;

export class ProxyUtils {
  constructor(private readonly hre: HardhatRuntimeEnvironment) {
    bindAll(ProxyUtils.prototype, this);
  }

  async getImplAddress(contract: AddressLike): Promise<string> {
    const {
      ethers: { provider, AbiCoder },
    } = this.hre;

    const storage = await provider.getStorage(contract, PROXY_IMPL_SLOT);

    return AbiCoder.defaultAbiCoder().decode(['address'], storage).at(0);
  }

  async createAddressFactory<T = string>(
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
}
