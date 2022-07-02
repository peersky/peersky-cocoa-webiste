// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// import "./LibDiamondOwner.sol";
// import { IMultipass } from "../interfaces/sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {EnumerableMap} from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

library LibTBG {
    using EnumerableMap for EnumerableMap.AddressToUintMap;
    using EnumerableMap for EnumerableMap.UintToAddressMap;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // using EnumerableMap for EnumerableMap.

    // struct arrayLikeMapAddresses {
    //     mapping(uint256 => address) contents;
    //     mapping(address => uint256) includes;
    //     uint256 length;
    // }

    // // function ()
    // enum TokenTypes {
    //     ERC20,
    //     ERC1155,
    //     ERC721
    // }
    // struct GameBank {
    //     EnumerableMap.UintToAddressMap addresses;
    //     mapping(address => TokenTypes) types;
    //     mapping(address => TokenTypes) amounts;
    // }

    // // Defines tokens and their required amounts for being able to authenticate for some game part
    // struct assetRequirement {
    //     TokenTypes standard;
    //     address contractAddress;
    //     uint256 id;
    //     uint256 amountToBurn;
    //     uint256 amountToHold;
    //     uint256 amountToStake;
    //     uint256 amountToPay;
    // }

    // struct Players {
    //     mapping(address => EnumerableMap.UintToAddressMap) parties;
    //     // mapping(address => assetRequirement) requirements;
    //     mapping(address => address) memberOfParty;
    // }

    enum CanJoin {
        beforeRoundStart,
        beforeStart,
        anytime
    }

    struct GameSettings {
        uint256 blocksPerTurn;
        uint256 turnsPerRound;
        uint256 maxPlayersSize;
        uint256 minPlayersSize;
        CanJoin joinPolicy;
        uint256 maxRounds;
        uint256 blocksToJoin;
        // uint256 actionsPerTurn;
    }

    struct GameInstance {
        address gameMaster;
        uint256 currentRound;
        uint256 currentTurn;
        uint256 turnStartedAt;
        uint256 roundEndedAt;
        uint256 registrationOpenAt;
        bool hasStarted;
        EnumerableMap.UintToAddressMap players;
        mapping(address => bool) madeMove;
        uint256 numPlayersMadeMove;
        mapping(address => uint256) score;
        bool isRoundOver;
        bytes32 implemenationStoragePointer;
    }

    struct TBGStorageStruct {
        GameSettings settings;
        mapping(uint256 => GameInstance) games;
        // mapping(string => uint256) gameIdToNum;
        uint256 gameNum;
        mapping(address => uint256) playerInGame;
        uint256 totalGamesCreated;
    }

    bytes32 constant TBG_STORAGE_POSITION = keccak256("turnbasedgame.storage.position");
    bytes32 constant IMPLEMENTATION_STORAGE_POSITION = keccak256("implementation.turnbasedgame.storage.position");

    function TBGStorage() internal pure returns (TBGStorageStruct storage es) {
        bytes32 position = TBG_STORAGE_POSITION;
        assembly {
            es.slot := position
        }
    }

    function _getGame(uint256 gameId) internal view returns (GameInstance storage) {
        TBGStorageStruct storage tbg = TBGStorage();
        return tbg.games[gameId];
    }

    function init(GameSettings memory settings) internal {
        TBGStorageStruct storage tbg = TBGStorage();
        require(settings.blocksPerTurn != 0, "LibTurnBasedGame->gameInit: gameInitblocksPerTurn cannot be zero");
        require(settings.turnsPerRound != 0, "LibTurnBasedGame->gameInit: turnsPerRound not set");
        require(settings.maxPlayersSize != 0, "LibTurnBasedGame->gameInit: maxPartySize cannot be zero");
        require(settings.minPlayersSize != 0, "LibTurnBasedGame->gameInit: minPartySize cannot be zero");
        require(settings.maxRounds != 0, "LibTurnBasedGame->gameInit: maxRounds cannot be zero");
        require(settings.blocksToJoin != 0, "LibTurnBasedGame->gameInit: blocksToJoin cannot be zero");
        require(
            settings.maxPlayersSize >= settings.minPlayersSize,
            "LibTurnBasedGame->gameInit: maxPlayersSize must be greater or equal to minPlayersSize"
        );
        tbg.settings = settings;
    }

    function createGame(uint256 gameId, address gm) internal {
        TBGStorageStruct storage tbg = TBGStorage();
        require(gm != address(0), "LibTurnBasedGame->createGame GM cannot be zero");
        require(gameId != 0, "LibTurnBasedGame->createGame gameId cannot be empty");
        require(tbg.games[gameId].gameMaster == address(0), "LibTurnBasedGame->createGame gameId already exists");
        tbg.gameNum += 1;
        gameId = tbg.gameNum;
        tbg.games[tbg.gameNum].gameMaster = gm;
        tbg.totalGamesCreated += 1;

        //totalGamesCreated ensures nonce-like behaviur:
        //even if game would get deleted and re-created with same name, data storage would be different
        tbg.games[tbg.gameNum].implemenationStoragePointer = keccak256(
            abi.encode(gameId, tbg.totalGamesCreated, TBG_STORAGE_POSITION)
        );
    }

    function canBeJoined(uint256 gameId) internal view returns (bool) {
        GameInstance storage _game = _getGame(gameId);
        TBGStorageStruct storage tbg = TBGStorage();
        CanJoin joinPolicy = tbg.settings.joinPolicy;
        if (joinPolicy == CanJoin.anytime) return true;
        if (_game.hasStarted && _game.isRoundOver && joinPolicy == CanJoin.beforeRoundStart) return true;
        if (!_game.hasStarted && (joinPolicy == CanJoin.beforeStart)) return true;
        return false;
    }

    function addPlayer(uint256 gameId, address participant) internal {
        TBGStorageStruct storage tbg = TBGStorage();
        require(gameExists(gameId), "LibTurnBasedGame->addPlayer: game does not exist");

        require(
            tbg.playerInGame[participant] == 0,
            "LibTurnBasedGame->addPlayer: Can participate only in one game instance at a time"
        );
        GameInstance storage _game = _getGame(gameId);
        require(_game.players.length() < tbg.settings.maxPlayersSize, "Game is full");

        require(canBeJoined(gameId), "LibTurnBasedGame->addPlayer: Game cannot be joined at the moment");
        require(_game.registrationOpenAt != 0, "Registration was not yet open");
        console.logUint(_game.players.length());
        _game.players.set(_game.players.length(), participant);
        _game.madeMove[participant] = false;
        tbg.playerInGame[participant] = gameId;
    }

    function isPlayerInGame(uint256 gameId, address player) internal view returns (bool) {
        TBGStorageStruct storage tbg = TBGStorage();
        return tbg.playerInGame[player] == gameId ? true : false;
    }

    // struct Bytes32ToBytes32Map {
    //     // Storage of keys
    //     EnumerableSet.Bytes32Set _keys;
    //     mapping(bytes32 => bytes32) _values;
    // }
    // struct UintToAddressMap {
    //     Bytes32ToBytes32Map _inner;
    // }

    // struct Bytes32Set {
    //     Set _inner;
    // }

    struct Set {
        // Storage of set values
        bytes32[] _values;
        // Position of the value in the `values` array, plus 1 because index 0
        // means a value is not in the set.
        mapping(bytes32 => uint256) _indexes;
    }

    function getIdx(EnumerableMap.UintToAddressMap storage map, address key) internal view returns (uint256) {
        return map._inner._keys._inner._indexes[bytes32(uint256(uint160(key)))];
    }

    function removePlayer(uint256 gameId, address participant) internal {
        GameInstance storage _game = _getGame(gameId);
        uint256 playerIdx = getIdx(_game.players, participant);
        _game.players.remove(playerIdx);
    }

    function isTurnTimedOut(uint256 gameId) internal view returns (bool) {
        TBGStorageStruct storage tbg = TBGStorage();
        GameInstance storage _game = _getGame(gameId);
        assert(gameId != 0);
        assert(_game.hasStarted == true);
        if (_game.isRoundOver == true) return true;
        if (block.number <= tbg.settings.blocksPerTurn + _game.turnStartedAt) return false;
        return true;
    }

    function gameExists(uint256 gameId) internal view returns (bool) {
        GameInstance storage _game = _getGame(gameId);
        if (_game.gameMaster != address(0)) return true;
        return false;
    }

    function isGameActive(uint256 gameId) internal view returns (bool) {
        GameInstance storage _game = _getGame(gameId);
        assert(gameId != 0);
        return _game.hasStarted;
    }

    function canEndTurn(uint256 gameId) internal view returns (bool) {
        GameInstance storage _game = _getGame(gameId);
        bool turnTimedOut = isTurnTimedOut(gameId);
        bool everyoneMadeMove = _game.numPlayersMadeMove == _game.players.length() ? true : false;
        if ((everyoneMadeMove && !turnTimedOut) || turnTimedOut) return true;
        return false;
    }

    modifier onlyActiveGame(uint256 gameId) {
        require(isGameActive(gameId), "game not active");
        _;
    }

    modifier onlyInTurnTime(uint256 gameId) {
        require(isTurnTimedOut(gameId) == false, "onlyInTurnTime -> turn timedout");
        _;
    }

    modifier onlyWhenTurnCanEnd(uint256 gameId) {
        require(canEndTurn(gameId) == true, "onlyWhenTurnCanEnd: Not everyone made a move yet and there still is time");
        _;
    }

    function _clearCurrentMoves(GameInstance storage game) internal {
        for (uint256 i = 0; i < game.players.length(); i++) {
            (, address player) = game.players.at(i);
            game.madeMove[player] = false;
        }
        game.numPlayersMadeMove = 0;
    }

    function _resetCurrentPlayers(GameInstance storage game) internal {
        for (uint256 i = 0; i < game.players.length(); i++) {
            (, address player) = game.players.at(i);
            game.madeMove[player] = false;
            game.players.remove(i);
            game.score[player] = 0;
        }
        assert(game.players.length() == 0);
    }

    function openRegistration(uint256 gameId) internal {
        require(gameExists(gameId), "LibTurnBasedGame->openRegistration: game not exists");
        GameInstance storage _game = _getGame(gameId);
        _game.registrationOpenAt = block.number;
    }

    function isRegistrationOpen(uint256 gameId) internal view returns (bool)
    {
         GameInstance storage _game = _getGame(gameId);
         TBGStorageStruct storage tbg = TBGStorage();
         if(_game.registrationOpenAt == 0)
         {
            return false;
         } else
         {
            return _game.registrationOpenAt < block.number + tbg.settings.blocksToJoin ? true : false;
         }
    }

    function startGame(uint256 gameId) internal {
        GameInstance storage _game = _getGame(gameId);
        TBGStorageStruct storage tbg = TBGStorage();
        require(_game.hasStarted == false, "LibTurnBasedGame->startGame Game already started");
        require(_game.registrationOpenAt != 0, "Game registration was not yet open");
        require(
            _game.registrationOpenAt < block.number + tbg.settings.blocksToJoin,
            "LibTurnBasedGame->startGame Joining period has not yet finished"
        );
        require(gameId != 0, "Game does not exist");
        require(_game.players.length() >= tbg.settings.minPlayersSize, "Not enough players to start the game");
        _game.hasStarted = true;
        _game.isRoundOver = false;
        _game.currentRound = 1;
        _game.currentTurn = 1;
        _game.turnStartedAt = block.number;
        _resetCurrentPlayers(_game);
    }

    function getRound(uint256 gameId) internal view returns (uint256) {
        GameInstance storage _game = _getGame(gameId);
        return _game.currentRound;
    }

    function getTurn(uint256 gameId) internal view returns (uint256) {
        GameInstance storage _game = _getGame(gameId);
        return _game.currentTurn;
    }

    function getGM(uint256 gameId) internal view returns (address) {
        GameInstance storage _game = _getGame(gameId);
        return _game.gameMaster;
    }

    function playerMove(uint256 gameId, address player) internal onlyInTurnTime(gameId) {
        GameInstance storage _game = _getGame(gameId);
        require(
            _game.madeMove[player] == false,
            "LibTurnBasedGame->playerMove: Player already made a move in this turn"
        );
        _game.madeMove[player] = true;
        _game.numPlayersMadeMove += 1;
        assert(_game.numPlayersMadeMove <= _game.players.length());
    }

    function nextTurn(uint256 gameId) internal returns (bool) {
        TBGStorageStruct storage tbg = TBGStorage();
        GameInstance storage _game = _getGame(gameId);
        require(isGameActive(gameId), "LibTurnBasedGame->nextTurn: game not active");
        require(canEndTurn(gameId), "LibTurnBasedGame->nextTurn: game not active");

        _clearCurrentMoves(_game);
        if (_game.currentRound >= tbg.settings.turnsPerRound) {
            _game.isRoundOver = true;
            _game.roundEndedAt = block.number;
        } else {
            _game.currentTurn += 1;
        }

        return (_game.isRoundOver);
    }

    function nextRound(uint256 gameId) internal onlyActiveGame(gameId) {
        TBGStorageStruct storage tbg = TBGStorage();
        GameInstance storage _game = _getGame(gameId);
        require(_game.isRoundOver == true, "LibTurnBasedGame->nextRound: Current round is not over yet");
        require(
            block.number >= _game.roundEndedAt + tbg.settings.blocksToJoin,
            "LibTurnBasedGame->nextRound: Pause between rounds is yet active"
        );
        _game.isRoundOver = false;
        _game.currentRound += 1;
        _game.currentTurn = 1;
        _game.turnStartedAt = block.number;
    }

    function getRoundNumber(uint256 gameId) internal view returns (uint256) {
        GameInstance storage _game = _getGame(gameId);
        return _game.currentRound;
    }

    function listPlayers(uint256 gameId) internal view returns (address[] memory) {
        GameInstance storage _game = _getGame(gameId);
        address[] memory _players;
        for (uint256 i = 0; i < _game.players.length(); i++) {
            (, _players[i]) = _game.players.at(i);
        }
        return _players;
    }

    function getImplemenationDataStorage() internal pure returns (bytes32 pointer) {
        return IMPLEMENTATION_STORAGE_POSITION;
    }

    function getGameDataStorage(uint256 gameId) internal view returns (bytes32 pointer) {
        GameInstance storage _game = _getGame(gameId);
        return _game.implemenationStoragePointer;
    }

    function getPlayersNumber(uint256 gameId) internal view returns (uint256) {
        GameInstance storage _game = _getGame(gameId);
        return _game.players.length();
    }

    function getPlayers(uint256 gameId) internal view returns (address[] memory) {
        GameInstance storage _game = _getGame(gameId);
        address[] memory players;
        for (uint256 i = 0; i < _game.players.length(); i++) {
            (, players[i]) = _game.players.at(i);
        }
        return players;
    }
}
