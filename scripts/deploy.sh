#!/bin/bash

ROOT_PATH=$(dirname "$0")

source "${ROOT_PATH}/common.sh"

case $1 in
  "localnets")
    hardhat deploy --network local
    hardhat deploy --network localOp
    ;;

  "mainnets")
    # hardhat deploy --network eth
    # hardhat deploy --network op
    # hardhat deploy --network bnb

    # hardhat deployments:verify --network eth
    # hardhat deployments:verify --network op
    # hardhat deployments:verify --network bnb
    ;;

  "testnets")
     hardhat deploy --network ethSepolia
     hardhat deploy --network opSepolia
     hardhat deploy --network bnbTestnet

    # hardhat deployments:verify --network ethSepolia
    # hardhat deployments:verify --network opSepolia
    # hardhat deployments:verify --network bnbTestnet
    ;;

  *) # hardhat
    npm start
    exit 0
esac

hardhat deployments:export
