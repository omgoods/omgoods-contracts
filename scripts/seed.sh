#!/bin/bash

source common.sh

ACCOUNT="${2-"0xEEb4801FBc9781EEF20801853C1Cb25faB8A7a3b"}"

case $1 in
  "local")
    hardhat account:faucet --network local \
      --account "$ACCOUNT" \
      --value 100

    hardhat tokens:erc20:generate --network local \
      --account "$ACCOUNT" \
      --initial-metadata-index 10 \
      --total-regular 3 \
      --wrapped

    hardhat tokens:erc721:generate --network local \
      --account "$ACCOUNT" \
      --initial-metadata-index 30 \
      --total-regular 2
    ;;
  "localOptimism")
    hardhat account:faucet --network localOptimism \
      --account "$ACCOUNT" \
      --value 100

    hardhat tokens:erc20:generate --network localOptimism \
      --account "$ACCOUNT" \
      --initial-metadata-index 20 \
      --total-regular 2

    hardhat tokens:erc721:generate --network localOptimism \
      --account "$ACCOUNT" \
      --initial-metadata-index 40 \
      --total-regular 3
    ;;
  *)
    hardhat account:faucet --network localhost \
      --account "$ACCOUNT" \
      --value 100

    hardhat tokens:erc20:generate --network localhost \
      --account "$ACCOUNT" \
      --total-regular 3 \
      --wrapped

    hardhat tokens:erc721:generate --network localhost \
      --account "$ACCOUNT" \
      --initial-metadata-index 5 \
      --total-regular 2
esac













