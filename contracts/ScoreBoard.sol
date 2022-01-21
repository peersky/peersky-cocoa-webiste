pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";

contract ScoreBoard is Ownable {
    struct ParticipantStruct {
        address participantAddress;
        uint256 score;
    }
    ParticipantStruct[] _participants;
    mapping(address => uint256) public index;

    constructor() {
        ParticipantStruct memory newParticipant;
        newParticipant.participantAddress = address(0);
        newParticipant.score = 0;
        _participants.push();
    }

    function updateScore(address participant, uint256 newScore)
        public
        onlyOwner
    {
        _participants[index[participant]].score = newScore;
    }

    function increseScore(address participant, uint256 value)
        external
        onlyOwner
    {
        require(
            index[participant] != 0,
            "participant is not registered at the scoreboard"
        );
        uint256 c = value + _participants[index[participant]].score;
        if (c < value) {
            c = type(uint256).max;
        }
        _participants[index[participant]].score = c;
    }

    function decreseScore(address participant, uint256 value)
        external
        onlyOwner
    {
        require(
            index[participant] != 0,
            "participant is not registered at the scoreboard"
        );
        uint256 c;
        if (value < _participants[index[participant]].score) {
            c = _participants[index[participant]].score - value;
        } else {
            c = 0;
        }
        _participants[index[participant]].score = c;
    }

    function resetScores() external onlyOwner {
        for (uint256 i = 0; i < _participants.length; i++) {
            _participants[i].score = 0;
        }
    }

    function registerParticipant(address newParticipantAddress)
        external
        onlyOwner
    {
        require(
            index[newParticipantAddress] == 0,
            "this participant is already registered"
        );
        index[newParticipantAddress] = _participants.length;
        ParticipantStruct memory newParticipant;
        newParticipant.participantAddress = newParticipantAddress;
        newParticipant.score = 0;
        _participants.push(newParticipant);
    }

    function readScoreBoard() public view returns (ParticipantStruct[] memory) {
        return _participants;
    }

    function readTest() public pure returns (uint256) {
        return 1000;
    }
}
