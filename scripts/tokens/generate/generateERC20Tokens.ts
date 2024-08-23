import { deployments, ethers } from 'hardhat';
import { AddressLike, MaxUint256, parseEther } from 'ethers';
import { logTx, randomAddress, randomInt } from '../../common';

const { getAddress } = deployments;

const { getContractAt } = ethers;

export async function generateERC20Tokens(options: {
  owner: AddressLike;
  tokensMetadata: {
    name: string;
    symbol: string;
  }[];
  mintAmount: {
    min: number;
    max: number;
  };
  burnAmount: {
    min: number;
  };
  totalTransfers: {
    max: number;
  };
  totalApproves: {
    max: number;
  };
}): Promise<void> {
  const tokenRegistry = await getContractAt(
    'TokenRegistry',
    await getAddress('TokenRegistry'),
  );

  const tokenFactory = await getContractAt(
    'DefaultTokenFactory',
    await getAddress('ERC20DefaultTokenFactory'),
  );

  for (const { name, symbol } of options.tokensMetadata) {
    const tokenAddress = await tokenFactory.computeToken(symbol);

    const token = await getContractAt('ERC20DefaultTokenImpl', tokenAddress);

    console.log(`## ${name} Token (${tokenAddress})`);
    console.log();

    if (!(await tokenRegistry.hasToken(token))) {
      await logTx(
        'creating',
        tokenFactory.createToken(
          options.owner,
          name,
          symbol,
          options.owner, // controller
          false,
          '0x',
        ),
      );

      console.log();
    }

    const mintAmount = randomInt(
      options.mintAmount.min,
      options.mintAmount.max,
    );
    const burnAmount = randomInt(options.burnAmount.min, mintAmount);
    const totalTransfers = randomInt(0, options.totalTransfers.max);
    const totalApproves = randomInt(0, options.totalApproves.max);

    let totalSupply = mintAmount - burnAmount;

    await logTx(
      'minting',
      token.mint(options.owner, parseEther(`${mintAmount}`)),
    );
    await logTx(
      'burning',
      token.burn(options.owner, parseEther(`${burnAmount}`)),
    );

    console.log();

    for (let index = 0; index < totalTransfers; index++) {
      const value = randomInt(1, totalSupply);

      if (totalSupply < value) {
        break;
      }

      await logTx(
        `transferring #${index}`,
        token.transfer(randomAddress(), parseEther(`${value}`)),
      );

      totalSupply -= value;
    }

    console.log();

    await logTx(`removing approval`, token.approve(randomAddress(), 0));
    await logTx(`approving all`, token.approve(randomAddress(), MaxUint256));

    console.log();

    for (let index = 0; index < totalApproves; index++) {
      const value = randomInt(0, mintAmount);

      await logTx(
        `approving #${index}`,
        token.approve(randomAddress(), parseEther(`${value}`)),
      );
    }

    console.log();
  }
}
