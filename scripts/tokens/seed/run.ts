import { ethers } from 'hardhat';
import { parseEther, MaxUint256 } from 'ethers';
import { runScript } from '../../common';
import { seedERC20ControlledTokenFactory } from './seedERC20ControlledTokenFactory';
import { seedERC20FixedTokenFactory } from './seedERC20FixedTokenFactory';
import { seedERC721ControlledTokenFactory } from './seedERC721ControlledTokenFactory';

const { getSigners } = ethers;

runScript(async () => {
  const [signer] = await getSigners();

  await seedERC20ControlledTokenFactory(
    {
      name: 'Controlled',
      symbol: 'CONTROLLED',
      controllers: [signer],
    },
    {
      mint: parseEther('200000000'),
      burn: parseEther('10000000'),
      approves: [12, parseEther('10'), MaxUint256, 0],
      transfers: [5, parseEther('100'), 10000],
    },
  );

  await seedERC20FixedTokenFactory(
    {
      name: 'Fixed',
      symbol: 'FIXED',
      owner: signer,
      totalSupply: parseEther('100000000'),
    },
    {
      approves: [100, parseEther('100'), MaxUint256, 0],
      transfers: [10, parseEther('1.2'), 50000],
    },
  );

  await seedERC721ControlledTokenFactory(
    {
      name: 'Controlled',
      symbol: 'CONTROLLED',
      controllers: [signer],
    },
    {
      mint: [1, 2, 100, 1000, 2000],
      burn: [2001, 5002],
    },
  );
});
