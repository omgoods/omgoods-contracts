import { task, types } from 'hardhat/config';
import { TaskNames } from '../constants';
import {
  SubTaskNames,
  RANDOM_TOKEN_METADATA,
  RANDOM_TOKEN_METADATA_MIDDLE_INDEX,
} from './constants';
import { ERC20SubTaskArgs, ERC721SubTaskArgs } from './interfaces';
import './erc20';
import './erc721';

task(TaskNames.Generate, 'Generates tokens')
  .addOptionalParam(
    'account',
    'Custom account address used for transfers and approvals',
    undefined,
    types.string,
  )
  .addOptionalParam(
    'erc20Total',
    'Number of ERC20 tokens to generate',
    5,
    types.int,
  )
  .addOptionalParam(
    'erc721Total',
    'Number of ERC721 tokens to generate',
    5,
    types.int,
  )
  .setAction(
    async (
      taskArgs: {
        account: string;
        erc20Total: number;
        erc721Total: number;
      },
      hre,
    ) => {
      const {
        run,
        utils: { randomInt },
      } = hre;

      const { erc20Total, erc721Total } = taskArgs;

      if (erc20Total) {
        console.log('# ERC20');
        console.log();

        let toIndex = RANDOM_TOKEN_METADATA_MIDDLE_INDEX;

        if (toIndex > erc20Total) {
          toIndex = erc20Total;
        }

        const { account } = taskArgs;

        for (let index = 0; index < toIndex; index++) {
          const [symbol, name] = RANDOM_TOKEN_METADATA[index];

          const subTaskArgs: ERC20SubTaskArgs = {
            name,
            symbol,
            account,
            initialSupply: randomInt(100_000_000, 10_000_000),
            burnAmount: randomInt(500_000, 2_000_000),
            maxTransfers: randomInt(10, 50),
            totalApproves: randomInt(10, 50),
          };

          await run(SubTaskNames.ERC20, subTaskArgs);
        }
      }

      if (erc721Total) {
        console.log('# ERC721');
        console.log();

        let fromIndex = RANDOM_TOKEN_METADATA_MIDDLE_INDEX;
        let toIndex = fromIndex + erc721Total;

        if (toIndex > RANDOM_TOKEN_METADATA.length) {
          toIndex = RANDOM_TOKEN_METADATA.length;
        }

        for (let index = fromIndex; index < toIndex; index++) {
          const [symbol, name] = RANDOM_TOKEN_METADATA[index];

          const subTaskArgs: ERC721SubTaskArgs = {
            name,
            symbol,
          };

          await run(SubTaskNames.ERC721, subTaskArgs);
        }
      }
    },
  );
