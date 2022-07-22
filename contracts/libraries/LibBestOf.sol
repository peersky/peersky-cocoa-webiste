// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library libBestOf {
    bytes32 constant internal _PROPOSAL_PROOF_TYPEHASH =
        keccak256("signHashedProposal(uint256 gameId,uint256 turn,bytes32 salt,string proposal)");
    bytes32 constant internal  _VOTE_PROOF_TYPEHASH =
        keccak256("signVote(string vote1,string vote2,string vote3,uint256 gameId,uint256 turn,bytes32 salt)");
}
