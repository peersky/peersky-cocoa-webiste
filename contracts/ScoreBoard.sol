pragma solidity ^0.8.4;
import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract ScoreBoard is Ownable {
    address[] _participantAddresses;

    struct ParticipantStruct {
        address participantAddress;
        uint256 index;
        uint256 score;
    }
    mapping(address => ParticipantStruct) public participants;

    constructor() {
        _participantAddresses.push(address(0));
    }

    function updateScore(address participant, uint256 newScore)
        public
        onlyOwner
    {
        participants[participant].score = newScore;
    }

    function increseScore(address participant, uint256 value)
        external
        onlyOwner
    {
        require(
            participants[participant].index != 0,
            "participant is not registered at the scoreboard"
        );
        uint256 c = value + participants[participant].score;
        if (c < value) {
            c = type(uint256).max;
        }
        participants[participant].score = c;
    }

    function decreseScore(address participant, uint256 value)
        external
        onlyOwner
    {
        require(
            participants[participant].index != 0,
            "participant is not registered at the scoreboard"
        );
        uint256 c;
        if (value < participants[participant].score) {
            c = participants[participant].score - value;
        } else {
            c = 0;
        }
        participants[participant].score = c;
    }

    function resetScores() external onlyOwner {
        for (uint256 i = 0; i < _participantAddresses.length; i++) {
            updateScore(_participantAddresses[i], 0);
        }
    }

    function registerParticipant(address newParticipant) external onlyOwner {
        require(
            participants[newParticipant].index == 0,
            "this participant is already registered"
        );
        _participantAddresses.push(newParticipant);
        participants[newParticipant].index = _participantAddresses.length - 1;
    }

    function readScoreBoard() public view returns (ParticipantStruct[] memory) {
        ParticipantStruct[] memory _Score;
        require(_participantAddresses.length > 0, "there are no participants");
        for (uint256 i = 1; i < _participantAddresses.length; i++) {
            _Score[i] = participants[_participantAddresses[i]];
        }
        return _Score;
    }

    function readTest() public pure returns (uint256) {
        return 1000;
    }
}
