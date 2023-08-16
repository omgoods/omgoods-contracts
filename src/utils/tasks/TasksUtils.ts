import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { commonUtils } from '../common';

const { bindAll } = commonUtils;

export class TasksUtils {
  constructor(private readonly hre: HardhatRuntimeEnvironment) {
    bindAll(TasksUtils.prototype, this);
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
}
