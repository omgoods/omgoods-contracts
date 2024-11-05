import { subtask, types } from 'hardhat/config';
import { customTypes, Logger } from '../../../common';
import { SubTaskNames } from './constants';
import { ERC721RegularSubTaskArgs } from './interfaces';

subtask(SubTaskNames.ERC721Regular)
  .addParam('name', null, null, types.string)
  .addParam('symbol', null, null, types.string)
  .addOptionalParam('account', null, null, customTypes.address)
  .addParam('totalItems', null, null, types.int)
  .addFlag('silent', 'Turn off logging')
  .setAction(async (args: ERC721RegularSubTaskArgs, hre) => {
    const {
      ethers: { getSigners, getContractAt, id },
      deployments: { getAddress },
    } = hre;

    const { name, symbol, silent } = args;

    const logger = new Logger(!silent);

    const [owner] = await getSigners();

    const tokenFactory = await getContractAt(
      'TokenFactory',
      await getAddress('ERC721TokenFactory'),
    );

    const tokenImpl = await getContractAt(
      'ERC721TokenRegularImpl',
      await getAddress('ERC721TokenRegularImpl'),
    );

    const salt = id(symbol);

    const tokenAddress = await tokenFactory.computeToken(salt);

    const token = tokenImpl.attach(tokenAddress) as typeof tokenImpl;

    logger.log(`## ${name} Token (${tokenAddress})`);
    logger.log();

    if (!(await tokenFactory.isToken(token))) {
      await logger.logTx(
        'creating',
        tokenFactory['createToken(bytes32,address,bytes)'](
          salt,
          tokenImpl,
          tokenImpl.interface.encodeFunctionData('initialize', [
            await getAddress('Forwarder'),
            owner.address,
            owner.address,
            name,
            symbol,
            '/',
            false,
          ]),
        ),
      );

      logger.log();
    }
  });
