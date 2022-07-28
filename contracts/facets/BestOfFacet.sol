// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {LibTBG} from "../libraries/LibTurnBasedGame.sol";
import {IBestOf} from "../interfaces/IBestOf.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {IERC1155Receiver} from "../interfaces/IERC1155Receiver.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IRankToken} from "../interfaces/IRankToken.sol";
import "../abstracts/DiamondReentrancyGuard.sol";
import {LibBestOf} from "../libraries/LibBestOf.sol";

contract BestOfFacet is IBestOf, IERC1155Receiver, DiamondReentrancyGuard, IERC721Receiver {
    using LibTBG for LibTBG.GameInstance;
    using LibTBG for uint256;
    using LibTBG for LibTBG.GameSettings;
    using LibBestOf for uint256;

    function BOGStorage() internal pure returns (BOGSettings storage bog) {
        bytes32 position = LibTBG.getDataStorage();
        assembly {
            bog.slot := position
        }
    }

    function fulfillTokenRequirement(
        address applicant,
        uint256 gameId,
        TokenAction memory req
    ) private {
        BOGInstance storage game = gameId.getGameStorage();

        if (req.token.tokenType == TokenTypes.NATIVE) {
            if (req.must == TokenMust.GIVE) {
                require(msg.value >= req.amount, "Not enough payment");
            }
        }
        if (req.token.tokenType == TokenTypes.ERC20) {
            IERC20 ERC20Contract = IERC20(req.token.tokenAddress);
            if (req.must == TokenMust.HAVE) {
                uint256 balance = ERC20Contract.balanceOf(applicant);
                require(balance >= req.amount, "ERC20 balance not valid");
            }
            if (req.must == TokenMust.BURN) {
                ERC20Contract.transferFrom(applicant, address(0), req.amount);
            }
            if (req.must == TokenMust.GIVE) {
                ERC20Contract.transferFrom(applicant, address(this), req.amount);
            }
        }
        if (req.token.tokenType == TokenTypes.ERC1155) {
            IERC1155 ERC1155Contract = IERC1155(req.token.tokenAddress);
            if (req.must == TokenMust.HAVE) {
                uint256 balance = ERC1155Contract.balanceOf(applicant, req.token.tokenId);
                require(balance >= req.amount, "ERC1155 balance not valid");
            }
            if (req.must == TokenMust.BURN) {
                ERC1155Contract.safeTransferFrom(applicant, address(0), req.token.tokenId, req.amount, "");
            }
            if (req.must == TokenMust.LOCK) {
                OnTokenRecieved memory payload;
                payload.req = req;
                payload.gameId = gameId;
                ERC1155Contract.safeTransferFrom(applicant, address(this), req.token.tokenId, req.amount, "");
                game.lockedTokens[gameId][applicant].push(payload.req.token);
            }
        }
        if (req.token.tokenType == TokenTypes.ERC721) {
            ERC721Burnable ERC721Contract = ERC721Burnable(req.token.tokenAddress);
            if (req.must == TokenMust.HAVE) {
                if (req.requireParticularERC721) {
                    address owner = ERC721Contract.ownerOf(req.token.tokenId);
                    require(owner == applicant, "ERC721 not owner of particular token by id");
                } else {
                    uint256 balance = ERC721Contract.balanceOf(applicant);
                    require(balance >= req.amount, "ERC721 balance is not valid");
                }
            }
            if (req.must == TokenMust.BURN) {
                ERC721Contract.burn(req.token.tokenId);
            }
        }
    }

    function fulfillTokenRequirements(
        address applicant,
        uint256 gameId,
        TokenAction[] memory reqs
    ) private {
        for (uint256 i = 0; i < reqs.length; i++) {
            fulfillTokenRequirement(applicant, gameId, reqs[i]);
        }
    }

    function createGame(
        address gameMaster,
        uint256 gameId,
        uint256 gameRank
    ) public payable nonReentrant {
        LibBestOf.enforceIsInitialized();
        BOGSettings storage settings = BOGStorage();
        gameId.createGame(gameMaster);
        fulfillTokenRequirement(msg.sender, gameId, settings.newGameReq);
        require(gameRank != 0, "game rank not specified");
        if (gameRank > 1) {
            TokenAction memory rankReq;
            rankReq.token = settings.rankToken;
            rankReq.token.tokenId = gameRank;
            rankReq.amount = 1;
            fulfillTokenRequirement(msg.sender, gameId, rankReq);
        }
        require(msg.value >= settings.gamePrice, "Not enough payment");
        BOGInstance storage game = gameId.getGameStorage();
        game.createdBy = msg.sender;
        settings.numGames += 1;

        uint256[] memory ranks = new uint256[](2);
        ranks[0] = gameRank;
        ranks[1] = gameRank + 1;
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 3;
        amounts[1] = 1;
        IRankToken rankTokenContract = IRankToken(settings.rankToken.tokenAddress);

        rankTokenContract.batchMint(address(this), ranks, amounts, "");
        TokenAction memory reward;
        reward.token.tokenAddress = settings.rankToken.tokenAddress;
        reward.token.tokenType = TokenTypes.ERC1155;
        reward.amount = 3;
        reward.token.tokenId = gameRank + 1;
        game.rewards[0].push(reward);

        reward.amount = 2;
        reward.token.tokenId = gameRank;
        game.rewards[1].push(reward);

        reward.amount = 1;
        game.rewards[2].push(reward);
        emit gameCreated(gameMaster, gameId, gameRank);
    }

    function createGame(address gameMaster, uint256 gameRank) public payable {
        LibBestOf.enforceIsInitialized();
        BOGSettings storage settings = BOGStorage();
        createGame(gameMaster, settings.numGames + 1, gameRank);
    }

    function cancelGame(uint256 gameId) public {
        gameId.enforceGameExists();
        LibBestOf.enforceIsGameCreator(gameId);
        require(!gameId.hasStarted(), "Game already has started");
        gameId.closeGame();
        emit GameClosed(gameId);
    }

    function leaveGame(uint256 gameId) public {
        gameId.removePlayer(msg.sender);
        emit PlayerLeft(gameId, msg.sender);
    }

    function openRegistration(uint256 gameId) public {
        LibBestOf.enforceIsGameCreator(gameId);
        gameId.enforceIsPreRegistrationStage();
        gameId.openRegistration();
        emit RegistrationOpen(gameId);
    }

    function getCreateGameRequirements() public view returns (TokenAction memory) {
        BOGSettings storage settings = BOGStorage();
        return settings.newGameReq;
    }

    function joinGame(uint256 gameId) public payable {
        gameId.enforceGameExists();
        BOGInstance storage game = gameId.getGameStorage();
        fulfillTokenRequirements(msg.sender, gameId, game.joinRequirements);
        gameId.addPlayer(msg.sender);
        emit PlayerJoined(gameId, msg.sender);
    }

    function startGame(uint256 gameId) public {
        gameId.enforceGameExists();
        gameId.startGame();
        emit GameStarted(gameId);
    }

    //
    /* Proof is GM signed message formulated as:
    keccak256(
        abi.encode(voteHidden[1], voteHidden[2], voteHidden[3],playerTurnSalt)
    )

    where playerTurnSalt is :
    keccak256(abi.encode(msg.sender,turnSalt))

    Where turnSalt is:
    turnSalt = keccak256(abi.encode(gameId,turn,seed))

    Where seed is secret of game master which it never reveals.

    and voteHidden[i] = keccak256(abi.encode(proposerHidden,playerTurnSalt))

    where proposerHidden is

    proposerHidden = keccak256(abi.encode(playerAddress, turnSalt))

    Therefore secret voting can be revealed by making turnSalt publiclly availible.

    Having that, one can decode all hidden messages in local enviroment.


    it is game master responsibility to check and sign only such message where
    voteHidden1-3 are valid and can be decoded as

*/
    function submitVote(
        uint256 gameId,
        bytes32[3] memory votesHidden,
        bytes memory proof
    ) public {
        // enforceIsGM(gameId);
        gameId.enforceGameExists();
        gameId.enforceHasStarted();
        BOGInstance storage game = gameId.getGameStorage();
        require(!gameId.isGameOver(), "Game over");
        require(gameId.getTurn() > 1, "No proposals exist at turn 1: cannot vote");

        // for (uint8 i = 0; i < 3; i++) {
        //     require(votesHidden[i] >= game.proposals.length, "index is out of proposal bounds");
        // }
        game.votesHidden[gameId.getTurn()][msg.sender].votedFor = votesHidden;
        game.votesHidden[gameId.getTurn()][msg.sender].proof = proof;
        gameId.playerMove(msg.sender);
    }

    function onERC1155Received(
        address operator,
        address,
        uint256,
        uint256,
        bytes calldata
    ) public view override returns (bytes4) {
        LibBestOf.enforceIsInitialized();
        if (operator == address(this)) {
            return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
        }
        return bytes4("");
    }

    function onERC1155BatchReceived(
        address operator,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external view override returns (bytes4) {
        LibBestOf.enforceIsInitialized();
        if (operator == address(this)) {
            return bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"));
        }
        return bytes4("");
    }

    function onERC721Received(
        address operator,
        address,
        uint256,
        bytes calldata
    ) external view override returns (bytes4) {
        LibBestOf.enforceIsInitialized();
        if (operator == address(this)) {
            return IERC721Receiver.onERC721Received.selector;
        }
        return bytes4("");
    }

    function getContractState() public view returns (ContractState memory) {
        BOGSettings storage settings = BOGStorage();
        LibTBG.GameSettings memory tbgSettings = LibTBG.getGameSettings();
        return (ContractState({BestOfState: settings, TBGSEttings: tbgSettings}));
    }

    function getTurn(uint256 gameId) public view returns (uint256) {
        return gameId.getTurn();
    }

    function getGM(uint256 gameId) public view returns (address) {
        return gameId.getGM();
    }

    function getScores(uint256 gameId) public view returns (address[] memory, uint256[] memory) {
        return gameId.getScores();
    }

    function isOvertime(uint256 gameId) public view returns (bool) {
        return gameId.isOvertime();
    }

    function isGameOver(uint256 gameId) public view returns (bool) {
        return gameId.isGameOver();
    }
}
