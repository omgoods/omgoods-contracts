# ACT - Autonomous Community Token

## Overview

ACT (Autonomous Community Token) is a flexible token standard built on top of common `ERC-20` and `ERC-721` interfaces,
combined with functionalities resembling a modern smart wallet. It enables the creation of fungible (`ERC-20`) and
non-fungible (`ERC-721`) tokens, managed through an `ACTRegistry` (acts as a factory for new tokens). The goal is to
deliver enhanced governance capabilities, including tracking weekly epochs for balance-based voting and supporting
multiple governance styles.

## Token Variants

1. **Fungible Token**
    - Standard `ERC-20` interface.
    - (optional) Tracks balance over 7-day epochs.
2. **Non-Fungible Token**
    - Standard `ERC-721` interface.
    - (optional) Tracks the quantity of owned assets over 7-day epochs.

## Extensibility Through Extensions

The ACT framework allows adding extensions to tokens for extra features:

1. `ACTSignerExtension`
    - Stores signatures that can later be verified for account abstraction `userOp` (`ERC-4337`) or via <br/>
      the `isValidSignature` (`ERC-1271`) interface.
2. `ACTVotingExtension`
    - Enables creation and execution of proposals through a voting process.
    - The token acts on its own methods as the owner when proposals are approved.
3. `ACTWalletExtension`
    - Allows the token (or its governance) to initiate external transactions.
    - Useful for sending funds or interacting with other contracts from the token itself.

## Epoch Concept

An epoch is a 7-day period during which each account's balance is tracked:

- For fungible tokens, the balance is the total amount of tokens held.
- For non-fungible tokens, the balance is the count of owned NFTs.

These epoch-based balances influence voting power in the `ACTVotingExtension`.

**Note:** The usage of epochs is optional. You can enable epoch tracking as needed.

## Governance Models

Tokens under the ACT framework can operate under one of three proposed governance models:

1. **Absolute Monarchy**<br/>
   In this model, the token's maintainer has full control over the token. This individual becomes the owner of
   the token and can make decisions independently.
2. **Constitutional Monarchy**<br/>
   The token's maintainer has only limited ability to perform actions immediately. However, by using a voting module (
   for example, `ACTVotingExtension`), they can propose changes or actions. In this model, ownership is transferred to
   the token itself, meaning all actions conclude at the contract level, and the maintainer merely manages it under a
   constitutional form of authority.
3. **Democracy**<br/>
   This model closely resembles _Constitutional Monarchy_; however, the difference lies in who can initiate the voting
   process. In a democracy, any token holder (with sufficient governance standing, e.g., positive voting power in the
   previous epoch) can propose and initiate votes on changes or actions, enabling a more decentralized community
   decision-making process.

## Voting Process (`ACTVotingExtension`)

- Depending on the governance model:
    - **Constitutional Monarchy** - maintainer can propose an action.
    - **Democracy** - any user with positive voting power in the previous epoch can propose an action.
- The action is encoded as a self-call transaction the contract will perform if approved.
- The voting power comes from the tracked balance in either the current or previous epoch, whichever is lower.
- Voting begins in the next epoch and lasts until the epoch ends.
- Votes are cast as `Accept` or `Reject`, and if `Accept` votes exceed `Reject` votes, the proposed action executes once
  voting concludes.
- Actions will allow the execution of all `ownerOnly` contract methods.
- Possible actions include external transactions (via `ACTWalletExtension`), signature operations (via
  `ACTSignerExtension`).

## Examples

### Can act as Fungible (`ERC-20`) Token

```bash
npm run example:act-as-fungible-token
```

**Source:** [examples/act-as-fungible-token.ts](../../examples/act-as-fungible-token.ts)

### WIP: Can act as Non-Fungible (`ERC-721`) Token

```bash
npm run example:act-as-non-fungible-token
```

**Source:** [examples/act-as-non-fungible-token.ts](../../examples/act-as-non-fungible-token.ts)

### Can act as Smart Contract Wallet (`ERC-4337`)

```bash
npm run example:act-as-smart-wallet
```

**Source:** [examples/act-as-smart-wallet.ts](../../examples/act-as-smart-wallet.ts)

### Can act as DAO

```bash
npm run example:act-as-dao
```

**Source:** [examples/act-as-dao.ts](../../examples/act-as-dao.ts)

