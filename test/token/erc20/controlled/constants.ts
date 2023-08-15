import { helpers } from 'hardhat';
import { TypedDataDomain } from 'ethers';

const { randomAddress } = helpers;

export const RC20_CONTROLLED_TOKEN_FACTORY_TYPED_DATA_DOMAIN: TypedDataDomain =
  {
    name: 'Test RC20ControlledTokenFactory',
    version: '0.0.0',
  } as const;

export const RC20_CONTROLLED_TOKEN_DATA = {
  name: 'Test',
  symbol: 'TEST',
  owner: randomAddress(),
  minter: randomAddress(),
  burner: randomAddress(),
  initialSupply: 1_000_000,
} as const;
