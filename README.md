# OM!goods contracts

[![Coverage workflow][coverage-image]][coverage-url]
![License NONE][license-image]

## Installation

```bash
npm i
```

## Configuration

Copy `.env` to `.env.local` to set or override environment variables. 

## Scripts

```bash
# npm
npm start         # starts hardhat node
npm run linter    # runs solhint
npm run format    # runs prettier
npm run compile   # compiles contracts
npm run test      # runs unit tests
npm run coverage  # runs coverage tests
npm run hardhat   # hardhat cli wrapper

# bash
cd ./scripts
./deploy.sh [networks]        # deploys contracts
                              # networks (default: hardhat network):
                              # localnets, mainnets, testnets 

./seed.sh [network] [account] # generates tokens and sample events
                              # network (default: hardhat network):
                              # local, localOp 
```

## License

NONE

[coverage-image]: https://github.com/omgoods/omgoods-contracts/actions/workflows/coverage.yml/badge.svg
[coverage-url]: https://github.com/omgoods/omgoods-contracts/actions/workflows/coverage.yml

[license-image]: https://img.shields.io/badge/license-NONE-red.svg
