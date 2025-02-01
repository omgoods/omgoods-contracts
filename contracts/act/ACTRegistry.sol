// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Epochs} from "../common/Epochs.sol";
import {Initializable} from "../common/Initializable.sol";
import {Guarded} from "../common/Guarded.sol";
import {ForwarderContext} from "../metatx/ForwarderContext.sol";
import {IACT} from "./interfaces/IACT.sol";
import {IACTRegistry} from "./interfaces/IACTRegistry.sol";

contract ACTRegistry is Initializable, Guarded, ForwarderContext, IACTRegistry {
  // structs

  struct Token {
    bool created;
  }

  // storage

  Epochs.Settings private _epochsSettings;

  mapping(address addr => Token token) private _tokens;

  mapping(bytes32 salt => address addr) private _tokensSalts;

  // errors

  /**
   * @dev Reverts when the sender is not a registered token in the contract.
   */
  error MsgSenderIsNotAToken();

  /**
   * @dev Reverts when attempting to create a token that already exists.
   */
  error TokenAlreadyCreated();

  // events

  /**
   * @notice Emitted when a token-related event occurs.
   * @param token The address of the token triggering the event.
   * @param data Additional data associated with the event.
   * @param timestamp The timestamp when the event occurred.
   */
  event TokenEvent(address token, bytes data, uint256 timestamp);

  /**
   * @notice Emitted when a new token is successfully created.
   * @param token The address of the newly created token.
   * @param data The initialization data of the created token.
   * @param timestamp The timestamp when the token was created.
   */
  event TokenCreated(address token, bytes data, uint256 timestamp);

  // modifiers

  modifier onlyToken() {
    require(_tokens[_msgSender()].created, MsgSenderIsNotAToken());

    _;
  }

  // deployment

  /**
   * @notice Constructor for the ACTRegistry contract.
   * @dev Initializes the contract with an initializer address.
   * @param initializer The address that will be used to initialize the contract.
   */
  constructor(address initializer) Initializable(initializer) {
    //
  }

  /**
   * @notice Initializes the contract with the given parameters.
   * @dev This function can only be called once due to the `initializeOnce` modifier.
   * @param owner The address to be set as the initial owner of the contract.
   * @param guardians An array of addresses that will act as guardians for the contract.
   * @param forwarder The address of the meta-transaction forwarder.
   * @param epochWindowLength The length of the epoch window, in seconds.
   */
  function initialize(
    address owner,
    address[] calldata guardians,
    address forwarder,
    uint48 epochWindowLength
  ) external initializeOnce {
    _setInitialOwner(owner);
    _setInitialGuardians(guardians);

    _forwarder = forwarder;
    _epochsSettings = Epochs.initEpochSettings(epochWindowLength);
  }

  // external setters

  /**
   * @notice Creates a new token using the provided parameters.
   * @dev This function can only be called by the contract owner.
   * Internally calls the `_createToken` function to handle the token creation logic.
   * @param variant The address of the token variant to clone.
   * @param name The name of the token to be created.
   * @param symbol The symbol of the token to be created.
   * @param maintainer The address of the maintainer of the token.
   * @param ready A boolean indicating whether the token should be ready upon creation.
   * @return The address of the newly created token.
   */
  function createToken(
    address variant,
    string calldata name,
    string calldata symbol,
    address maintainer,
    bool ready
  ) external onlyOwner returns (address) {
    return _createToken(variant, name, symbol, maintainer, ready);
  }

  function emitTokenEvent(bytes calldata data) external onlyToken {
    emit TokenEvent(msg.sender, data, block.timestamp);
  }

  // external getters

  /**
   * @notice Computes the deterministic address of a token clone.
   * @dev Uses the provided variant and symbol to calculate a unique address.
   *      The computed address is based on the `Clones` library and uses
   *      the factory's address as the deployment context.
   * @param variant The address of the token variant to clone.
   * @param symbol The symbol of the token to be used as part of the salt.
   * @return The computed deterministic address for the token clone.
   */
  function computeTokenAddress(
    address variant,
    string calldata symbol
  ) external view returns (address) {
    return
      Clones.predictDeterministicAddress(
        variant,
        _computeTokenSalt(symbol),
        address(this)
      );
  }

  // private getters

  /**
   * @notice Computes a unique token salt based on the provided symbol.
   * @dev This function uses the `keccak256` hash of the encoded symbol
   *      to generate a deterministic and unique salt.
   * @param symbol The symbol of the token to generate the salt for.
   * @return A `bytes32` value representing the unique salt for the token.
   */
  function _computeTokenSalt(
    string calldata symbol
  ) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(symbol));
  }

  // private setters

  /**
   * @notice Creates a new token instance using deterministic deployment.
   * @dev This function clones a token `variant` deterministically, encodes initialization data,
   *      and initializes the token. Reverts if the token with the same `symbol` already exists.
   * @param variant The address of the token variant to be cloned.
   * @param name The name of the token to be created.
   * @param symbol The symbol of the token to be created. This is used to compute a unique salt.
   * @param maintainer The address of the maintainer for the newly created token.
   * @param ready A boolean indicating if the token should be marked as ready upon creation.
   * @return token The address of the newly created token.
   */
  function _createToken(
    address variant,
    string calldata name,
    string calldata symbol,
    address maintainer,
    bool ready
  ) private returns (address token) {
    // Compute the salt for the token using its symbol
    bytes32 salt = _computeTokenSalt(symbol);

    // Ensure the token with the same salt does not already exist
    require(_tokensSalts[salt] == address(0), TokenAlreadyCreated());

    // Clone the token deterministically with the computed salt
    token = Clones.cloneDeterministic(variant, _computeTokenSalt(symbol));

    // Encode the initialization data for the token
    bytes memory data = abi.encodeCall(
      IACT.initialize,
      (_getForwarder(), name, symbol, maintainer, ready, _epochsSettings)
    );

    // Call the token's initialize function with the encoded data
    (bool success, bytes memory response) = token.call(data);

    // If the initialization call fails, revert with the error returned
    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        revert(add(response, 32), mload(response))
      }
    }

    // Mark the token as created and map the salt to the token address
    _tokens[token].created = true;
    _tokensSalts[salt] = token;

    // Emit the TokenCreated event with the token details
    emit TokenCreated(token, data, block.timestamp);

    // Return the address of the newly created token
    return token;
  }
}
