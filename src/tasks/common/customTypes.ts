import { CLIArgumentType } from 'hardhat/types';
import { getAddress, parseEther } from 'ethers';
import { HardhatError } from 'hardhat/internal/core/errors';
import { ERRORS } from 'hardhat/internal/core/errors-list';

const address: CLIArgumentType<string> = {
  name: 'address',
  parse: (argName, strValue) => {
    let result: string = null;

    try {
      result = getAddress(strValue.toLowerCase());
    } catch (err) {
      //
    }

    if (!result) {
      throw new HardhatError(ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE, {
        value: strValue,
        name: argName,
        type: 'address',
      });
    }

    return result;
  },
  validate: (argName: string, value: any): void => {
    let isAddress = false;

    try {
      isAddress = !!getAddress(value.toLowerCase());
    } catch (err) {
      //
    }

    if (!isAddress) {
      throw new HardhatError(ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE, {
        value,
        name: argName,
        type: address.name,
      });
    }
  },
};

const ether: CLIArgumentType<bigint> = {
  name: 'ether',
  parse: (argName, strValue) => {
    let result: bigint;

    try {
      result = parseEther(strValue);
    } catch (err) {
      //
    }

    if (!result) {
      throw new HardhatError(ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE, {
        value: strValue,
        name: argName,
        type: 'ether',
      });
    }

    return result;
  },
  validate: (argName: string, value: any): void => {
    if (typeof value !== 'bigint') {
      throw new HardhatError(ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE, {
        value,
        name: argName,
        type: address.name,
      });
    }
  },
};

export const customTypes = {
  address,
  ether,
} as const;
