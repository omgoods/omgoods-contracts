#!/bin/bash

ROOT_PATH=$(dirname "$ROOT_PATH")

cd "$ROOT_PATH" || exit 0;

hardhat () {
  # shellcheck disable=SC2086,SC2048
  npm run hardhat -- $*
}
