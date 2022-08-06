// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {LibTBG} from "../libraries/LibTurnBasedGame.sol";

interface IBestOf {


    struct Score {
        address participant;
        uint256 score;
    }

    struct BOGSettings {
        uint256 gamePrice;
        uint256 joinGamePrice;
        TokenAction newGameReq;
        uint256 numGames;
        Token rankToken;
        bool contractInitialized;
    }

    struct ContractState {
        BOGSettings BestOfState;
        LibTBG.GameSettings TBGSEttings;
    }


    struct Proposal {
        string proposal;
        bytes proof;
    }

    struct VoteHidden {
        bytes32[3] votedFor;
        bytes proof;
    }

    struct BOGInstance {
        uint256 rank;
        address createdBy;
        TokenAction[] joinRequirements;
        mapping(uint256 => mapping(bytes32 => Proposal)) proposals;
        mapping(uint256 => mapping(address => VoteHidden)) votesHidden;
        mapping(uint256 => TokenAction[]) rewards;
        mapping(uint256 => mapping(address => TokenAction[])) lockedTokens;
        bytes32 prevTurnSalt;
        uint256 numProposals;
    }

    event RegistrationOpen(uint256 indexed gameid);
    event PlayerJoined(uint256 indexed gameId, address participant);
    event GameStarted(uint256 indexed gameId);
    event gameCreated(uint256 gameId, address indexed gm, address indexed creator, uint256 rank);
    event GameClosed(uint256 indexed gameId);
    event PlayerLeft(uint256 indexed gameId, address indexed player);
}
