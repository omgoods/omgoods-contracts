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
npm run deployments:export  # exports all deployments into ./deployments.ts
npm run deployments:verify  # verifies all deployments on etherscan

npm run events:generate     # generates sample events (localhost network only)
npm run tokens:create       # creates a token

npm run hardhat             # hardhat cli wrapper
```

## License

NONE

[coverage-image]: https://github.com/omgoods/omgoods-contracts/actions/workflows/coverage.yml/badge.svg
[coverage-url]: https://github.com/omgoods/omgoods-contracts/actions/workflows/coverage.yml

[license-image]: https://img.shields.io/badge/license-NONE-red.svg
