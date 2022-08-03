// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {LibTBG} from "../libraries/LibTurnBasedGame.sol";
import {IBestOf} from "../interfaces/IBestOf.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

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

    function fulfillTokenRequirement(
        address applicant,
        address to,
        uint256 gameId,
        IBestOf.TokenAction memory req
    ) internal {
        IBestOf.BOGInstance storage game = getGameStorage(gameId);

        if (req.token.tokenType == IBestOf.TokenTypes.NATIVE) {
            if (req.must == IBestOf.TokenMust.GIVE) {
                require(msg.value >= req.amount, "Not enough payment");
            }
        }
        if (req.token.tokenType == IBestOf.TokenTypes.ERC20) {
            IERC20 ERC20Contract = IERC20(req.token.tokenAddress);
            if (req.must == IBestOf.TokenMust.HAVE) {
                uint256 balance = ERC20Contract.balanceOf(applicant);
                require(balance >= req.amount, "ERC20 balance not valid");
            }
            if (req.must == IBestOf.TokenMust.BURN) {
                ERC20Contract.transferFrom(applicant, address(0), req.amount);
            }
            if (req.must == IBestOf.TokenMust.GIVE) {
                ERC20Contract.transferFrom(applicant, to, req.amount);
            }
        }
        if (req.token.tokenType == IBestOf.TokenTypes.ERC1155) {
            IERC1155 ERC1155Contract = IERC1155(req.token.tokenAddress);
            if (req.must == IBestOf.TokenMust.HAVE) {
                uint256 balance = ERC1155Contract.balanceOf(applicant, req.token.tokenId);
                require(balance >= req.amount, "ERC1155 balance not valid");
            }
            if (req.must == IBestOf.TokenMust.BURN) {
                ERC1155Contract.safeTransferFrom(applicant, address(0), req.token.tokenId, req.amount, "");
            }
            if (req.must == IBestOf.TokenMust.LOCK) {
                ERC1155Contract.safeTransferFrom(applicant, to, req.token.tokenId, req.amount, "");
                game.lockedTokens[gameId][applicant].push(req);
            }
        }
        if (req.token.tokenType == IBestOf.TokenTypes.ERC721) {
            ERC721Burnable ERC721Contract = ERC721Burnable(req.token.tokenAddress);
            if (req.must == IBestOf.TokenMust.HAVE) {
                if (req.requireParticularERC721) {
                    address owner = ERC721Contract.ownerOf(req.token.tokenId);
                    require(owner == applicant, "ERC721 not owner of particular token by id");
                } else {
                    uint256 balance = ERC721Contract.balanceOf(applicant);
                    require(balance >= req.amount, "ERC721 balance is not valid");
                }
            }
            if (req.must == IBestOf.TokenMust.BURN) {
                ERC721Contract.burn(req.token.tokenId);
            }
        }
    }

    function fulfillTokenRequirements(
        address applicant,
        address to,
        uint256 gameId,
        IBestOf.TokenAction[] memory reqs
    ) internal {
        for (uint256 i = 0; i < reqs.length; i++) {
            fulfillTokenRequirement(applicant, to, gameId, reqs[i]);
        }
    }

    function fulfillRankRq(
        address applicant,
        address to,
        uint256 gameId,
        uint256 gameRank,
        bool mustTransfer
    ) internal {
        IBestOf.BOGSettings storage settings = BOGStorage();
        if (gameRank > 1) {
            IBestOf.TokenAction memory rankReq;
            rankReq.token = settings.rankToken;
            rankReq.token.tokenId = gameRank;
            rankReq.amount = 1;
            rankReq.must = mustTransfer ? IBestOf.TokenMust.LOCK : IBestOf.TokenMust.HAVE;
            fulfillTokenRequirement(applicant, to, gameId, rankReq);
        }
    }

    function removeAndUnlockPlayer(uint256 gameId, address player) internal {
        gameId.removePlayer(player);
        IBestOf.BOGInstance storage game = getGameStorage(gameId);
        LibBestOf.fulfillRankRq(address(this), player, gameId, game.rank, true);

    }
}
