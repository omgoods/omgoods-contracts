import { testing } from 'hardhat';
import { TypedDataDomain } from 'ethers';

const { randomAddress } = testing;

export const ERC20_FIXED_TOKEN_FACTORY_TYPED_DATA_DOMAIN: TypedDataDomain = {
  name: 'Test ERC20FixedTokenFactory',
  version: '0.0.0',
};

export const ERC20_FIXED_TOKEN_DATA = {
  name: 'Test',
  symbol: 'TEST',
  owner: randomAddress(),
  totalSupply: 1_000_000,
};
