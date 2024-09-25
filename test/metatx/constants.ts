import { utils } from 'hardhat';

const { randomAddress, randomHex } = utils;

export const FORWARDER_REQUEST = {
  account: randomAddress(),
  nonce: 0,
  to: randomAddress(),
  data: randomHex(20),
};

export const FORWARDER_REQUEST_BATCH = {
  account: randomAddress(),
  nonce: 0,
  to: [randomAddress()],
  data: [randomHex(20)],
};
