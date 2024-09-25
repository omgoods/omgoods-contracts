import { MaxUint256, parseEther } from 'ethers';
import { subtask, types } from 'hardhat/config';
import { SubTaskNames } from './constants';
import { ERC20SubTaskArgs } from './interfaces';

subtask(SubTaskNames.ERC20)
  .addParam('name', null, null, types.string)
  .addParam('symbol', null, null, types.string)
  .addOptionalParam('account', null, null, types.string)
  .addParam('initialSupply', null, null, types.int)
  .addParam('burnAmount', null, null, types.int)
  .addParam('maxTransfers', null, null, types.int)
  .addParam('approvesCount', null, null, types.int)
  .setAction(async (args: ERC20SubTaskArgs, hre) => {
    const {
      utils: { logTx, randomAddress, randomInt },
      ethers: { getSigners, getContractAt },
      deployments: { getAddress },
    } = hre;

    const [owner] = await getSigners();

    const {
      name,
      symbol,
      initialSupply,
      burnAmount,
      maxTransfers,
      totalApproves,
      account,
    } = args;

    const tokenRegistry = await getContractAt(
      'TokenRegistry',
      await getAddress('TokenRegistry'),
    );

    const tokenFactory = await getContractAt(
      'DefaultTokenFactory',
      await getAddress('ERC20DefaultTokenFactory'),
    );

    const tokenAddress = await tokenFactory.computeToken(symbol);

    const token = await getContractAt('ERC20DefaultTokenImpl', tokenAddress);

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

    let totalSupply = initialSupply - burnAmount;

    await logTx('minting', token.mint(owner, parseEther(`${initialSupply}`)));
    await logTx('burning', token.burn(owner, parseEther(`${burnAmount}`)));

    console.log();

    for (let index = 0; index < maxTransfers; index++) {
      const to = index === 0 && account ? account : randomAddress();
      const value = randomInt(1, totalSupply);

      if (totalSupply < value) {
        break;
      }

      await logTx(
        `transferring #${index}`,
        token.transfer(to, parseEther(`${value}`)),
      );

      totalSupply -= value;
    }

    console.log();

    await logTx(`removing approval`, token.approve(randomAddress(), 0));
    await logTx(`approving all`, token.approve(randomAddress(), MaxUint256));

    console.log();

    for (let index = 0; index < totalApproves; index++) {
      const spender = index === 0 && account ? account : randomAddress();
      const value = randomInt(0, initialSupply);

      await logTx(
        `approving #${index}`,
        token.approve(spender, parseEther(`${value}`)),
      );
    }

    console.log();
  });
