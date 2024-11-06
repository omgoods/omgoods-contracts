import { task, types } from 'hardhat/config';
import { customTypes, TaskArgsWithSilent } from '../../common';
import { RANDOM_METADATA } from '../constants';
import { TokenERC20CreateRegularTaskArgs } from './createRegular';
import { TokenERC20CreateWrappedTaskArgs } from './createWrapped';
import { TokenERC20TaskNames } from './constants';

task(TokenERC20TaskNames.Generate, 'Generates ERC20 tokens')
  .addOptionalParam(
    'account',
    'Account address used in sub tasks',
    undefined,
    customTypes.address,
  )
  .addOptionalParam(
    'totalRegular',
    'Number of regular tokens to generate',
    5,
    types.int,
  )
  .addOptionalParam('initialMetadataIndex', null, 0, types.int)
  .addFlag('wrapped', 'Generates wrapped token')
  .addFlag('silent', 'Turn off logging')
  .setAction(
    async (
      taskArgs: {
        account?: string;
        totalRegular: number;
        initialMetadataIndex: number;
        wrapped: boolean;
      } & TaskArgsWithSilent,
      hre,
    ) => {
      const {
        run,
        deployments: { getAddress },
        utils: { randomInt },
        config: {
          tokens: { externalKeys },
        },
      } = hre;

      const { account, totalRegular, initialMetadataIndex, wrapped, silent } =
        taskArgs;

      const fromIndex = initialMetadataIndex;
      const toIndex = initialMetadataIndex + totalRegular;

      for (let index = fromIndex; index < toIndex; index++) {
        const [symbol, name] = RANDOM_METADATA[index];

        const subTaskArgs: TokenERC20CreateRegularTaskArgs = {
          name,
          symbol,
          account,
          mintAmount: randomInt(100_000_000, 10_000_000),
          burnAmount: randomInt(500_000, 2_000_000),
          maxTransfers: randomInt(1, 3),
          silent,
        };

        await run(TokenERC20TaskNames.CreateRegular, subTaskArgs);
      }

      if (wrapped) {
        const underlyingToken = await getAddress(
          `ERC20ExternalToken${externalKeys.at(0)}`,
        );

        const subTaskArgs: TokenERC20CreateWrappedTaskArgs = {
          underlyingToken,
          account,
          wrapAmount: randomInt(500, 1_000),
          unwrapAmount: randomInt(10, 100),
          silent,
        };

        await run(TokenERC20TaskNames.CreateWrapped, subTaskArgs);
      }
    },
  );
