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

    struct GameSettings {
        uint256 blocksPerTurn;
        uint256 maxPlayersSize;
        uint256 minPlayersSize;
        uint256 blocksToJoin;
        uint256 maxTurns;
    }

    struct GameInstance {
        address gameMaster;
        uint256 currentTurn;
        uint256 turnStartedAt;
        uint256 registrationOpenAt;
        bool hasStarted;
        EnumerableMap.UintToAddressMap players;
        mapping(address => bool) madeMove;
        uint256 numPlayersMadeMove;
        mapping(address => uint256) score;
        bytes32 implemenationStoragePointer;
    }

    struct TBGStorageStruct {
        GameSettings settings;
        mapping(uint256 => GameInstance) games;
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
        require(settings.maxPlayersSize != 0, "LibTurnBasedGame->gameInit: maxPartySize cannot be zero");
        require(settings.minPlayersSize != 0, "LibTurnBasedGame->gameInit: minPartySize cannot be zero");
        require(settings.maxTurns != 0, "LibTurnBasedGame->gameInit: maxTurns cannot be zero");
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
        if (_game.hasStarted || _game.registrationOpenAt == 0) return false;
        return true;
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
        _game.players.set(_game.players.length(), participant);
        _game.madeMove[participant] = false;
        tbg.playerInGame[participant] = gameId;
    }

    function isPlayerInGame(uint256 gameId, address player) internal view returns (bool) {
        TBGStorageStruct storage tbg = TBGStorage();
        return tbg.playerInGame[player] == gameId ? true : false;
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
        if (block.number <= tbg.settings.blocksPerTurn + _game.turnStartedAt) return false;
        return true;
    }

    function gameExists(uint256 gameId) internal view returns (bool) {
        GameInstance storage _game = _getGame(gameId);
        if (_game.gameMaster != address(0)) return true;
        return false;
    }

    function enforceHasStarted(uint256 gameId) internal view {
        GameInstance storage _game = _getGame(gameId);
        assert(gameId != 0);
        require(_game.hasStarted, "Game has not yet started");
    }

    function canEndTurn(uint256 gameId) internal view returns (bool) {
        GameInstance storage _game = _getGame(gameId);
        bool turnTimedOut = isTurnTimedOut(gameId);
        bool everyoneMadeMove = _game.numPlayersMadeMove == _game.players.length() ? true : false;
        if ((everyoneMadeMove && !turnTimedOut) || turnTimedOut) return true;
        return false;
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

    function _resetPlayerStates(GameInstance storage game, bool ) internal {
        for (uint256 i = 0; i < game.players.length(); i++) {
            (, address player) = game.players.at(i);
            game.madeMove[player] = false;
            game.score[player] = 0;
        }

    }

    function setScore(
        uint256 gameId,
        address player,
        uint256 value
    ) internal {
        GameInstance storage _game = _getGame(gameId);
        require(isPlayerInGame(gameId, player), "LibTurnBasedGame->setScore: player not in a game");
        _game.score[player] = value;
    }

    function getScore(uint256 gameId, address player) internal view returns (uint256) {
        GameInstance storage _game = _getGame(gameId);
        require(isPlayerInGame(gameId, player), "LibTurnBasedGame->getScore: player not in a game");
        return _game.score[player];
    }

    function openRegistration(uint256 gameId) internal {
        require(gameExists(gameId), "LibTurnBasedGame->openRegistration: game not found");
        GameInstance storage _game = _getGame(gameId);
        _game.registrationOpenAt = block.number;
    }

    function isRegistrationOpen(uint256 gameId) internal view returns (bool) {
        GameInstance storage _game = _getGame(gameId);
        TBGStorageStruct storage tbg = TBGStorage();
        if (_game.registrationOpenAt == 0) {
            return false;
        } else {
            return _game.registrationOpenAt < block.number + tbg.settings.blocksToJoin ? true : false;
        }
    }

    function startGame(uint256 gameId, bool startWithMovesMade) internal {
        GameInstance storage _game = _getGame(gameId);
        TBGStorageStruct storage tbg = TBGStorage();
        require(_game.hasStarted == false, "LibTurnBasedGame->startGame Game already started");
        require(_game.registrationOpenAt != 0, "Game registration was not yet open");
        require(
            block.number > _game.registrationOpenAt + tbg.settings.blocksToJoin,
            "LibTurnBasedGame->startGame Joining period has not yet finished"
        );
        require(gameId != 0, "Game does not exist");
        require(_game.players.length() >= tbg.settings.minPlayersSize, "Not enough players to start the game");
        _game.hasStarted = true;
        _game.currentTurn = 1;
        _game.turnStartedAt = block.number;
        _resetPlayerStates(_game,startWithMovesMade);
    }

    function getTurn(uint256 gameId) internal view returns (uint256) {
        GameInstance storage _game = _getGame(gameId);
        return _game.currentTurn;
    }

    function getGM(uint256 gameId) internal view returns (address) {
        GameInstance storage _game = _getGame(gameId);
        return _game.gameMaster;
    }

    function isLastTurn(uint256 gameId) internal view returns (bool) {
        TBGStorageStruct storage tbg = TBGStorage();
        GameInstance storage _game = _getGame(gameId);
        if (_game.currentTurn == tbg.settings.maxTurns) return true;
        else return false;
    }

    function playerMove(uint256 gameId, address player) internal onlyInTurnTime(gameId) {
        GameInstance storage _game = _getGame(gameId);
        enforceHasStarted(gameId);
        require(
            _game.madeMove[player] == false,
            "LibTurnBasedGame->playerMove: Player already made a move in this turn"
        );
        TBGStorageStruct storage tbg = TBGStorage();
        require(
            gameId == tbg.playerInGame[player],
            "LibTurnBasedGame->playerMove: Player is not participating in the game"
        );
        _game.madeMove[player] = true;
        _game.numPlayersMadeMove += 1;
    }



    function nextTurn(uint256 gameId) internal returns (bool) {
        GameInstance storage _game = _getGame(gameId);
        enforceHasStarted(gameId);
        require(!isLastTurn(gameId), "LibTurnBasedGame->nextTurn: game is over");
        _clearCurrentMoves(_game);
        _game.currentTurn += 1;
        return isLastTurn(gameId);
    }

    function getDataStorage() internal pure returns (bytes32 pointer) {
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
        address[] memory players = new address[](_game.players.length());
        for (uint256 i = 0; i < _game.players.length(); i++) {
            (, players[i]) = _game.players.at(i);
        }
        return players;
    }

    function getGameSettings() internal view returns (GameSettings memory) {
        TBGStorageStruct storage tbg = TBGStorage();
        return tbg.settings;
    }
}
