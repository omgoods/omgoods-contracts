# OM!goods contracts

![License NONE][license-image]

> Work in progress...

**OM!goods contracts** are a set of essential smart contracts on the OM!goods platform, responsible for deployment,
configuration, and integration within the ecosystem. They are continuously developed to introduce new features and
ensure reliability. While they draw inspiration from token-based concepts, they are precisely tailored to OM!goods’
needs, ensuring a seamless experience on the platform.

## Installation

```bash
npm i
```

## Documentation

* [ACT - Autonomous Community Token](docs/act/README.md)

## Running examples

```bash
npm run example:act-as-fungible-token
# WIP: npm run example:act-as-non-fungible-token 
npm run example:act-as-smart-wallet
npm run example:act-as-dao
```

## Scripts

```bash
npm start               # starts hardhat node
npm run linter          # runs solhint
npm run format          # runs prettier
npm run compile         # compiles contracts
npm run deploy          # deploys contracts
npm run test            # runs tests
npm run hardhat         # hardhat cli wrapper
npm run example:<name>  # runs <name> example
```

## License

NONE

> This project is proprietary and is not licensed for public use, modification, or distribution.<br/>
> Unauthorized use, reproduction, or distribution of this software is strictly prohibited.

[license-image]: https://img.shields.io/badge/license-NONE-red.svg
