import { task, types } from 'hardhat/config';
import { customTypes, Logger } from '../../common';
import { TokensTaskNames } from '../constants';
import { SubTaskNames, ERC20SubTaskArgs, ERC721SubTaskArgs } from './subTasks';
import { TokensGenerateTaskArgs } from './interfaces';

import {
  RANDOM_TOKEN_METADATA,
  RANDOM_TOKEN_METADATA_MIDDLE_INDEX,
} from './constants';

task(TokensTaskNames.Generate, 'Generates tokens')
  .addOptionalParam(
    'customAccount',
    'Custom account address used for transfers and approvals',
    undefined,
    customTypes.address,
  )
  .addOptionalParam(
    'totalErc20',
    'Number of ERC20 tokens to generate',
    5,
    types.int,
  )
  .addOptionalParam(
    'totalErc721',
    'Number of ERC721 tokens to generate',
    5,
    types.int,
  )
  .addFlag('silent', 'Turn off logging')
  .setAction(async (taskArgs: TokensGenerateTaskArgs, hre) => {
    const {
      run,
      utils: { randomInt },
    } = hre;

    const { customAccount, totalErc20, totalErc721, silent } = taskArgs;

    const logger = new Logger(!silent);

    if (totalErc20) {
      logger.log('# ERC20');
      logger.log();

      let toIndex = RANDOM_TOKEN_METADATA_MIDDLE_INDEX;

      if (toIndex > totalErc20) {
        toIndex = totalErc20;
      }

      for (let index = 0; index < toIndex; index++) {
        const [symbol, name] = RANDOM_TOKEN_METADATA[index];

        const subTaskArgs: ERC20SubTaskArgs = {
          name,
          symbol,
          customAccount,
          initialSupply: randomInt(100_000_000, 10_000_000),
          burnAmount: randomInt(500_000, 2_000_000),
          maxTransfers: randomInt(10, 50),
          totalApproves: randomInt(10, 50),
          silent,
        };

        await run(SubTaskNames.ERC20, subTaskArgs);
      }
    }

    if (totalErc721) {
      logger.log('# ERC721');
      logger.log();

      let fromIndex = RANDOM_TOKEN_METADATA_MIDDLE_INDEX;
      let toIndex = fromIndex + totalErc721;

      if (toIndex > RANDOM_TOKEN_METADATA.length) {
        toIndex = RANDOM_TOKEN_METADATA.length;
      }

      for (let index = fromIndex; index < toIndex; index++) {
        const [symbol, name] = RANDOM_TOKEN_METADATA[index];

        const subTaskArgs: ERC721SubTaskArgs = {
          name,
          symbol,
          silent,
        };

        await run(SubTaskNames.ERC721, subTaskArgs);
      }
    }
  });
