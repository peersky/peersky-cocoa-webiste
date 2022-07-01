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


    struct Score {
        address participant;
        uint256 score;
    }

        struct BOGSettings {
        uint256 gamePrice;
        uint256 joinGamePrice;
        TokenRequirement newGameReq;
        Token rankToken;
        bool contractInitialized;
    }

    event ProposersRevealed(uint256 indexed gameId, address[] proposers, uint256 salt, Score[] scores);
    event RoundFinished(uint256 indexed gameId, uint256 indexed round, Score[] scores);
}
