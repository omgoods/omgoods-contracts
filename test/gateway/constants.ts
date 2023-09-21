import { testing } from 'hardhat';

const { randomAddress, randomHex } = testing;

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
