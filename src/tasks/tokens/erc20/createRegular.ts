import { task, types } from 'hardhat/config';
import { customTypes, Logger, TaskArgsWithSilent } from '../../common';
import { TokenERC20TaskNames } from './constants';

export interface TokenERC20CreateRegularTaskArgs extends TaskArgsWithSilent {
  name: string;
  symbol: string;
  account?: string;
  mintAmount?: number;
  burnAmount?: number;
  maxTransfers?: number;
}

task(TokenERC20TaskNames.CreateRegular, 'Creates ERC20 regular token')
  .addParam('name', 'Token name', null, types.string)
  .addParam('symbol', 'Token symbol', null, types.string)
  .addOptionalParam(
    'account',
    'Account used in the first transfer',
    null,
    customTypes.address,
  )
  .addOptionalParam('mintAmount', 'Initial token supply', 0, types.int)
  .addOptionalParam('burnAmount', 'Burn amount', 0, types.int)
  .addOptionalParam(
    'maxTransfers',
    'Max number of transfer to generate',
    0,
    types.int,
  )
  .addFlag('silent', 'Turn off logging')
  .setAction(async (args: TokenERC20CreateRegularTaskArgs, hre) => {
    const {
      ethers: { parseEther, getSigners, getContractAt, id },
      deployments: { getAddress },
      utils: { randomAddress, randomInt },
    } = hre;

    const {
      name,
      symbol,
      mintAmount,
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
        'creating token',
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

    if (!(await token.isReady())) {
      await logger.logTx('setting token ready', token.setReady());
      logger.log();
    }

    if (mintAmount > 0) {
      let totalSupply = mintAmount;

      await logger.logTx(
        'minting tokens',
        token.mint(owner, parseEther(`${mintAmount}`)),
      );

      if (burnAmount > 0) {
        totalSupply -= burnAmount;

        await logger.logTx(
          'burning tokens',
          token.burn(owner, parseEther(`${burnAmount}`)),
        );
      }

      for (let index = 0; index < maxTransfers; index++) {
        const to = !index && account ? account : randomAddress();
        const value = randomInt(1, totalSupply);

        if (totalSupply < value) {
          break;
        }

        await logger.logTx(
          `transferring tokens #${index}`,
          token.transfer(to, parseEther(`${value}`)),
        );

        totalSupply -= value;
      }

      logger.log();
    }
  });
