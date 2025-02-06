// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Epochs} from "../../common/Epochs.sol";
import {Guarded} from "../../common/Guarded.sol";
import {Initializable} from "../../common/Initializable.sol";
import {IACTImpl} from "../impls/interfaces/IACTImpl.sol";
import {IACTRegistry} from "./interfaces/IACTRegistry.sol";

/**
 * @title ACTRegistry
 */
contract ACTRegistry is EIP712, Guarded, Initializable, IACTRegistry {
  bytes32 private constant TOKEN_TYPED_DATA_HASH =
    keccak256(
      "Token(uint8 variant,address maintainer,string name,string symbol)"
    );

  // enums

  enum Variants {
    UnknownOrAny, // 0
    Fungible, // 1
    NonFungible // 2
  }

  // structs

  struct TokenTypedData {
    Variants variant;
    address maintainer;
    string name;
    string symbol;
  }

  struct ExtensionOptions {
    bool active;
    Variants variant;
  }

  struct CreatedToken {
    bytes32 salt;
    Variants variant;
  }

  // storage

  address private _entryPoint;

  Epochs.Settings private _epochsSettings;

  mapping(Variants => address) private _variantImpls;

  mapping(address => ExtensionOptions) private _extensionOptions;

  mapping(address => CreatedToken) private _createdTokens;

  // errors

  error MsgSenderIsNotACreatedToken();

  error ZeroAddressVariantImpl();

  error ZeroAddressExtension();

  error InvalidVariant();

  // events

  event Initialized(
    address entryPoint,
    address owner,
    address[] guardians,
    Epochs.Settings epochsSettings
  );

  event TokenCreated(
    address token,
    Variants variant,
    bytes data,
    uint256 timestamp
  );

  event TokenEvent(address token, bytes data, uint256 timestamp);

  event VariantUpdated(Variants variant, address impl);

  event ExtensionUpdated(address extension, ExtensionOptions options);

  // modifiers

  modifier onlyCreatedToken() {
    _requireOnlyCreatedToken();
    _;
  }

  // deployment

  /**
   * @notice Constructor for the ACTRegistry contract.
   * @dev Initializes the contract with the given EIP712 name and initializer address.
   * @param eip712Name The name to be used for EIP712 domain separator.
   * @param initializer The address responsible for the one-time initialization of the contract.
   */
  constructor(
    string memory eip712Name,
    address initializer
  ) EIP712(eip712Name, "1") Initializable(initializer) {
    //
  }

  /**
   * @notice Initializes the contract with the provided parameters.
   * @dev Can only be called once due to the `initializeOnce` modifier.
   * @param entryPoint The address of the ERC4337 entry point.
   * @param owner The address of the contract owner.
   * @param guardians The list of guardian addresses to set.
   * @param epochWindowLength The length of the epoch window in seconds.
   */
  function initialize(
    address entryPoint,
    address owner,
    address[] calldata guardians,
    uint48 epochWindowLength
  ) external initializeOnce {
    _entryPoint = entryPoint;

    owner = _setInitialOwner(owner);
    _setInitialGuardians(guardians);

    Epochs.Settings memory epochsSettings = Epochs.initEpochSettings(
      epochWindowLength
    );

    _epochsSettings = epochsSettings;

    emit Initialized(entryPoint, owner, guardians, epochsSettings);
  }

  // external getters

  function getEntryPoint() external view returns (address) {
    return _entryPoint;
  }

  /**
   * @notice Retrieves the current epoch based on the contract's epoch settings.
   * @return The current epoch as a uint48 value.
   */
  function getCurrentEpoch() external view returns (uint48) {
    return Epochs.calcEpoch(_epochsSettings);
  }

  /**
   * @notice Retrieves the settings of the current epoch.
   * @dev Provides details of the epoch such as its duration and configuration.
   * @return The settings of the epoch as an `Epochs.Settings` struct.
   */
  function getEpochSettings() external view returns (Epochs.Settings memory) {
    return _epochsSettings;
  }

  /**
   * @notice Retrieves the implementation address for a specific token variant.
   * @param variant The token variant to query.
   * @return The address of the implementation for the specified token variant.
   */
  function getVariantImpl(Variants variant) external view returns (address) {
    return _variantImpls[variant];
  }

  /**
   * @notice Fetches the configuration options for a specific extension.
   * @param extension The address of the extension to query.
   * @return The configuration options for the given extension.
   */
  function getExtensionOptions(
    address extension
  ) external view returns (ExtensionOptions memory) {
    return _extensionOptions[extension];
  }

  /**
   * @notice Checks if an extension is enabled for the caller's token.
   * @param extension The address of the extension to check.
   * @return A boolean indicating whether the extension is enabled.
   */
  function isExtensionEnabled(address extension) external view returns (bool) {
    ExtensionOptions memory extensionOptions = _extensionOptions[extension];

    return
      extensionOptions.active &&
      (extensionOptions.variant == Variants.UnknownOrAny ||
        extensionOptions.variant == _createdTokens[msg.sender].variant);
  }

  /**
   * @notice Retrieves information about a created token by its address.
   * @param token The address of the created token.
   * @return A `CreatedToken` struct containing the token's details.
   */
  function getCreatedToken(
    address token
  ) external view returns (CreatedToken memory) {
    return _createdTokens[token];
  }

  /**
   * @notice Generates a hash for a token's typed data.
   * @param token The `TokenTypedData` struct containing details about the token.
   * @return A bytes32 hash of the specified token's data.
   */
  function hashToken(
    TokenTypedData calldata token
  ) external view returns (bytes32) {
    return
      _hashTokenTypedData(
        token.variant,
        token.maintainer,
        token.name,
        token.symbol
      );
  }

  /**
   * @notice Computes the predictable address for a token given its variant and symbol.
   * @param variant The token variant (e.g., Fungible, NonFungible).
   * @param symbol The symbol of the token.
   * @return The computed address of the token.
   */
  function computeTokenAddress(
    Variants variant,
    string calldata symbol
  ) external view returns (address) {
    return _computeTokenAddress(variant, symbol);
  }

  // external setters

  /**
   * @notice Sets the implementation address for a specific token variant.
   * @dev Can only be called by the owner of the contract.
   * Emits a `VariantUpdated` event if the variant implementation is successfully updated.
   * @param variant The token variant to set the implementation for.
   * @param impl The implementation contract address for the specified variant.
   * @return A boolean indicating whether the variant implementation was updated successfully.
   */
  function setVariant(
    Variants variant,
    address impl
  ) external onlyOwner returns (bool) {
    require(variant != Variants.UnknownOrAny, InvalidVariant());
    require(impl != address(0), ZeroAddressVariantImpl());

    if (_variantImpls[variant] == impl) {
      // nothing to do
      return false;
    }

    _variantImpls[variant] = impl;

    emit VariantUpdated(variant, impl);

    return true;
  }

  /**
   * @notice Configures or updates the settings for a specific extension.
   * @dev Can only be called by the owner of the contract.
   * Emits an `ExtensionUpdated` event if the extension configuration is successfully updated.
   * @param extension The address of the extension to configure.
   * @param options The configuration options to set for the extension.
   * @return A boolean indicating whether the extension configuration was updated successfully.
   */
  function setExtension(
    address extension,
    ExtensionOptions memory options
  ) external onlyOwner returns (bool) {
    require(extension != address(0), ZeroAddressExtension());

    ExtensionOptions memory oldOptions = _extensionOptions[extension];

    if (
      oldOptions.active == options.active &&
      oldOptions.variant == options.variant
    ) {
      // nothing to do
      return false;
    }

    _extensionOptions[extension] = options;

    emit ExtensionUpdated(extension, options);

    return true;
  }

  /**
   * @notice Creates a new token with the specified parameters.
   * @dev Can only be called by the owner of the contract.
   * @param variant The token variant to create.
   * @param maintainer The address of the token's maintainer.
   * @param name The name of the token.
   * @param symbol The symbol of the token.
   * @return The address of the created token.
   */
  function createToken(
    Variants variant,
    address maintainer,
    string calldata name,
    string calldata symbol
  ) external onlyOwner returns (address) {
    return _createToken(variant, maintainer, name, symbol);
  }

  /**
   * @notice Creates a new token using a guardian signature for verification.
   * @dev Requires a valid guardian signature for authorization.
   * @param variant The token variant to create.
   * @param maintainer The address of the token's maintainer.
   * @param name The name of the token.
   * @param symbol The symbol of the token.
   * @param guardianSignature The signature from a guardian authorizing the token creation.
   * @return The address of the created token.
   */
  function createToken(
    Variants variant,
    address maintainer,
    string calldata name,
    string calldata symbol,
    bytes calldata guardianSignature
  ) external returns (address) {
    _requireGuardianSignature(
      _hashTokenTypedData(variant, maintainer, name, symbol),
      guardianSignature
    );

    return _createToken(variant, maintainer, name, symbol);
  }

  /**
   * @notice Emits a custom event from a created token with the provided data.
   * @dev Can only be called by contract addresses that correspond to created tokens.
   * Emits a `TokenEvent` with the specified data.
   * @param data Arbitrary data to include in the emitted event.
   */
  function emitTokenEvent(bytes calldata data) external onlyCreatedToken {
    emit TokenEvent(msg.sender, data, block.timestamp);
  }

  // private getters

  function _requireOnlyCreatedToken() private view {
    require(
      _createdTokens[msg.sender].variant != Variants.UnknownOrAny,
      MsgSenderIsNotACreatedToken()
    );
  }

  function _hashTokenTypedData(
    Variants variant,
    address maintainer,
    string calldata name,
    string calldata symbol
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            TOKEN_TYPED_DATA_HASH,
            variant,
            maintainer,
            keccak256(abi.encodePacked(name)),
            keccak256(abi.encodePacked(symbol))
          )
        )
      );
  }

  function _computeTokenSalt(
    string calldata symbol
  ) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(symbol));
  }

  function _computeTokenAddress(
    Variants variant,
    string calldata symbol
  ) private view returns (address result) {
    address impl = _variantImpls[variant];

    if (impl != address(0)) {
      result = Clones.predictDeterministicAddress(
        impl,
        _computeTokenSalt(symbol),
        address(this)
      );
    }

    return result;
  }

  // private setters

  function _createToken(
    Variants variant,
    address maintainer,
    string calldata name,
    string calldata symbol
  ) private returns (address token) {
    address impl = _variantImpls[variant];

    // Ensure the implementation address for the specified variant is not zero
    require(impl != address(0), InvalidVariant());

    // Compute the unique salt using the token symbol
    bytes32 salt = _computeTokenSalt(symbol);

    // Deploy a new proxy instance deterministically using the implementation and salt
    token = Clones.cloneDeterministic(impl, salt);

    // Prepare the initialization data for the created token
    bytes memory data = abi.encodeCall(
      IACTImpl.initialize,
      (_entryPoint, maintainer, name, symbol, _epochsSettings)
    );

    // Initialize the deployed token by calling the initialize function
    // solhint-disable-next-line avoid-low-level-calls
    (bool success, bytes memory response) = token.call(data);

    // If the initialization fails, revert and return the error message
    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        revert(add(response, 32), mload(response))
      }
    }

    // Store the created token's metadata in the mapping
    CreatedToken storage createdToken = _createdTokens[token];
    createdToken.salt = salt;
    createdToken.variant = variant;

    emit TokenCreated(token, variant, data, block.timestamp);

    return token;
  }
}
