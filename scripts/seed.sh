#!/bin/bash

ROOT_PATH=$(dirname "$0")

source "${ROOT_PATH}/common.sh"

ACCOUNT="${2-"0xEEb4801FBc9781EEF20801853C1Cb25faB8A7a3b"}"

case $1 in
  "local")
    hardhat account:faucet --network local \
      --account "$ACCOUNT" \
      --value 100

    hardhat tokens:erc20:generate --network local \
      --account "$ACCOUNT" \
      --initial-metadata-index 70 \
      --total-regular 3

    hardhat tokens:erc721:generate --network local \
      --account "$ACCOUNT" \
      --initial-metadata-index 75 \
      --total-regular 2
    ;;

  "localOp")
    hardhat account:faucet --network localOp \
      --account "$ACCOUNT" \
      --value 100

    hardhat tokens:erc20:generate --network localOp \
      --account "$ACCOUNT" \
      --initial-metadata-index 80 \
      --total-regular 2

    hardhat tokens:erc721:generate --network localOp \
      --account "$ACCOUNT" \
      --initial-metadata-index 85 \
      --total-regular 3
    ;;

  *) # hardhat
    hardhat account:faucet --network localhost \
      --account "$ACCOUNT" \
      --value 100

    hardhat tokens:erc20:generate --network localhost \
      --account "$ACCOUNT" \
      --initial-metadata-index 0 \
      --total-regular 35 \
      --wrapped

    hardhat tokens:erc721:generate --network localhost \
      --account "$ACCOUNT" \
      --initial-metadata-index 35 \
      --total-regular 35
esac













