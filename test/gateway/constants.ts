import { testing } from 'hardhat';
import { TypedDataDomain } from 'ethers';

const { randomAddress, randomHex } = testing;

export const GATEWAY_TYPED_DATA_DOMAIN: TypedDataDomain = {
  name: 'Test Gateway',
  version: '0.0.0',
};

export const GATEWAY_REQUEST = {
  account: randomAddress(),
  nonce: 0,
  to: randomAddress(),
  data: randomHex(20),
};

export const GATEWAY_REQUEST_BATCH = {
  account: randomAddress(),
  nonce: 0,
  to: [randomAddress()],
  data: [randomHex(20)],
};
