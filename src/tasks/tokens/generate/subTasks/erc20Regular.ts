import { parseEther } from 'ethers';
import { subtask, types } from 'hardhat/config';
import { customTypes, Logger } from '../../../common';
import { SubTaskNames } from './constants';
import { ERC20RegularSubTaskArgs } from './interfaces';

subtask(SubTaskNames.ERC20Regular)
  .addParam('name', null, null, types.string)
  .addParam('symbol', null, null, types.string)
  .addOptionalParam('account', null, null, customTypes.address)
  .addParam('initialSupply', null, null, types.int)
  .addParam('burnAmount', null, null, types.int)
  .addParam('maxTransfers', null, null, types.int)
  .addFlag('silent', 'Turn off logging')
  .setAction(async (args: ERC20RegularSubTaskArgs, hre) => {
    const {
      utils: { randomAddress, randomInt },
      ethers: { getSigners, getContractAt, id },
      deployments: { getAddress },
    } = hre;

    const {
      name,
      symbol,
      initialSupply,
      burnAmount,
      maxTransfers,
      account,
      silent,
    } = args;

    const logger = new Logger(!silent);

    const [owner] = await getSigners();

    const tokenFactory = await getContractAt(
      'TokenFactory',
      await getAddress('ERC20TokenFactory'),
    );

    const tokenImpl = await getContractAt(
      'ERC20TokenRegularImpl',
      await getAddress('ERC20TokenRegularImpl'),
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
            false,
          ]),
        ),
      );

      logger.log();
    }

    let totalSupply = initialSupply - burnAmount;

    await logger.logTx(
      'minting',
      token.mint(owner, parseEther(`${initialSupply}`)),
    );
    await logger.logTx(
      'burning',
      token.burn(owner, parseEther(`${burnAmount}`)),
    );

    logger.log();

    for (let index = 0; index < maxTransfers; index++) {
      const to = index === 0 && account ? account : randomAddress();
      const value = randomInt(1, totalSupply);

      if (totalSupply < value) {
        break;
      }

      await logger.logTx(
        `transferring #${index}`,
        token.transfer(to, parseEther(`${value}`)),
      );

      totalSupply -= value;
    }

    logger.log();
  });
