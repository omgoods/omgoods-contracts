// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {ERC20TokenImpl} from "./ERC20TokenImpl.sol";

contract ERC20TokenWrappedImpl is ERC20TokenImpl {
  struct InitializationData {
    address forwarder;
    address underlyingToken;
  }

  bytes32 private constant INITIALIZATION_TYPEHASH =
    keccak256(
      "Initialization(address forwarder,address underlyingToken)" //
    );
  // storage

  address private _underlyingToken;

  // deployment

  constructor(string memory eip712Name) ERC20TokenImpl(eip712Name) {
    //
  }

  function initialize(address forwarder, address underlyingToken) external {
    _setForwarder(forwarder);
    _setReady(true, false);
    _setUnderlyingToken(underlyingToken);
  }

  // external getters

  function getUnderlyingToken() external view returns (address) {
    return _getUnderlyingToken();
  }

  function hashInitialization(
    InitializationData calldata initializationData
  ) private view returns (bytes32) {
    return
      _hashInitialization(
        keccak256(
          abi.encode(
            INITIALIZATION_TYPEHASH, //
            initializationData.forwarder,
            initializationData.underlyingToken
          )
        )
      );
  }

  // external setters

  function wrap(uint256 value) external {
    address sender = _msgSender();

    _wrap(sender, sender, value);
  }

  function wrapTo(address to, uint256 value) external {
    _wrap(_msgSender(), to, value);
  }

  function unwrap(uint256 value) external {
    address sender = _msgSender();

    _unwrap(sender, sender, value);
  }

  function unwrapTo(address to, uint256 value) external {
    address sender = _msgSender();

    _unwrap(sender, to, value);
  }

  // internal getters

  function _getName() internal view override returns (string memory) {
    return IERC20Metadata(_underlyingToken).name();
  }

  function _getSymbol() internal view override returns (string memory) {
    return IERC20Metadata(_underlyingToken).symbol();
  }

  function _getDecimals() internal view override returns (uint8) {
    return IERC20Metadata(_underlyingToken).decimals();
  }

  function _getUnderlyingToken() internal view returns (address) {
    return _underlyingToken;
  }

  // internal setters

  function _setUnderlyingToken(address underlyingToken) internal {
    _underlyingToken = underlyingToken;
  }

  function _wrap(address from, address to, uint256 value) internal {
    IERC20(_underlyingToken).transferFrom(from, address(this), value);

    _mint(to, value);
  }

  function _unwrap(address from, address to, uint256 value) internal {
    _burn(from, value);

    IERC20(_underlyingToken).transfer(to, value);
  }
}
