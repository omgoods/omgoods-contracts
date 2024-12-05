import { task, types } from 'hardhat/config';
import { customTypes, Logger, TaskArgsWithSilent } from '../../common';
import { TokenERC721TaskNames } from './constants';

export interface TokenERC721CreateRegularTaskArgs extends TaskArgsWithSilent {
  name: string;
  symbol: string;
  account?: string;
  totalTokens?: number;
}

task(TokenERC721TaskNames.CreateRegular, 'Creates ERC721 regular token')
  .addParam('name', 'Token name', null, types.string)
  .addParam('symbol', 'Token symbol', null, types.string)
  .addOptionalParam(
    'account',
    'Account used in the first mint',
    null,
    customTypes.address,
  )
  .addOptionalParam('totalTokens', 'Total tokens to mint', 0, types.int)
  .addFlag('silent', 'Turn off logging')
  .setAction(async (args: TokenERC721CreateRegularTaskArgs, hre) => {
    const {
      ethers: { getSigners, getContractAt, id },
      deployments: { getAddress },
      utils: { randomAddress },
    } = hre;

    const { name, symbol, silent, account, totalTokens } = args;

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

    if (!(await token.isReady())) {
      await logger.logTx('setting token ready', token.setReady());
      logger.log();
    }

    if (totalTokens > 0) {
      let minted = false;

      for (let index = 0; index < totalTokens; index++) {
        let owner: string;
        const tokenId = index + 1;

        try {
          owner = await token.ownerOf(tokenId);
        } catch (err) {
          //
        }

        if (!owner) {
          const to = !index && account ? account : randomAddress();

          await logger.logTx(
            `minting token #${tokenId}`,
            token.mint(to, tokenId),
          );

          minted = true;
        }
      }

      if (minted) {
        logger.log();
      }
    }
  });
