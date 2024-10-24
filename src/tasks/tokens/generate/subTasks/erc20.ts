import { MaxUint256, parseEther } from 'ethers';
import { subtask, types } from 'hardhat/config';
import { customTypes, Logger } from '../../../common';
import { SubTaskNames } from './constants';
import { ERC20SubTaskArgs } from './interfaces';

subtask(SubTaskNames.ERC20)
  .addParam('name', null, null, types.string)
  .addParam('symbol', null, null, types.string)
  .addOptionalParam('customAccount', null, null, customTypes.address)
  .addParam('initialSupply', null, null, types.int)
  .addParam('burnAmount', null, null, types.int)
  .addParam('maxTransfers', null, null, types.int)
  .addParam('approvesCount', null, null, types.int)
  .addFlag('silent', 'Turn off logging')
  .setAction(async (args: ERC20SubTaskArgs, hre) => {
    const {
      utils: { randomAddress, randomInt },
      ethers: { getSigners, getContractAt },
      deployments: { getAddress },
    } = hre;

    const {
      name,
      symbol,
      initialSupply,
      burnAmount,
      maxTransfers,
      totalApproves,
      customAccount,
      silent,
    } = args;

    const logger = new Logger(!silent);

    const [owner] = await getSigners();

    const tokenRegistry = await getContractAt(
      'TokenRegistry',
      await getAddress('TokenRegistry'),
    );

    const tokenFactory = await getContractAt(
      'TokenDefaultFactory',
      await getAddress('ERC20TokenDefaultFactory'),
    );

    const tokenAddress = await tokenFactory.computeToken(symbol);

    const token = await getContractAt('ERC20TokenDefaultImpl', tokenAddress);

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
      const to = index === 0 && customAccount ? customAccount : randomAddress();
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

    await logger.logTx(`removing approval`, token.approve(randomAddress(), 0));
    await logger.logTx(
      `approving all`,
      token.approve(randomAddress(), MaxUint256),
    );

    logger.log();

    for (let index = 0; index < totalApproves; index++) {
      const spender =
        index === 0 && customAccount ? customAccount : randomAddress();
      const value = randomInt(0, initialSupply);

      await logger.logTx(
        `approving #${index}`,
        token.approve(spender, parseEther(`${value}`)),
      );
    }

    logger.log();
  });
