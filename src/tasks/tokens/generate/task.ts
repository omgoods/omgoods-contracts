import { task, types } from 'hardhat/config';
import { customTypes, Logger } from '../../common';
import { TokensTaskNames } from '../constants';
import {
  SubTaskNames,
  ERC20RegularSubTaskArgs,
  ERC721RegularSubTaskArgs,
} from './subTasks';
import { TokensGenerateTaskArgs } from './interfaces';

import {
  RANDOM_TOKEN_METADATA,
  RANDOM_TOKEN_METADATA_MIDDLE_INDEX,
} from './constants';

task(TokensTaskNames.Generate, 'Generates tokens')
  .addOptionalParam(
    'account',
    'Account address used for transfers',
    undefined,
    customTypes.address,
  )
  .addOptionalParam(
    'erc20RegularTotal',
    'Number of regular ERC20 tokens to generate',
    5,
    types.int,
  )
  .addFlag('erc20Wrapped', 'Generate wrapped ERC20 token')
  .addOptionalParam(
    'erc721RegularTotal',
    'Number of regular ERC721 tokens to generate',
    5,
    types.int,
  )
  .addFlag('silent', 'Turn off logging')
  .setAction(async (taskArgs: TokensGenerateTaskArgs, hre) => {
    const {
      run,
      utils: { randomInt },
    } = hre;

    const { account, erc20RegularTotal, erc721RegularTotal, silent } = taskArgs;

    const logger = new Logger(!silent);

    if (erc20RegularTotal) {
      logger.log('# ERC20 Regular');
      logger.log();

      let toIndex = RANDOM_TOKEN_METADATA_MIDDLE_INDEX;

      if (toIndex > erc20RegularTotal) {
        toIndex = erc20RegularTotal;
      }

      for (let index = 0; index < toIndex; index++) {
        const [symbol, name] = RANDOM_TOKEN_METADATA[index];

        const subTaskArgs: ERC20RegularSubTaskArgs = {
          name,
          symbol,
          account,
          initialSupply: randomInt(100_000_000, 10_000_000),
          burnAmount: randomInt(500_000, 2_000_000),
          maxTransfers: randomInt(10, 50),
          silent,
        };

        await run(SubTaskNames.ERC20Regular, subTaskArgs);
      }
    }

    if (erc721RegularTotal) {
      logger.log('# ERC721 Regular');
      logger.log();

      let fromIndex = RANDOM_TOKEN_METADATA_MIDDLE_INDEX;
      let toIndex = fromIndex + erc721RegularTotal;

      if (toIndex > RANDOM_TOKEN_METADATA.length) {
        toIndex = RANDOM_TOKEN_METADATA.length;
      }

      for (let index = fromIndex; index < toIndex; index++) {
        const [symbol, name] = RANDOM_TOKEN_METADATA[index];

        const subTaskArgs: ERC721RegularSubTaskArgs = {
          name,
          symbol,
          account,
          totalItems: randomInt(5, 15),
          silent,
        };

        await run(SubTaskNames.ERC721Regular, subTaskArgs);
      }
    }
  });
