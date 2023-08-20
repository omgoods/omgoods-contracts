import '@nomicfoundation/hardhat-ledger';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import { HardhatUserConfig } from 'hardhat/config';
import { buildNetworks, getEnvAsBool } from './hardhat';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.21',
    settings: {
      metadata: { bytecodeHash: 'none' },
      optimizer: { enabled: true, runs: 10_000 },
    },
  },
  paths: {
    artifacts: '.hardhat/artifacts',
    cache: '.hardhat/cache',
  },
  typechain: {
    outDir: 'typechain',
  },
  namedAccounts: {
    owner: 0,
    deployer: 1,
  },
  networks: buildNetworks({
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
  }),
  contracts: {
    AccountImpl: {
      build: {
        name: 'Account',
      },
    },
    AccountRegistry: {
      build: true,
    },
    Gateway: {
      typeDataDomain: {
        name: 'OM!goods Gateway',
        version: '0.0.1',
      },
      build: true,
    },
    ERC20TokenRegistry: {
      build: true,
    },
    ERC20ControlledTokenImpl: {
      build: {
        name: 'ERC20ControlledToken',
      },
    },
    ERC20ControlledTokenFactory: {
      typeDataDomain: {
        name: 'OM!goods ERC20 Controlled Token',
        version: '0.0.1',
      },
      build: true,
    },
    ERC20FixedTokenImpl: {
      build: {
        name: 'ERC20FixedToken',
      },
    },
    ERC20FixedTokenFactory: {
      typeDataDomain: {
        name: 'OM!goods ERC20 Fixed Token',
        version: '0.0.1',
      },
      build: true,
    },
    ERC20WrappedTokenImpl: {
      build: {
        name: 'ERC20WrappedToken',
      },
    },
    ERC20WrappedTokenFactory: {
      typeDataDomain: {
        name: 'OM!goods ERC20 Wrapped Token',
        version: '0.0.1',
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
    IERC20: {
      build: {
        name: 'ERC20Token',
        address: false,
      },
    },
  },
  gasReporter: {
    enabled: getEnvAsBool('ENABLED_GAS_REPORTER'),
  },
  deterministicDeployment: {
    // TODO: https://github.com/wighawag/hardhat-deploy#4-deterministicdeployment-ability-to-specify-a-deployment-factory
  },
};

export default config;
