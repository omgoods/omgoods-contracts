import { task, types } from 'hardhat/config';
import { customTypes, TaskArgsWithSilent } from '../../common';
import { RANDOM_METADATA } from '../constants';
import { TokenERC721CreateRegularTaskArgs } from './createRegular';
import { TokenERC721TaskNames } from './constants';

task(TokenERC721TaskNames.Generate, 'Generates ERC721 tokens')
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
  .addFlag('silent', 'Turn off logging')
  .setAction(
    async (
      taskArgs: {
        account?: string;
        totalRegular: number;
        initialMetadataIndex: number;
      } & TaskArgsWithSilent,
      hre,
    ) => {
      const {
        run,
        utils: { randomInt },
      } = hre;

      const { account, totalRegular, initialMetadataIndex, silent } = taskArgs;

      const fromIndex = initialMetadataIndex;
      const toIndex = initialMetadataIndex + totalRegular;

      for (let index = fromIndex; index < toIndex; index++) {
        const [symbol, name] = RANDOM_METADATA[index];

        const subTaskArgs: TokenERC721CreateRegularTaskArgs = {
          name,
          symbol,
          account,
          totalTokens: randomInt(1, 3),
          silent,
        };

        await run(TokenERC721TaskNames.CreateRegular, subTaskArgs);
      }
    },
  );
