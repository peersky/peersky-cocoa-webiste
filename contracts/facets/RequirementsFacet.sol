// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../interfaces/IBestOf.sol";
// import {IRequirementsFacet} from "../interfaces/IRequirementsFacet.sol";
import {LibTBG} from "../libraries/LibTurnBasedGame.sol";

contract RequirementsFacet {
    event RequirementAdded(uint256 indexed gameId, IBestOf.TokenAction indexed requirement);
    using LibTBG for LibTBG.GameInstance;
    using LibTBG for uint256;
    using LibTBG for LibTBG.GameSettings;

    function BOGStorage() internal pure returns (IBestOf.BOGSettings storage bog) {
        bytes32 position = LibTBG.getDataStorage();
        assembly {
            bog.slot := position
        }
    }

    function enforceIsInitialized() internal view {
        IBestOf.BOGSettings storage settings = BOGStorage();
        require(settings.contractInitialized, "onlyInitialized");
    }

    function enforceGameExists(uint256 gameId) internal view {
        enforceIsInitialized();
        require(gameId.gameExists(), "no game found");
    }

    function enforceIsGameCreator(uint256 gameId) internal view {
        enforceGameExists(gameId);
        IBestOf.BOGInstance storage game = getGameStorage(gameId);
        require(game.createdBy == msg.sender, "Only game creator");
    }

    function enforceIsGM(uint256 gameId) internal view {
        enforceGameExists(gameId);
        require(gameId.getGM() == msg.sender, "Only game master");
    }

    function getGameStorage(uint256 gameId) internal view returns (IBestOf.BOGInstance storage game) {
        bytes32 position = LibTBG.getGameDataStorage(gameId);
        assembly {
            game.slot := position
        }
    }

    function addJoinRequirements(uint256 gameId, IBestOf.TokenAction memory requirement) public {
        enforceIsGameCreator(gameId);
        gameId.enforceIsPreRegistrationStage();
        IBestOf.BOGInstance storage game = getGameStorage(gameId);
        game.joinRequirements.push(requirement);
        emit RequirementAdded(gameId, requirement);
    }

    function popJoinRequirements(uint256 gameId) public {
        enforceIsGameCreator(gameId);
        IBestOf.BOGInstance storage game = getGameStorage(gameId);
        gameId.enforceIsPreRegistrationStage();
        require(game.joinRequirements.length > 0, "No requirements exist");
        game.joinRequirements.pop();
    }

    function removeJoinRequirement(uint256 gameId, uint256 index) public {
        enforceIsGameCreator(gameId);
        IBestOf.BOGInstance storage game = getGameStorage(gameId);
        gameId.enforceIsPreRegistrationStage();
        delete game.joinRequirements[index];
    }

    function getJoinRequirements(uint256 gameId) public view returns (IBestOf.TokenAction[] memory) {
        IBestOf.BOGInstance storage game = getGameStorage(gameId);
        return game.joinRequirements;
    }
}
