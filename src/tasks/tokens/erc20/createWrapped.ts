import { task, types } from 'hardhat/config';
import { customTypes, Logger, TaskArgsWithSilent } from '../../common';
import { TokenERC20TaskNames } from './constants';

export interface TokenERC20CreateWrappedTaskArgs extends TaskArgsWithSilent {
  underlyingToken: string;
  account?: string;
  wrapAmount?: number;
  unwrapAmount?: number;
}

task(TokenERC20TaskNames.CreateWrapped, 'Creates ERC20 wrapped token')
  .addParam('underlyingToken', 'Underlying Token', null, customTypes.address)
  .addOptionalParam(
    'account',
    'Account used in the wrap',
    null,
    customTypes.address,
  )
  .addOptionalParam('wrapAmount', 'Wrap amount', 0, types.int)
  .addOptionalParam('unwrapAmount', 'Unwrap amount', 0, types.int)
  .addFlag('silent', 'Turn off logging')
  .setAction(async (args: TokenERC20CreateWrappedTaskArgs, hre) => {
    const {
      ethers: { parseEther, getContractAt, keccak256, MaxUint256 },
      deployments: { getAddress },
      utils: { randomAddress },
    } = hre;

    const { underlyingToken, account, wrapAmount, unwrapAmount, silent } = args;

    const logger = new Logger(!silent);

    const tokenFactory = await getContractAt(
      'TokenFactory',
      await getAddress('ERC20TokenFactory'),
    );

    const tokenImpl = await getContractAt(
      'ERC20TokenWrappedImpl',
      await getAddress('ERC20TokenWrappedImpl'),
    );

    const salt = keccak256(underlyingToken);

    const tokenAddress = await tokenFactory.computeToken(salt);

    const token = tokenImpl.attach(tokenAddress) as typeof tokenImpl;

    logger.log(`## Wrapped (${underlyingToken}) Token (${tokenAddress})`);
    logger.log();

    if (!(await tokenFactory.isToken(token))) {
      await logger.logTx(
        'creating token',
        tokenFactory['createToken(bytes32,address,bytes)'](
          salt,
          tokenImpl,
          tokenImpl.interface.encodeFunctionData('initialize', [
            await getAddress('Forwarder'),
            underlyingToken,
          ]),
        ),
      );

      logger.log();
    }

    const externalToken = await getContractAt(
      'ERC20ExternalToken',
      underlyingToken,
    );

    await logger.logTx(
      'approving token',
      externalToken.approve(token, MaxUint256),
    );

    if (wrapAmount > 0) {
      await logger.logTx(
        'wrapping tokens',
        token.wrapTo(account || randomAddress(), parseEther(`${wrapAmount}`)),
      );

      logger.log();
    }

    if (unwrapAmount > 0) {
      await logger.logTx(
        'wrapping tokens',
        token.wrap(parseEther(`${wrapAmount}`)),
      );

      await logger.logTx(
        'unwrapping tokens',
        token.unwrap(parseEther(`${unwrapAmount}`)),
      );

      logger.log();
    }
  });
