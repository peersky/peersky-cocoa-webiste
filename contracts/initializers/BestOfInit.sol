// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
*
* Implementation of a diamond.
/******************************************************************************/

import {LibDiamond} from "../vendor/libraries/LibDiamond.sol";
import {IDiamondLoupe} from "../vendor/interfaces/IDiamondLoupe.sol";
import {IDiamondCut} from "../vendor/interfaces/IDiamondCut.sol";
import {IERC173} from "../vendor/interfaces/IERC173.sol";
import {IERC165} from "../vendor/interfaces/IERC165.sol";
import {LibEIP712WithStorage} from "../libraries/LibEIP712Storage.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { IBestOf} from "../interfaces/IBestOf.sol";
import {LibTBG} from "../libraries/LibTurnBasedGame.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "hardhat/console.sol";

// It is expected that this contract is customized if you want to deploy your diamond
// with data from a deployment script. Use the init function to initialize state variables
// of your diamond. Add parameters to the init funciton if you need to.

contract BestOfInit {

      function _buildDomainSeparator(
        bytes32 typeHash,
        bytes32 nameHash,
        bytes32 versionHash
    ) private view returns (bytes32) {
        return keccak256(abi.encode(typeHash, nameHash, versionHash, block.chainid, address(this)));
    }

      function BOGStorage() internal pure returns (IBestOf.BOGSettings storage bog) {
        bytes32 position = LibTBG.getImplemenationDataStorage();
        assembly {
            bog.slot := position
        }
    }

struct contractInitializer {
        uint256 blocksPerTurn;
        uint256 turnsPerRound;
        uint256 maxPlayersSize;
        uint256 minPlayersSize;
        address rankTokenAddress;
        bool canJoinGameWhenStarted;
        uint256 maxRounds;
        uint256 blocksToJoin;
        uint256 gamePrice;
        uint256 joinGamePrice;
        LibTBG.CanJoin joinPolicy;
        // bool canJoinGameWhenStarted
        // bool canPayToJoin;
    }

    // You can add parameters to this function in order to pass in
    // data to set your own state variables
    function init(string memory name, string memory version, contractInitializer memory initializer) external {
        // adding ERC165 data
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        ds.supportedInterfaces[type(IERC165).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
        ds.supportedInterfaces[type(IERC173).interfaceId] = true;
        bytes32 hashedName = keccak256(bytes(name));
        bytes32 hashedVersion = keccak256(bytes(version));
        bytes32 typeHash = keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );
        LibEIP712WithStorage.LibEIP712WithStorageStorage storage ss = LibEIP712WithStorage.EIP712WithStorage();
        ss._HASHED_NAME = hashedName;
        ss._HASHED_VERSION = hashedVersion;
        ss._CACHED_CHAIN_ID = block.chainid;
        ss._CACHED_DOMAIN_SEPARATOR = _buildDomainSeparator(typeHash, hashedName, hashedVersion);
        ss._CACHED_THIS = address(this);
        ss._TYPE_HASH = typeHash;



        IBestOf.BOGSettings storage _BOG = BOGStorage();
        _BOG.gamePrice = initializer.gamePrice;
        _BOG.joinGamePrice = initializer.joinGamePrice;
        IERC1155 ERC1155Contract = IERC1155(initializer.rankTokenAddress);
        require(
            ERC1155Contract.supportsInterface(type(IERC1155).interfaceId),
            "BestOfGame->init: rank token address does not support IERC1155 interface"
        );
        _BOG.rankToken.tokenAddress = initializer.rankTokenAddress;
        _BOG.rankToken.tokenType = IBestOf.TokenTypes.ERC1155;
        _BOG.rankToken.tokenId = 0;
        _BOG.contractInitialized = true;

        LibTBG.GameSettings memory settings;
        settings.blocksPerTurn = initializer.blocksPerTurn;
        settings.turnsPerRound = initializer.turnsPerRound;
        settings.maxPlayersSize = initializer.maxPlayersSize;
        settings.minPlayersSize = initializer.minPlayersSize;
        settings.joinPolicy = initializer.joinPolicy;
        // settings.canJoinGameWhenStarted = initializer.canJoinGameWhenStarted;
        settings.maxRounds = initializer.maxRounds;
        settings.blocksToJoin = initializer.blocksToJoin;

        LibTBG.init(settings);


        // add your own state variables
        // EIP-2535 specifies that the `diamondCut` function takes two optional
        // arguments: address _init and bytes calldata _calldata
        // These arguments are used to execute an arbitrary function using delegatecall
        // in order to set state variables in the diamond during deployment or an upgrade
        // More info here: https://eips.ethereum.org/EIPS/eip-2535#diamond-interface
    }
}
