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
npm start                   # starts hardhat node

npm run linter              # runs solhint
npm run format              # runs prettier
npm run compile             # compiles contracts
npm run test                # runs unit tests
npm run coverage            # runs coverage tests
npm run deploy              # deploys contracts
npm run deployments:export  # exports all deployed contracts into ./deployments/exported/*.ts
npm run deployments:verify  # verifies all deployed contracts on etherscan
npm run faucet              # top-ups account
npm run tokens:generate     # generates tokens
npm run hardhat             # hardhat cli wrapper
```

## License

NONE

[coverage-image]: https://github.com/omgoods/omgoods-contracts/actions/workflows/coverage.yml/badge.svg
[coverage-url]: https://github.com/omgoods/omgoods-contracts/actions/workflows/coverage.yml

[license-image]: https://img.shields.io/badge/license-NONE-red.svg
