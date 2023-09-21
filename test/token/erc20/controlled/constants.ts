import { testing } from 'hardhat';

const { randomAddress } = testing;

export const ERC20_CONTROLLED_TOKEN = {
  name: 'Test',
  symbol: 'TEST',
  owner: randomAddress(),
  minter: randomAddress(),
  burner: randomAddress(),
  initialSupply: 1_000_000,
};
