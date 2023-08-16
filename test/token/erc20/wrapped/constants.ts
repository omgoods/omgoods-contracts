import { TypedDataDomain } from 'ethers';
import { ERC20_EXTERNAL_TOKEN_MOCK_DATA } from '../constants';

export const ERC20_WRAPPED_TOKEN_FACTORY_TYPED_DATA_DOMAIN: TypedDataDomain = {
  name: 'Test ERC20WrappedTokenFactory',
  version: '0.0.0',
};

export const ERC20_UNDERLYING_TOKEN_DATA = {
  ...ERC20_EXTERNAL_TOKEN_MOCK_DATA,
  decimals: 10,
};

export const ERC20_WRAPPED_TOKEN_DATA: typeof ERC20_UNDERLYING_TOKEN_DATA = {
  ...ERC20_UNDERLYING_TOKEN_DATA,
  initialSupply: 1_000,
};
