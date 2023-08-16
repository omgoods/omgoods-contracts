import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { AddressLike, TypedDataDomain, TypedDataField } from 'ethers';
import { commonUtils } from '../common';

const { bindAll } = commonUtils;

export class TypeDataUtils {
  constructor(private readonly hre: HardhatRuntimeEnvironment) {
    bindAll(TypeDataUtils.prototype, this);
  }

  async createEncoder<D = Record<string, any>>(
    verifyingContract: AddressLike,
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
  ): Promise<{
    encode: (data: D) => string;
    hash: (data: D) => string;
    sign: (signer: HardhatEthersSigner, data: D) => Promise<string>;
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
      sign: (signer, data) => signer.signTypedData(domain, types, data),
    };
  }
}
