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
        bytes32 proposerHidden;
        address proposerRevealed;
        bytes proof;
    }

    struct OnTokenRecieved {
        TokenRequirement req;
        uint256 gameId;
    }

    struct Vote {
        uint256[3] votedFor;
        bytes proof;
    }

    struct BOGInstance {
        uint256 rank;
        address createdBy;
        TokenRequirement[] joinRequirements;
        bool registrationOpen;
        Proposal[] proposals;
        mapping(address => uint256) score;
        mapping(bytes32 => Vote) votes;
        mapping(address => Token[]) lockedTokens;
        mapping(uint256 => bytes) proposalIndicies;
        mapping(uint256 => mapping(address => uint256)) roundScores;
    }

    modifier onlyExistingGame(uint256 gameId) {
        require(gameId.gameExists(), "BestOf->onlyExistingGame: Game does not exist");
        _;
    }
    modifier onlyGameCreator(uint256 gameId) {
        BOGInstance storage game = getGameStorage(gameId);
        require(game.createdBy == msg.sender, "Only game creator can do that action");
        _;
    }

    modifier onlyInitialized() {
        BOGSettings storage settings = BOGStorage();
        require(settings.contractInitialized, "BestOfGame: onlyInitialized: contract is not initialized yet");
        _;
    }

    modifier onlyGameMaster(uint256 gameId) {
        BOGInstance storage game = getGameStorage(gameId);
        require(gameId.getGM() == msg.sender, "Only game master account can do that!");
        _;
    }

    function BOGStorage() internal pure returns (BOGSettings storage bog) {
        bytes32 position = LibTBG.getImplemenationDataStorage();
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

    // function BOGStorage() internal pure returns (BOGStruct storage es) {
    //     bytes32 position = BESTOFGAME_STORAGE_POSITION;
    //     assembly {
    //         es.slot := position
    //     }
    // }

    function _isValidSignature(
        bytes memory message,
        bytes memory signature,
        address account
    ) private view returns (bool) {
        bytes32 typedHash = _hashTypedDataV4(keccak256(message));
        return SignatureChecker.isValidSignatureNow(account, typedHash, signature);
    }

    // function isValidSignature(
    //     bytes32 signature,
    //     bytes32 message,
    //     address signer
    // ) public view returns (bool) {

    //     return false;
    // }

    bytes32 _VOTE_PROOF_TYPEHASH = keccak256("signHashedVote(bytes32 voteHash)");

    function calculateAndVerifyScore(
        uint256 gameId,
        bytes32 hiddenParticipant,
        address participant,
        uint256 salt
    ) private view returns (uint256) {
        BOGInstance storage game = getGameStorage(gameId);
        uint256 participantIdx = game.proposals.length + 1;

        for (uint256 i = 0; i < game.proposals.length; i++) {
            if (game.proposals[i].proposerHidden == hiddenParticipant) {
                participantIdx = i;
                break;
            }
        }
        require(participantIdx != game.proposals.length + 1, "participant not found");

        address[] memory players = gameId.getPlayers();
        uint256 score = 0;
        for (uint256 i = 0; i < players.length; i++) {
            bytes32 voter = game.proposals[i].proposerHidden;
            uint256[3] memory voterIndicies = game.votes[voter].votedFor;
            if ((voterIndicies[0] == 0) || (voterIndicies[1] == 0) || (voterIndicies[2] == 0)) {
                //Vote is not correct / voter did not vote => gives 3 points to everyone
                score += 3;
            } else {
                bytes memory encodedMessageSource;
                {
                    encodedMessageSource = abi.encode(gameId, salt);
                }

                {
                    encodedMessageSource = abi.encode(
                        encodedMessageSource,
                        gameId._getGame().currentRound,
                        gameId._getGame().currentTurn
                    );
                }
                {
                    encodedMessageSource = abi.encode(
                        encodedMessageSource,
                        game.votes[voter].votedFor[0],
                        game.votes[voter].votedFor[1],
                        game.votes[voter].votedFor[2]
                    );
                }

                {
                    bytes memory message = abi.encode(
                        _VOTE_PROOF_TYPEHASH,
                        keccak256(abi.encode(encodedMessageSource))
                    );

                    if (!_isValidSignature(message, game.votes[voter].proof, participant)) {
                        console.log("ERROR: vote was not signed by the participant");
                        return score;
                    }
                }

                if (game.votes[voter].votedFor[0] == participantIdx) score += 3;
                if (game.votes[voter].votedFor[1] == participantIdx) score += 2;
                if (game.votes[voter].votedFor[2] == participantIdx) score += 1;
            }
        }
        return score;
    }

    bytes32 _PROPOSAL_PROOF_TYPEHASH = keccak256("signHashedProposal(bytes32 hash)");

    // function hasRequiredToken(address subject, Token memory token) public view returns (bool) {
    //     if (token.tokenType == TokenTypes.ERC20) {
    //         IERC20 ERC20Contract = IERC20(token.tokenAddress);
    //         uint256 balance = ERC20Contract.balanceOf(subject);
    //         if (balance >= token.tokenAmount) return true;
    //     }
    //     if (token.tokenType == TokenTypes.ERC1155) {
    //         IERC1155 ERC1155Contract = IERC1155(token.tokenAddress);
    //         uint256 balance = ERC1155Contract.balanceOf(subject, token.tokenId);
    //         if (balance >= token.tokenAmount) return true;
    //     }
    //     if (token.tokenType == TokenTypes.ERC20) {
    //         IERC721 ERC721Contract = IERC721(token.tokenAddress);
    //         if (token.isParticularERC721Id) {
    //             address owner = ERC721Contract.ownerOf(token.tokenId);
    //             if (subject == owner) return true;
    //         } else {
    //             uint256 balance = ERC721Contract.balanceOf(subject);
    //             if (balance >= token.tokenAmount) return true;
    //         }
    //     }
    //     return false;
    // }

    // function isWhitelisted(address subject, Token[] memory whitelistTokens) public view returns (bool) {
    //     for (uint256 i = 0; i < whitelistTokens.length; i++) {
    //         if (hasRequiredToken(subject, whitelistTokens[i]) == true) return true;
    //     }
    //     return false;
    // }

    function fulfillTokenRequirement(
        address applicant,
        uint256 gameId,
        TokenRequirement memory req
    ) private {
        BOGInstance storage game = getGameStorage(gameId);

        if (req.token.tokenType == TokenTypes.NATIVE) {
            if (req.must == TokenMust.GIVE) {
                require(msg.value >= req.amount, "fulfillTokenRequirement: Not enough payment");
            }
        }
        if (req.token.tokenType == TokenTypes.ERC20) {
            IERC20 ERC20Contract = IERC20(req.token.tokenAddress);
            if (req.must == TokenMust.HAVE) {
                uint256 balance = ERC20Contract.balanceOf(applicant);
                require(balance >= req.amount, "fulfillTokenRequirement: ERC20 balance not valid");
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
                require(balance >= req.amount, "fulfillTokenRequirement: ERC1155 balance not valid");
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
                    require(owner == applicant, "fulfillTokenRequirement: ERC721 not owner of particular token by id");
                } else {
                    uint256 balance = ERC721Contract.balanceOf(applicant);
                    require(balance >= req.amount, "fulfillTokenRequirement: ERC721 balance is not valid");
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
        TokenRequirement[] memory reqs
    ) private {
        for (uint256 i = 0; i < reqs.length; i++) {
            fulfillTokenRequirement(applicant, gameId, reqs[i]);
        }
    }

    function createGame(
        address gameMaster,
        uint256 gameId,
        uint256 gameRank
    ) public payable onlyInitialized {
        BOGSettings storage settings = BOGStorage();
        // if (!isWhitelisted(msg.sender, settings.newGameWhitelistTokens)) {
        //     require(msg.value > settings.gamePrice, "BestOfFacet->createGame: not enough payment");
        // }
        gameId.createGame(gameMaster);
        fulfillTokenRequirement(msg.sender, gameId, settings.newGameReq);

        if (gameRank > 0) {
            TokenRequirement memory rankReq;
            rankReq.token = settings.rankToken;
            rankReq.token.tokenId = gameRank;
            rankReq.amount = 1;
            fulfillTokenRequirement(msg.sender, gameId, rankReq);
        }
        require(msg.value >= settings.gamePrice, "BOG->CreateGame: Not enough payment");
        BOGInstance storage game = getGameStorage(gameId);
        game.registrationOpen = false;
        game.createdBy = msg.sender;
        settings.numGames += 1;
        emit gameCreated(gameMaster, gameId, gameRank);
    }

    function createGame(address gameMaster, uint256 gameRank) public payable onlyInitialized {
        BOGSettings storage settings = BOGStorage();
        createGame(gameMaster, settings.numGames + 1, gameRank);
    }

    function openRegistration(uint256 gameId) public onlyInitialized onlyExistingGame(gameId) onlyGameCreator(gameId) {
        // BOGInstance storage game = getGameStorage(gameId);
        gameId.openRegistration();
        // game.registrationOpen = true;
    }

    //     function _addJoinRequirements(uint256 gameId, Token memory token) private {
    //     BOGInstance storage game = getGameStorage(gameId);
    //     game.inviteTokens.push(token);
    // }

    function addJoinRequirements(uint256 gameId, TokenRequirement memory requirement)
        public
        onlyInitialized
        onlyExistingGame(gameId)
        onlyGameCreator(gameId)
    {
        BOGInstance storage game = getGameStorage(gameId);
        game.joinRequirements.push(requirement);
        emit RequirementAdded(gameId, requirement);
    }

    function popJoinRequirements(uint256 gameId)
        public
        onlyInitialized
        onlyExistingGame(gameId)
        onlyGameCreator(gameId)
    {
        BOGInstance storage game = getGameStorage(gameId);
        game.joinRequirements.pop();
    }

    function removeJoinRequirement(uint256 gameId, uint256 index)
        public
        onlyInitialized
        onlyExistingGame(gameId)
        onlyGameCreator(gameId)
    {
        BOGInstance storage game = getGameStorage(gameId);
        delete game.joinRequirements[index];
    }

    function getJoinRequirements(uint256 gameId) public view returns (TokenRequirement[] memory) {
        BOGInstance storage game = getGameStorage(gameId);
        return game.joinRequirements;
    }

    function getCreateGameRequirements() public view returns (TokenRequirement memory) {
        BOGSettings storage settings = BOGStorage();
        return settings.newGameReq;
    }

    function joinGame(uint256 gameId) public payable onlyInitialized onlyExistingGame(gameId) {
        BOGInstance storage game = getGameStorage(gameId);
        // require(game.registrationOpen == true, "This game has no registration open");
        fulfillTokenRequirements(msg.sender, gameId, game.joinRequirements);
        gameId.addPlayer(msg.sender);
    }

    function startGame(uint256 gameId) public onlyInitialized onlyExistingGame(gameId) {
        gameId.startGame();
    }

    // function submitProposals(uint256 gameId, Proposal[] memory proposals) public onlyGameMaster(gameId) {
    //     BOGInstance storage game = getGameStorage(gameId);
    //     require(gameId.gameExists(), "Game does not exist");

    //     for (uint256 i = 0; i < proposals.length; i++) {
    //         game.proposals[i].proposerHidden = proposals[i].proposerHidden;
    //         game.proposals[i].proposal = proposals[i].proposal;
    //         game.proposals[i].score = 0;
    //         game.proposals[i].proposerRevealed = address(0);
    //     }
    // }

    function submitProposal(
        uint256 gameId,
        bytes32 proposerHidden,
        bytes memory proof,
        string memory proposal
    ) public onlyInitialized onlyExistingGame(gameId) onlyGameMaster(gameId) {
        BOGInstance storage game = getGameStorage(gameId);
        require(gameId.gameExists(), "Game does not exist");

        for (uint256 i = 0; i < game.proposals.length; i++) {
            require(game.proposals[i].proposerHidden != proposerHidden, "Proposer already submitted");
        }
        Proposal memory newProposal;
        newProposal.proposerHidden = proposerHidden;
        newProposal.proposal = proposal;
        newProposal.proposerRevealed = address(0);
        newProposal.proof = proof;
        game.proposals.push(newProposal);
    }

    function mintRankTokens(address[3] memory winners, uint256 gameRank) private {
        BOGSettings storage settings = BOGStorage();
        IRankToken rankTokenContract = IRankToken(settings.rankToken.tokenAddress);
        rankTokenContract.mint(winners[0], 3, gameRank + 1, "");
        rankTokenContract.mint(winners[1], 2, gameRank + 1, "");
        rankTokenContract.mint(winners[2], 1, gameRank + 1, "");
    }

    function submitVote(
        uint256 gameId,
        bytes32 voterHidden,
        uint256[3] memory votes,
        bytes memory proof
    ) public onlyInitialized onlyExistingGame(gameId) onlyGameMaster(gameId) {
        BOGInstance storage game = getGameStorage(gameId);

        require(votes[0] != votes[1], "submitVote: cannot vote same items: 0-1");
        require(votes[0] != votes[2], "submitVote: cannot vote same items: 0-2");
        require(votes[1] != votes[2], "submitVote: cannot vote same items: 1-2");

        for (uint8 i = 0; i < 3; i++) {
            require(game.proposals[i].proposerHidden != voterHidden, "Cannot vote for yourself");
            require(votes[i] >= game.proposals.length, "submitVote: vote index is of proposal bounds");
        }
        game.votes[voterHidden].votedFor = votes;
        game.votes[voterHidden].proof = proof;
    }

    function endTurn(
        uint256 gameId,
        uint256 salt,
        address[] memory proposers
    ) public onlyInitialized onlyExistingGame(gameId) {
        BOGInstance storage game = getGameStorage(gameId);
        require(gameId.isGameActive() == true, "_reveal->Game Not Active");
        require(gameId.canEndTurn() == true, "_reveal->cannot do this now");

        Score[] memory scores;
        for (uint256 i = 0; i < game.proposals.length; i++) {
            require(
                keccak256(abi.encode(proposers[i], salt)) == game.proposals[i].proposerHidden,
                "BestOfFacet->reveal: Hashes not match"
            );
            bytes memory message = abi.encode(
                _PROPOSAL_PROOF_TYPEHASH,
                keccak256(abi.encode(gameId, game.proposals[i].proposal, gameId.getRound(), gameId.getTurn(), salt))
            );
            game.proposals[i].proposerRevealed = proposers[i];
            require(
                _isValidSignature(game.proposals[i].proof, message, game.proposals[i].proposerRevealed),
                "endTurn: Signature is wrong"
            );
            scores[i].participant = proposers[i];
            game.score[proposers[i]] = calculateAndVerifyScore(
                gameId,
                game.proposals[i].proposerHidden,
                game.proposals[i].proposerRevealed,
                salt
            );
        }
        bool isRoundOver = gameId.nextTurn();
        emit ProposersRevealed(gameId, proposers, salt, scores);
        if (isRoundOver) {
            address[] memory players = gameId.listPlayers();
            Score[] memory _roundScores;
            Score[3] memory winners;
            for (uint256 i = 0; i < players.length; i++) {
                _roundScores[i].participant = players[i];
                _roundScores[i].score = game.roundScores[gameId.getRoundNumber()][players[i]];
                for (uint256 k = 0; k < winners.length; k++) {
                    if (_roundScores[i].score > winners[i].score) {
                        winners[i].score = _roundScores[i].score;
                        winners[i].participant = _roundScores[i].participant;
                        break;
                    }
                }
            }
            mintRankTokens([winners[0].participant, winners[1].participant, winners[2].participant], game.rank);
            emit RoundFinished(gameId, gameId.getRoundNumber(), _roundScores);
        }
    }

    function onERC1155Received(
        address operator,
        address,
        uint256,
        uint256,
        bytes calldata
    ) public view override onlyInitialized returns (bytes4) {
        if (operator == address(this)) {
            // uint256 gameId = uint256(data);
            // BOGInstance storage game = getGameStorage(gameId);
            // Token _token;
            // _token.tokenAddress = msg.sender;
            // _token.tokenAmount = value;
            // _token.tokenType = TokenTypes.ERC1155;
            // require(gameId.gameExists(),"onERC1155Received->Game does not exist");
            // game.lockedTokens[from].push(_token);

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
    ) external view override onlyInitialized returns (bytes4) {
        return bytes4("");
    }

    function getContractState() public pure returns (BOGSettings memory) {
        BOGSettings storage settings = BOGStorage();
        return settings;
    }

    // function getJoinPrice(uint256 rank) {
    //     BOGSettings storage settings = BOGStorage();
    //     return settings.joinGamePrice**rank;
    // }

    // function lockRankToken(uint256 gameId) private {
    //     BOGSettings storage settings = BOGStorage();
    //     IERC1155 ERC1155Contract = IERC1155(settings.rankToken.tokenAddress);
    //     BOGInstance storage game = getGameStorage(gameId);
    //     require(game.rank > 0, "BestOfGame->lockRankToken: games of rank 0 are token free");
    //     ERC1155Contract.safeTransferFrom(subject, address(this),game.rank,settings.rankToken.tokenAmount,bytes(gameId));
    //     assert(game.lockedTokens[msg.sender][game.lockedTokens[msg.sender].length - 1 ].tokenAddress == settings.rankToken.tokenAddress);
    //     assert(game.lockedTokens[msg.sender][game.lockedTokens[msg.sender].length - 1 ].tokenAmount == settings.rankToken.tokenAmount);
    // }

    // function joinGame(uint256 gameId) private payable {
    //     BOGInstance storage game = getGameStorage(gameId);
    //     BOGSettings storage settings = BOGStorage();
    //     require(gameId.gameExists(), "BestOfGame->joinGame:Game does not exist");
    //     require(game.canBeJoined(), "BestOfGame->joinGame: Game cannot be joined right now");
    //     require(game.isPlayerInGame(gameId), "BestOfGame->joinGame: already participating");
    //     if (game.rank > 0) {
    //         lockRankToken(gameId);
    //     }
    //     bool isWhitelisted = isWhitelisted(msg.sender, getInviteTokens(gameId));
    //     bool hasInvite = getVectorValue(msg.sender, "inviteVector");
    //     if(!isWhitelisted)
    //     {

    //     }
    //     require(
    //         msg.value >= getJoinPrice(game.rank),
    //         "BestOfGame->joinGame: not enough msg.value to join the game"
    //     );
    //     require(
    //         isWhitelisted,
    //         "BestOfGame->joinGame: to join this game you MUST have qualify with access token"
    //     );
    //     transferTokens(msg.sender,)
    // }
}
