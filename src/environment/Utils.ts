import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { AddressLike, BytesLike } from 'ethers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

export class Utils {
  constructor(private hre: HardhatRuntimeEnvironment) {
    //
  }

  abiCoder = this.hre.ethers.AbiCoder.defaultAbiCoder();

  randomHex = (bytesSize = 32) => {
    const { hexlify, randomBytes } = this.hre.ethers;

    return hexlify(randomBytes(bytesSize));
  };

  randomAddress = () => {
    const { getAddress } = this.hre.ethers;

    return getAddress(this.randomHex(20));
  };

  randomInt = (min = 1, max = 1_000_000) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  computeProxyCloneAddress = async (
    deployer: AddressLike,
    impl: AddressLike,
    salt: BytesLike,
  ) => {
    const { getCreate2Address, resolveAddress, keccak256, concat } =
      this.hre.ethers;

    return getCreate2Address(
      await resolveAddress(deployer),
      salt,
      keccak256(
        concat([
          '0x3d602d80600a3d3981f3363d3d373d3d3d363d73',
          (await resolveAddress(impl)).toLowerCase(),
          '0x5af43d82803e903d91602b57fd5bf3',
        ]),
      ),
    );
  };

  getSigners: <
    K extends string,
    R extends Record<K, HardhatEthersSigner> & {
      unknown: HardhatEthersSigner[];
    },
  >(
    ...names: Array<K>
  ) => Promise<R> = async (...names: any[]) => {
    const { getSigners } = this.hre.ethers;

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
    };
  };
}
