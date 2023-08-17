import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  ContractTransactionResponse,
  ContractTransactionReceipt,
} from 'ethers';
import prompts from 'prompts';
import { commonUtils } from '../common';

const { bindAll } = commonUtils;

export class TasksUtils {
  constructor(private readonly hre: HardhatRuntimeEnvironment) {
    bindAll(TasksUtils.prototype, this);
  }

  printExit(): void {
    console.log('... bye!');
  }

  printMessage(message: string, data?: any): void {
    console.log(`› ${message}`);

    if (data) {
      console.log(data);
    }
  }

  printError(message: string, data?: any): void {
    console.log(`! ${message}`);

    if (data) {
      console.log(data);
    }
  }

  async promptText(options: {
    message: string;
    initial?: string;
  }): Promise<string> {
    const { message, initial } = options;

    const { value: result } = await prompts({
      type: 'text',
      name: 'value',
      message,
      initial,
    });

    return result || null;
  }

  async promptConfirm(options: {
    message: string;
    initial?: boolean;
  }): Promise<boolean> {
    const { message, initial } = options;

    const { value: result } = await prompts({
      type: 'confirm',
      name: 'value',
      message,
      initial,
    });

    return result;
  }

  async promptSelect<T>(options: {
    message: string;
    initial?: number;
    choices: Array<{
      title: string;
      value: T;
    }>;
  }): Promise<T> {
    let result: T = null;

    const { message, choices, initial } = options;

    switch (choices.length) {
      case 0:
        break;
      case 1:
        ({ value: result } = choices.at(0));
        break;
      default:
        if (!result) {
          ({ value: result } = await prompts({
            type: 'select',
            name: 'value',
            message,
            choices,
            initial,
          }));
        }
    }

    return result || null;
  }

  async processTransaction(tx: Promise<ContractTransactionResponse>): Promise<{
    response: ContractTransactionResponse;
    receipt: ContractTransactionReceipt;
  }> {
    let response: ContractTransactionResponse;
    let receipt: ContractTransactionReceipt;

    try {
      response = await tx;
      receipt = await response.wait();
    } catch (err) {
      const { message } = err as Error;

      this.printError(message || 'Transaction reverted');
    }

    return {
      response,
      receipt,
    };
  }

  async getDeployedAddress(name: string): Promise<string> {
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

  async getAccountAt(address: string, sender?: HardhatEthersSigner) {
    const {
      ethers: { getContractAt },
    } = this.hre;

    return getContractAt('AccountImpl', address, sender);
  }

  async getAccountRegistry(sender?: HardhatEthersSigner) {
    const {
      ethers: { getContractAt },
    } = this.hre;

    return getContractAt(
      'AccountRegistry',
      await this.getDeployedAddress('AccountRegistry'),
      sender,
    );
  }
}
