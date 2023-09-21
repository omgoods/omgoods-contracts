import '@newobject/dotenv/setup';
import '@nomicfoundation/hardhat-ledger';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import { createConfig } from './hardhat';

export default createConfig({
  solidity: {
    version: '0.8.21',
    settings: {
      metadata: { bytecodeHash: 'none' },
      optimizer: { enabled: true, runs: 10_000 },
    },
  },
  networks: {
    ethereum: {
      chainId: 1,
      type: 'mainnet',
    },
    ethereumGoerli: {
      chainId: 5,
      type: 'testnet',
    },
    optimism: {
      chainId: 10,
      type: 'mainnet',
    },
    optimismGoerli: {
      chainId: 420,
      type: 'testnet',
    },
  },
  contracts: {
    Gateway: {
      typedData: {
        domain: {
          name: 'OM!goods Gateway',
          version: '0.0.1',
        },
        types: {
          Request: [
            {
              name: 'account',
              type: 'address',
            },
            {
              name: 'nonce',
              type: 'uint256',
            },
            {
              name: 'to',
              type: 'address',
            },
            {
              name: 'data',
              type: 'bytes',
            },
          ],
          RequestBatch: [
            {
              name: 'account',
              type: 'address',
            },
            {
              name: 'nonce',
              type: 'uint256',
            },
            {
              name: 'to',
              type: 'address[]',
            },
            {
              name: 'data',
              type: 'bytes[]',
            },
          ],
        },
      },
      build: true,
    },
    ERC20TokenRegistry: {
      build: true,
    },
    ERC20ControlledToken: {
      build: {
        name: 'ERC20ControlledTokenImpl',
        address: false,
      },
    },
    ERC20ControlledTokenImpl: {
      build: {
        abi: false,
      },
    },
    ERC20ControlledTokenFactory: {
      typedData: {
        domain: {
          name: 'OM!goods ERC20 Controlled Token',
          version: '0.0.1',
        },
        types: {
          Token: [
            {
              name: 'name',
              type: 'string',
            },
            {
              name: 'symbol',
              type: 'string',
            },
            {
              name: 'owner',
              type: 'address',
            },
            {
              name: 'minter',
              type: 'address',
            },
            {
              name: 'burner',
              type: 'address',
            },
            {
              name: 'initialSupply',
              type: 'uint256',
            },
          ],
        },
      },
      build: true,
    },
    ERC20FixedToken: {
      build: {
        name: 'ERC20FixedTokenImpl',
        address: false,
      },
    },
    ERC20FixedTokenImpl: {
      build: {
        abi: false,
      },
    },
    ERC20FixedTokenFactory: {
      typedData: {
        domain: {
          name: 'OM!goods ERC20 Fixed Token',
          version: '0.0.1',
        },
        types: {
          Token: [
            {
              name: 'name',
              type: 'string',
            },
            {
              name: 'symbol',
              type: 'string',
            },
            {
              name: 'owner',
              type: 'address',
            },
            {
              name: 'totalSupply',
              type: 'uint256',
            },
          ],
        },
      },
      build: true,
    },
    ERC20WrappedToken: {
      build: {
        name: 'ERC20WrappedTokenImpl',
        address: false,
      },
    },
    ERC20WrappedTokenImpl: {
      build: {
        abi: false,
      },
    },
    ERC20WrappedTokenFactory: {
      typedData: {
        domain: {
          name: 'OM!goods ERC20 Wrapped Token',
          version: '0.0.1',
        },
        types: {
          Token: [
            {
              name: 'underlyingToken',
              type: 'address',
            },
          ],
        },
      },
      build: true,
    },
    Proxy: {
      build: {
        address: false,
        abi: false,
        byteCode: true,
      },
    },
    ERC20Token: {
      build: {
        name: 'IERC20',
        address: false,
      },
    },
    ERC1271Account: {
      build: {
        name: 'IERC1271',
        address: false,
      },
    },
  },
});
