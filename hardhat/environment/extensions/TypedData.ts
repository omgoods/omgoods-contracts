import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { AddressLike } from 'ethers';
import { TypedDataEncoder } from './interfaces';

export class TypedData {
  constructor(private readonly hre: HardhatRuntimeEnvironment) {
    const methods = Object.getOwnPropertyNames(TypedData.prototype);

    for (const method of methods) {
      if (method !== 'constructor') {
        this[method] = this[method].bind(this);
      }
    }
  }

  getDomainArgs(contract: string): [string, string] {
    const {
      config: { contracts },
    } = this.hre;

    const domain = contracts[contract]?.typedData?.domain;

    if (!domain) {
      throw Error(`${contract} type data domain not found`);
    }

    const { name, version } = domain;

    return [name, version];
  }

  async createEncoder<D extends Record<string, any>>(
    contract: string,
    verifyingContract?: AddressLike,
  ): Promise<TypedDataEncoder<D>> {
    const {
      network: {
        config: { chainId },
      },
      deployments: { getAddress },
      ethers: { resolveAddress, TypedDataEncoder, getSigner },
      config: { contracts },
    } = this.hre;

    const typeData = contracts[contract]?.typedData;

    if (!typeData) {
      throw Error(`${contract} type data not found`);
    }

    const domain = {
      ...typeData.domain,
      chainId,
      verifyingContract: verifyingContract
        ? await resolveAddress(verifyingContract)
        : await getAddress(contract),
    };

    const buildTypes = (primaryType: keyof D) => ({
      [primaryType]: typeData.types[primaryType as string],
    });

    return {
      domain,
      encode: (primaryType, data) =>
        TypedDataEncoder.encode(domain, buildTypes(primaryType), data),
      hash: (primaryType, data) =>
        TypedDataEncoder.hash(domain, buildTypes(primaryType), data),
      sign: async (signer, primaryType, data) => {
        let result: string;

        switch (typeof signer) {
          case 'string':
            signer = await getSigner(signer);
            break;
        }

        result = await signer.signTypedData(
          domain,
          buildTypes(primaryType),
          data,
        );

        return result;
      },
    };
  }
}
