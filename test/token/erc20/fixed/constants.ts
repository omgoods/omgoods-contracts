import { testing } from 'hardhat';

const { randomAddress } = testing;

export const ERC20_FIXED_TOKEN = {
  name: 'Test',
  symbol: 'TEST',
  owner: randomAddress(),
  totalSupply: 1_000_000,
};
