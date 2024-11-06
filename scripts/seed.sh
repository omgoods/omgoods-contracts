#!/bin/bash

source common.sh

ACCOUNT="${1-"0xEEb4801FBc9781EEF20801853C1Cb25faB8A7a3b"}"

seed() {
  hardhat faucet --network "$*" --to "$ACCOUNT" --value "100"
}

seed local
seed localOptimism
