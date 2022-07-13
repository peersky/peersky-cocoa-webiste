// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../abstracts/draft-EIP712Diamond.sol";
import {LibTBG} from "../libraries/LibTurnBasedGame.sol";
import {IBestOf} from "../interfaces/IBestOf.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {IERC1155Receiver} from "../interfaces/IERC1155Receiver.sol";
import {IRankToken} from "../interfaces/IRankToken.sol";
import "hardhat/console.sol";

contract BestOfFacet is IBestOf, EIP712, IERC1155Receiver {
    using LibTBG for LibTBG.GameInstance;
    using LibTBG for uint256;
    using LibTBG for LibTBG.GameSettings;

    struct Proposal {
        string proposal;
        bytes proof;
    }

    struct OnTokenRecieved {
        TokenAction req;
        uint256 gameId;
    }

    struct VoteHidden {
        bytes32[3] votedFor;
        bytes proof;
    }

    //     struct VoteRevealed {
    //     bytes32[3] votedFor;
    //     bytes proof;
    // }

    struct BOGInstance {
        uint256 rank;
        address createdBy;
        TokenAction[] joinRequirements;
        mapping(uint256 => mapping(bytes32 => Proposal)) proposals;
        mapping(uint256 => mapping(address => VoteHidden)) votesHidden;
        mapping(uint256 => TokenAction[]) rewards;
        mapping(address => Token[]) lockedTokens;
        uint256 numProposals;
    }

    bytes32 _PROPOSAL_PROOF_TYPEHASH =
        keccak256("signHashedProposal(uint256 gameId,uint256 turn,bytes32 salt,string proposal)");

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
        bytes32 typedHash = _hashTypedDataV4(keccak256(message));
        return SignatureChecker.isValidSignatureNow(account, typedHash, signature);
    }

    bytes32 _VOTE_PROOF_TYPEHASH =
        keccak256("signVote(string vote1,string vote2,string vote3,uint256 gameId,uint256 turn,bytes32 playerSalt)");

    function playerSalt(address player, bytes32 turnSalt) public pure returns (bytes32) {
        return keccak256(abi.encode(player, turnSalt));
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
            _VOTE_PROOF_TYPEHASH,
            vote[0],
            vote[1],
            vote[2],
            gameId,
            gameId._getGame().currentTurn,
            salt
        );
        bytes memory proof = game.votesHidden[gameId.getTurn()][voter].proof;
        require(_isValidSignature(message, proof, gameId.getGM()), "invalid signature");
    }

    //Each hidden vote consists of three votes expressed as Hash(proposal,voterTurnSalt)
    //votesRevealed must contain unhashed proposal
    function validateVotes(
        uint256 gameId,
        address[] memory voters,
        string[3][] memory votes,
        bytes32 turnSalt
    ) private view {
        for (uint256 i = 0; i < gameId.getPlayersNumber(); i++) {
            validateVote(gameId, voters[i], [votes[0][i], votes[1][1], votes[2][i]], turnSalt);
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
            if (compareStrings(votesRevealed[0][i], proposal)) score += 3;
            if (compareStrings(votesRevealed[1][i], proposal)) score += 2;
            if (compareStrings(votesRevealed[2][i], proposal)) score += 1;
            if (
                (bytes(votesRevealed[0][i]).length == 0 &&
                    bytes(votesRevealed[1][i]).length == 0 &&
                    bytes(votesRevealed[2][i]).length == 0) && (voters[i] != proposer)
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
                game.lockedTokens[applicant].push(payload.req.token);
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
    ) public payable {
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
        // game.registrationOpen = false;
        game.createdBy = msg.sender;
        settings.numGames += 1;

        IRankToken rankTokenContract = IRankToken(settings.rankToken.tokenAddress);
        rankTokenContract.mint(address(this), 1, gameRank + 1, "");
        rankTokenContract.mint(address(this), 2, gameRank, "");
        rankTokenContract.mint(address(this), 1, gameRank, "");
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
        // BOGInstance storage game = getGameStorage(gameId);
        gameId.openRegistration();
        emit RegistrationOpen(gameId);
        // game.registrationOpen = true;
    }

    function addJoinRequirements(uint256 gameId, TokenAction memory requirement) public {
        enforceIsGameCreator(gameId);
        BOGInstance storage game = getGameStorage(gameId);
        require(!gameId.isRegistrationOpen(), "Cannot do when registration is open");
        game.joinRequirements.push(requirement);
        emit RequirementAdded(gameId, requirement);
    }

    function popJoinRequirements(uint256 gameId) public {
        enforceIsGameCreator(gameId);
        BOGInstance storage game = getGameStorage(gameId);
        require(!gameId.isRegistrationOpen(), "Cannot do when registration is open");
        require(game.joinRequirements.length > 0, "No requirements exist");
        game.joinRequirements.pop();
    }

    function removeJoinRequirement(uint256 gameId, uint256 index) public {
        enforceIsGameCreator(gameId);
        BOGInstance storage game = getGameStorage(gameId);
        require(!gameId.isRegistrationOpen(), "Cannot do when registration is open");
        delete game.joinRequirements[index];
    }

    function getJoinRequirements(uint256 gameId) public view returns (TokenAction[] memory) {
        BOGInstance storage game = getGameStorage(gameId);
        return game.joinRequirements;
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

        // for (uint256 i = 0; i < game.proposals.length; i++) {
        // require(game.proposals[hiddenProposalToProposalIdx[proposerHidden]].proposerHidden != proposerHidden, "Proposer already submitted");
        // }
        require(proposerHidden != bytes32(0), "proposerHidden cannot be empty");
        require(proof.length != 0, "proof cannot be empty");
        require(bytes(game.proposals[gameId.getTurn()][proposerHidden].proposal).length == 0, "Already proposed!");

        Proposal memory newProposal;
        newProposal.proposal = proposal;
        newProposal.proof = proof;
        game.proposals[gameId.getTurn()][proposerHidden] = newProposal;
        game.numProposals += 1;
        emit ProposalSubmitted(gameId, proposerHidden, proof, proposal);
        // if ((gameId.getTurn() == 1) || game.votesHidden[gameId.getTurn() - 1][msg.sender].proof.length != 0) {
        //     console.log('made move');
        //     gameId.playerMove(msg.sender);
        // }
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
    ) public {
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
            bytes32 playerTurnSalt = keccak256(abi.encodePacked(players[i], turnSalt));
            bytes32 proposerHash = keccak256(abi.encodePacked(players[i], playerTurnSalt));
            if ((turn != 1) && bytes(game.proposals[turn][proposerHash].proposal).length != 0) {
                //if proposal exsists
                bytes memory message = abi.encode(
                    _PROPOSAL_PROOF_TYPEHASH,
                    gameId,
                    turn,
                    playerTurnSalt,
                    keccak256(abi.encodePacked(game.proposals[turn][proposerHash].proposal))
                );
                require(
                    _isValidSignature(message, game.proposals[turn][proposerHash].proof, players[i]),
                    "Signature is wrong"
                );
                validateVotes(gameId, voters, votesRevealed, turnSalt);
                scores[i] =
                    gameId.getScore(players[i]) +
                    getProposalScore(
                        gameId,
                        game.proposals[turn][proposerHash].proposal,
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
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external view override returns (bytes4) {
        enforceIsInitialized();

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
}
