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
     hardhat deploy --network sepolia
     hardhat deploy --network sepoliaOptimism

    # hardhat deployments:verify --network sepolia
    # hardhat deployments:verify --network sepoliaOptimism
    ;;

  *) # hardhat
    npm start
    exit 0
esac

hardhat deployments:export
