// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {LibTBG} from "../libraries/LibTurnBasedGame.sol";
interface IBestOf {
    enum TokenTypes {
        NATIVE,
        ERC20,
        ERC1155,
        ERC721
    }

    enum TokenMust {
        HAVE,
        LOCK,
        BURN,
        MINT,
        BET,
        GIVE
    }

    struct Token {
        TokenTypes tokenType;
        address tokenAddress;
        uint256 tokenId;
    }

    struct TokenRequirement {
        Token token;
        uint256 amount;
        bool requireParticularERC721;
        TokenMust must;
    }

    struct newGameInitializer {
        string gameName;
        uint256 blocksPerTurn;
        uint256 turnsPerRound;
        uint256 maxPlayersSize;
        uint256 minPlayersSize;
        Token rankToken;
        bool canJoinGameWhenStarted;
        uint256 maxRounds;
        uint256 blocksToJoin;
        uint256 gamePrice;
        uint256 joinGamePrice;
        LibTBG.CanJoin joinPolicy;
        // bool canJoinGameWhenStarted
        // bool canPayToJoin;
    }
    struct Score {
        address participant;
        uint256 score;
    }
    event ProposersRevealed(uint256 indexed gameId, address[] proposers, uint256 salt, Score[] scores);
    event RoundFinished(uint256 indexed gameId, uint256 indexed round, Score[] scores);
}
