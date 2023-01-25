// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {LibArray} from "../libraries/LibArray.sol";
import {LibTBG} from "../libraries/LibTurnBasedGame.sol";
import {LibBestOf} from "../libraries/LibBestOf.sol";
import {IBestOf} from "../interfaces/IBestOf.sol";
import "../abstracts/DiamondReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../abstracts/draft-EIP712Diamond.sol";
import {RankToken} from "../tokens/RankToken.sol";
import {LibCoinVending} from "../libraries/LibCoinVending.sol";

contract GameMastersFacet is DiamondReentrancyGuard, EIP712 {
    using LibTBG for uint256;
    using LibBestOf for uint256;
    using LibTBG for LibTBG.GameInstance;

    event OverTime(uint256 indexed gameId);
    event LastTurn(uint256 indexed gameId);

    event TurnEnded(
        uint256 indexed gameId,
        uint256 indexed turn,
        address[] players,
        uint256[] scores,
        bytes32 indexed turnSalt
    );

    event ProposalSubmitted(
        uint256 indexed gameId,
        bytes32 hashedProposer,
        bytes indexed proof,
        string indexed proposal
    );
    event GameOver(uint256 indexed gameId, address[] indexed players, uint256[] indexed scores);

    function checkSignature(
        bytes memory message,
        bytes memory signature,
        address account
    ) public view returns (bool) {
        bytes32 typedHash = _hashTypedDataV4(keccak256(message));
        return SignatureChecker.isValidSignatureNow(account, typedHash, signature);
    }

    function playerSalt(address player, bytes32 turnSalt) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(player, turnSalt));
    }

    function validateVote(
        uint256 gameId,
        address voter,
        string[3] memory vote,
        bytes32 turnSalt
    ) public view {
        IBestOf.BOGInstance storage game = gameId.getGameStorage();
        bytes32 salt = playerSalt(voter, turnSalt);
        require(gameId.isPlayerInGame(voter), "Player not in that game");
        bytes memory message = abi.encode(
            LibBestOf._VOTE_PROOF_TYPEHASH,
            keccak256(abi.encodePacked(vote[0])),
            keccak256(abi.encodePacked(vote[1])),
            keccak256(abi.encodePacked(vote[2])),
            gameId,
            gameId.getTurn(),
            salt
        );
        bytes memory proof = game.votesHidden[gameId.getTurn()][voter].proof;
        require(_isValidSignature(message, proof, gameId.getGM()), "invalid signature");
        //make sure voter did not vote for himself
        bytes32 prevTurnPlayerSalt = keccak256(abi.encodePacked(voter, game.prevTurnSalt));
        for (uint256 i = 0; i < vote.length; i++) {
            require(
                !LibBestOf.compareStrings(
                    game
                    .proposals[gameId.getTurn() - 1][keccak256(abi.encodePacked(voter, prevTurnPlayerSalt))].proposal,
                    vote[i]
                ),
                "voted for himself"
            );
        }
    }

    function validateVotes(
        uint256 gameId,
        address[] memory voters,
        string[3][] memory votes,
        bytes32 turnSalt
    ) private view {
        for (uint256 i = 0; i < gameId.getPlayersNumber(); i++) {
            validateVote(gameId, voters[i], [votes[i][0], votes[i][1], votes[i][2]], turnSalt);
        }
    }

    function submitProposal(
        uint256 gameId,
        bytes32 proposerHidden,
        bytes memory proof,
        string memory proposal
    ) public {
        LibBestOf.enforceIsGM(gameId);
        IBestOf.BOGInstance storage game = gameId.getGameStorage();
        gameId.enforceHasStarted();
        require(!gameId.isGameOver(), "Game over");
        require(!gameId.isLastTurn(), "Cannot propose in last turn");
        require(bytes(proposal).length != 0, "Cannot propose empty string");

        require(proposerHidden != bytes32(0), "proposerHidden cannot be empty");
        require(proof.length != 0, "proof cannot be empty");
        require(bytes(game.proposals[gameId.getTurn()][proposerHidden].proposal).length == 0, "Already proposed!");

        IBestOf.Proposal memory newProposal;
        newProposal.proposal = proposal;
        newProposal.proof = proof;
        game.proposals[gameId.getTurn()][proposerHidden] = newProposal;
        game.numProposals += 1;
        emit ProposalSubmitted(gameId, proposerHidden, proof, proposal);
    }

    function _isValidSignature(
        bytes memory message,
        bytes memory signature,
        address account
    ) private view returns (bool) {
        return checkSignature(message, signature, account);
    }

    function _endGame(
        uint256 gameId,
        address[] memory leaderboard,
        uint256[] memory scores,
        address[] memory players
    ) internal nonReentrant {
        IBestOf.BOGInstance storage game = gameId.getGameStorage();
        gameId.closeGame();
        emitRankRewards(gameId, leaderboard);

        for (uint256 i = 0; i < players.length; i++) {
            LibCoinVending.release(bytes32(gameId), game.createdBy, leaderboard[0], players[i]);
            LibBestOf.fulfillRankRq(address(this), players[i], game.rank, true);
        }
        emit GameOver(gameId, players, scores);
    }

    //Proposers order must be same as hidden proposal ordering in game.proposals
    function endTurn(
        uint256 gameId,
        bytes32 turnSalt,
        address[] memory voters,
        string[3][] memory votesRevealed
    ) public {
        LibBestOf.enforceIsGM(gameId);
        address[] memory players = gameId.getPlayers();
        uint256 turn = gameId.getTurn();
        uint256[] memory scores = new uint256[](players.length);

        IBestOf.BOGInstance storage game = gameId.getGameStorage();
        require(!gameId.isGameOver(), "Game over");
        gameId.enforceHasStarted();
        if (turn != 1) {
            require(gameId.canEndTurn() == true, "Cannot do this now");
        }
        if (!gameId.isLastTurn()) {
            require(
                (game.numProposals == gameId.getPlayers().length) || gameId.isTurnTimedOut(),
                "Some players still have time to propose"
            );
        }

        for (uint256 i = 0; i < players.length; i++) {
            require(gameId.isPlayerInGame(players[i]), "Proposer is not in the game");
            bytes32 playerPrevTurnSalt = keccak256(abi.encodePacked(players[i], game.prevTurnSalt));
            bytes32 prevTurnProposerHash = keccak256(abi.encodePacked(players[i], playerPrevTurnSalt));

            if ((turn != 1) && bytes(game.proposals[turn - 1][prevTurnProposerHash].proposal).length != 0) {
                //if proposal exsists
                bytes memory message = abi.encode(
                    LibBestOf._PROPOSAL_PROOF_TYPEHASH,
                    gameId,
                    turn - 1,
                    playerPrevTurnSalt,
                    keccak256(abi.encodePacked(game.proposals[turn - 1][prevTurnProposerHash].proposal))
                );
                require(
                    _isValidSignature(message, game.proposals[turn - 1][prevTurnProposerHash].proof, players[i]),
                    "Signature is wrong"
                );
                validateVotes(gameId, voters, votesRevealed, turnSalt);
                scores[i] =
                    gameId.getScore(players[i]) +
                    LibBestOf.getProposalScore(
                        gameId,
                        game.proposals[turn - 1][prevTurnProposerHash].proposal,
                        voters,
                        votesRevealed,
                        players[i]
                    );
                gameId.setScore(players[i], scores[i]);
            } else {
                //Player did not propose anything - his score stays same;
                //Unless there is still time to submit proposals
            }
        }
        (bool _isLastTurn, bool _isOvertime, bool _isGameOver, address[] memory leaderboard) = gameId.nextTurn();
        game.numProposals = 0;
        game.prevTurnSalt = turnSalt;
        emit TurnEnded(gameId, turn, players, scores, turnSalt);
        if (_isLastTurn && _isOvertime) {
            emit OverTime(gameId);
        }
        if (_isLastTurn) {
            emit LastTurn(gameId);
        }
        if (_isGameOver) {
            _endGame(gameId, leaderboard, scores, players);
        }
    }

    function emitRankRewards(uint256 gameId, address[] memory leaderboard) private {
        IBestOf.BOGInstance storage game = gameId.getGameStorage();
        IBestOf.BOGSettings storage settings = LibBestOf.BOGStorage();
        RankToken rankTokenContract = RankToken(settings.rankTokenAddress);
        rankTokenContract.safeTransferFrom(address(this), leaderboard[0], game.rank + 1, 1, "");
        rankTokenContract.safeTransferFrom(address(this), leaderboard[1], game.rank, 2, "");
        rankTokenContract.safeTransferFrom(address(this), leaderboard[2], game.rank, 1, "");
    }
}
