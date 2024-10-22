import { subtask, types } from 'hardhat/config';
import { SubTaskNames } from './constants';
import { ERC721SubTaskArgs } from './interfaces';

subtask(SubTaskNames.ERC721)
  .addParam('name', null, null, types.string)
  .addParam('symbol', null, null, types.string)
  .setAction(async (args: ERC721SubTaskArgs, hre) => {
    const {
      utils: { logTx },
      ethers: { getSigners, getContractAt },
      deployments: { getAddress },
    } = hre;

    const [owner] = await getSigners();

    const { name, symbol } = args;

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

    console.log(`## ${name} Token (${tokenAddress})`);
    console.log();

    if (!(await tokenRegistry.hasToken(token))) {
      await logTx(
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

      console.log();
    }
  });
