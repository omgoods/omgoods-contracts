import { testsUtils } from 'hardhat';
import { TypedDataDomain } from 'ethers';

const { randomAddress } = testsUtils;

export const ERC20_CONTROLLED_TOKEN_FACTORY_TYPED_DATA_DOMAIN: TypedDataDomain =
  {
    name: 'Test ERC20ControlledTokenFactory',
    version: '0.0.0',
  };

export const ERC20_CONTROLLED_TOKEN_DATA = {
  name: 'Test',
  symbol: 'TEST',
  owner: randomAddress(),
  minter: randomAddress(),
  burner: randomAddress(),
  initialSupply: 1_000_000,
};
