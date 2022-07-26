// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../facets/SignatureCheckerFacet.sol";
import {LibTBG} from "../libraries/LibTurnBasedGame.sol";
import {IBestOf} from "../interfaces/IBestOf.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {IERC1155Receiver} from "../interfaces/IERC1155Receiver.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IRankToken} from "../interfaces/IRankToken.sol";
// import "hardhat/console.sol";
import "../abstracts/DiamondReentrancyGuard.sol";
import {libBestOf} from "../libraries/LibBestOf.sol";

contract BestOfFacet is IBestOf, IERC1155Receiver, DiamondReentrancyGuard, IERC721Receiver {
    using LibTBG for LibTBG.GameInstance;
    using LibTBG for uint256;
    using LibTBG for LibTBG.GameSettings;





    function enforceIsInitialized() internal view {
        BOGSettings storage settings = BOGStorage();
        require(settings.contractInitialized, "onlyInitialized");
    }

    function enforceGameExists(uint256 gameId) internal view {
        enforceIsInitialized();
        require(gameId.gameExists(), "no game found");
    }

    function enforceIsGameCreator(uint256 gameId) internal view {
        enforceGameExists(gameId);
        BOGInstance storage game = getGameStorage(gameId);
        require(game.createdBy == msg.sender, "Only game creator");
    }

    function enforceIsGM(uint256 gameId) internal view {
        enforceGameExists(gameId);
        require(gameId.getGM() == msg.sender, "Only game master");
    }

    function BOGStorage() internal pure returns (BOGSettings storage bog) {
        bytes32 position = LibTBG.getDataStorage();
        assembly {
            bog.slot := position
        }
    }

    function getGameStorage(uint256 gameId) internal view returns (BOGInstance storage game) {
        bytes32 position = LibTBG.getGameDataStorage(gameId);
        assembly {
            game.slot := position
        }
    }

    function _isValidSignature(
        bytes memory message,
        bytes memory signature,
        address account
    ) private view returns (bool) {
        SignatureCheckerFacet checker = SignatureCheckerFacet(address(this));
        return checker.checkSignature(message, signature, account);
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
        BOGInstance storage game = getGameStorage(gameId);
        bytes32 salt = playerSalt(voter, turnSalt);
        require(gameId.isPlayerInGame(voter), "Player not in that game");
        bytes memory message = abi.encode(
            libBestOf._VOTE_PROOF_TYPEHASH,
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
                !compareStrings(
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

    function compareStrings(string memory a, string memory b) public pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function getProposalScore(
        uint256 gameId,
        string memory proposal,
        address[] memory voters,
        string[3][] memory votesRevealed,
        address proposer
    ) private view returns (uint256) {
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
        uint256 gameId,
        TokenAction memory req
    ) private {
        BOGInstance storage game = getGameStorage(gameId);

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
        enforceIsInitialized();
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
        BOGInstance storage game = getGameStorage(gameId);
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
        enforceIsInitialized();
        BOGSettings storage settings = BOGStorage();
        createGame(gameMaster, settings.numGames + 1, gameRank);
    }

    function openRegistration(uint256 gameId) public {
        enforceIsGameCreator(gameId);
        gameId.enforceIsPreRegistrationStage();
        gameId.openRegistration();
        emit RegistrationOpen(gameId);
    }

    function getCreateGameRequirements() public view returns (TokenAction memory) {
        BOGSettings storage settings = BOGStorage();
        return settings.newGameReq;
    }

    function joinGame(uint256 gameId) public payable {
        enforceGameExists(gameId);
        BOGInstance storage game = getGameStorage(gameId);
        fulfillTokenRequirements(msg.sender, gameId, game.joinRequirements);
        gameId.addPlayer(msg.sender);
        emit PlayerJoined(gameId, msg.sender);
    }

    function startGame(uint256 gameId) public {
        enforceGameExists(gameId);
        gameId.startGame(true);
        emit GameStarted(gameId);
    }

    function submitProposal(
        uint256 gameId,
        bytes32 proposerHidden,
        bytes memory proof,
        string memory proposal
    ) public {
        enforceIsGM(gameId);
        BOGInstance storage game = getGameStorage(gameId);
        require(gameId.gameExists(), "Game does not exist");
        gameId.enforceHasStarted();
        require(!gameId.isLastTurn(), "Cannot propose in last turn");
        require(bytes(proposal).length != 0, "Cannot propose empty string");

        require(proposerHidden != bytes32(0), "proposerHidden cannot be empty");
        require(proof.length != 0, "proof cannot be empty");
        require(bytes(game.proposals[gameId.getTurn()][proposerHidden].proposal).length == 0, "Already proposed!");

        Proposal memory newProposal;
        newProposal.proposal = proposal;
        newProposal.proof = proof;
        game.proposals[gameId.getTurn()][proposerHidden] = newProposal;
        game.numProposals += 1;
        emit ProposalSubmitted(gameId, proposerHidden, proof, proposal);
    }

    // function mintRankTokens(address[3] memory winners, uint256 gameRank) private {
    //     BOGSettings storage settings = BOGStorage();
    //     IRankToken rankTokenContract = IRankToken(settings.rankToken.tokenAddress);
    //     rankTokenContract.mint(winners[0], 3, gameRank + 1, "");
    //     rankTokenContract.mint(winners[1], 2, gameRank, "");
    //     rankTokenContract.mint(winners[2], 1, gameRank, "");
    // }

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
        enforceGameExists(gameId);
        gameId.enforceHasStarted();
        BOGInstance storage game = getGameStorage(gameId);
        require(gameId.getTurn() > 1, "No proposals exist at turn 1: cannot vote");

        // for (uint8 i = 0; i < 3; i++) {
        //     require(votesHidden[i] >= game.proposals.length, "index is out of proposal bounds");
        // }
        game.votesHidden[gameId.getTurn()][msg.sender].votedFor = votesHidden;
        game.votesHidden[gameId.getTurn()][msg.sender].proof = proof;
        gameId.playerMove(msg.sender);
    }

    //Proposers order must be same as hidden proposal ordering in game.proposals
    function endTurn(
        uint256 gameId,
        bytes32 turnSalt,
        address[] memory voters,
        string[3][] memory votesRevealed
    ) public nonReentrant {
        enforceGameExists(gameId);
        address[] memory players = gameId.getPlayers();
        uint256 turn = gameId.getTurn();
        uint256[] memory scores = new uint256[](players.length);

        BOGInstance storage game = getGameStorage(gameId);
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
                    libBestOf._PROPOSAL_PROOF_TYPEHASH,
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
                    getProposalScore(
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
        bool isGameOver = gameId.nextTurn();
        game.numProposals = 0;
        game.prevTurnSalt = turnSalt;
        emit TurnEnded(gameId, turn, players, scores, turnSalt);
        if (isGameOver) {
            // rewardWinners(gameId);
            emit GameOver(gameId, scores);
        }
    }

    function onERC1155Received(
        address operator,
        address,
        uint256,
        uint256,
        bytes calldata
    ) public view override returns (bytes4) {
        enforceIsInitialized();
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
        enforceIsInitialized();
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
        enforceIsInitialized();
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
}
