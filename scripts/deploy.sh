#!/bin/bash

ROOT_PATH=$(dirname "$0")

source "${ROOT_PATH}/common.sh"

case $1 in
  "localnets")
    hardhat deploy --network local
    hardhat deploy --network localOptimism
    ;;

  "mainnets")
    # hardhat deploy --network ethereum
    # hardhat deploy --network ethereumOptimism

    # hardhat deployments:verify --network ethereum
    # hardhat deployments:verify --network ethereumOptimism
    ;;

  "testnets")
    # hardhat deploy --network goerli
    # hardhat deploy --network goerliOptimism

    # hardhat deployments:verify --network goerli
    # hardhat deployments:verify --network goerliOptimism
    ;;

  *) # hardhat
    npm start
    exit 0
esac

hardhat deployments:export