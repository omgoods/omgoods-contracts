export const LOCAL_NETWORK_CONFIG = {
  accounts: {
    mnemonic: 'test test test test test test test test test test test junk',
    count: 10,
    initialIndex: 7,
  },
  type: 'localnet' as const,
};

export const LOCALHOST_NETWORK_CHAIN_ID = 31337;
export const LOCALHOST_NETWORK_URL = ' http://127.0.0.1:7545/';
