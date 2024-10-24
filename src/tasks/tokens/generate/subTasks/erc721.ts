import { subtask, types } from 'hardhat/config';
import { Logger } from '../../../common';
import { SubTaskNames } from './constants';
import { ERC721SubTaskArgs } from './interfaces';

subtask(SubTaskNames.ERC721)
  .addParam('name', null, null, types.string)
  .addParam('symbol', null, null, types.string)
  .addFlag('silent', 'Turn off logging')
  .setAction(async (args: ERC721SubTaskArgs, hre) => {
    const {
      ethers: { getSigners, getContractAt },
      deployments: { getAddress },
    } = hre;

    const { name, symbol, silent } = args;

    const logger = new Logger(!silent);

    const [owner] = await getSigners();

    const tokenRegistry = await getContractAt(
      'TokenRegistry',
      await getAddress('TokenRegistry'),
    );

    const tokenFactory = await getContractAt(
      'TokenDefaultFactory',
      await getAddress('ERC721TokenDefaultFactory'),
    );

    const tokenAddress = await tokenFactory.computeToken(symbol);

    const token = await getContractAt('ERC721TokenDefaultImpl', tokenAddress);

    logger.log(`## ${name} Token (${tokenAddress})`);
    logger.log();

    if (!(await tokenRegistry.hasToken(token))) {
      await logger.logTx(
        'creating',
        tokenFactory.createToken(
          owner,
          name,
          symbol,
          owner, // controller
          false,
          '0x',
        ),
      );

      logger.log();
    }
  });
