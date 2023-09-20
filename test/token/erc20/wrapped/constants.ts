import { TypedDataDomain } from 'ethers';
import { ERC20_EXTERNAL_TOKEN_MOCK } from '../constants';

export const ERC20_WRAPPED_TOKEN_FACTORY_TYPED_DATA_DOMAIN: TypedDataDomain = {
  name: 'Test ERC20WrappedTokenFactory',
  version: '0.0.0',
};

export const ERC20_UNDERLYING_TOKEN = {
  ...ERC20_EXTERNAL_TOKEN_MOCK,
  name: 'Underlying Token',
  symbol: 'UNDERLYING_TOKEN',
};

export const ERC20_WRAPPED_TOKEN: typeof ERC20_UNDERLYING_TOKEN = {
  ...ERC20_UNDERLYING_TOKEN,
  initialSupply: 1_000,
};
