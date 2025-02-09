# OM!goods contracts

![License NONE][license-image]

> Work in progress...

## Installation

```bash
npm i
```

## ACT (Autonomous Community Token)

### Features

* Can act as **Fungible** (`ERC-20`) or **Non-Fungible** (`ERC-721`) token
  * [./examples/act-as-fungible-token.ts](./scripts)
  * [./examples/act-as-non-fungible-token.ts](./scripts)
* Can act as **Smart Contract Wallet** (`ERC-4337`)
  * [./examples/act-smart-wallet.ts](./scripts)
* Can act as **DAO**
  * `WIP` 

## Scripts

```bash
npm run linter    # runs solhint
npm run format    # runs prettier
npm run compile   # compiles contracts
npm run deploy    # deploys contracts
npm run test      # runs unit tests
npm run hardhat   # hardhat cli wrapper
```

## License

NONE

> This project is proprietary and is not licensed for public use, modification, or distribution.<br/> 
> Unauthorized use, reproduction, or distribution of this software is strictly prohibited.

[license-image]: https://img.shields.io/badge/license-NONE-red.svg
