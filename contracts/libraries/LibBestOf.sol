// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {LibTBG} from "../libraries/LibTurnBasedGame.sol";
import {IBestOf} from "../interfaces/IBestOf.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

import "hardhat/console.sol";

library LibBestOf {
    using LibTBG for LibTBG.GameInstance;
    using LibTBG for uint256;
    using LibTBG for LibTBG.GameSettings;

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function getGameStorage(uint256 gameId) internal view returns (IBestOf.BOGInstance storage game) {
        bytes32 position = LibTBG.getGameDataStorage(gameId);
        assembly {
            game.slot := position
        }
    }

    function BOGStorage() internal pure returns (IBestOf.BOGSettings storage bog) {
        bytes32 position = LibTBG.getDataStorage();
        assembly {
            bog.slot := position
        }
    }

    bytes32 internal constant _PROPOSAL_PROOF_TYPEHASH =
        keccak256("signHashedProposal(uint256 gameId,uint256 turn,bytes32 salt,string proposal)");
    bytes32 internal constant _VOTE_PROOF_TYPEHASH =
        keccak256("signVote(string vote1,string vote2,string vote3,uint256 gameId,uint256 turn,bytes32 salt)");

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

    function getProposalScore(
        uint256 gameId,
        string memory proposal,
        address[] memory voters,
        string[3][] memory votesRevealed,
        address proposer
    ) internal view returns (uint256) {
        address[] memory players = gameId.getPlayers();
        assert(voters.length <= players.length);
        uint256 score = 0;
        for (uint256 i = 0; i < voters.length; i++) {
            if (compareStrings(votesRevealed[i][0], proposal)) score += 3;
            if (compareStrings(votesRevealed[i][1], proposal)) score += 2;
            if (compareStrings(votesRevealed[i][2], proposal)) score += 1;
            if (
                (bytes(votesRevealed[i][0]).length == 0 &&
                    bytes(votesRevealed[i][1]).length == 0 &&
                    bytes(votesRevealed[i][2]).length == 0) && (voters[i] != proposer)
            ) score += 3;
        }
        return score;
    }

    function fulfillRankRq(
        address applicant,
        address to,
        uint256 gameRank,
        bool mustLock
    ) internal {
        IBestOf.BOGSettings storage settings = BOGStorage();
        if (gameRank > 1) {
            IERC1155 rankToken = IERC1155(settings.rankTokenAddress);
            if (mustLock) {
                rankToken.safeTransferFrom(applicant, to, gameRank, 1, "0x");
            } else {
                require(rankToken.balanceOf(applicant, gameRank) > 0, "Has no rank for this action");
            }
        }
    }

    function removeAndUnlockPlayer(uint256 gameId, address player) internal {
        gameId.removePlayer(player);
        IBestOf.BOGInstance storage game = getGameStorage(gameId);
        LibBestOf.fulfillRankRq(address(this), player, game.rank, true);
    }
}
