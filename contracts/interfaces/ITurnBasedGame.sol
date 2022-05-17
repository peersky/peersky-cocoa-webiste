// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

interface IGame is IERC165, IAccessControl {
    function setRule(uint256 key, uint32 rule) external;

    function getRule(uint256 key) external view returns (uint32);

    function setRulesVersion(uint256 version) external;

    function getRulesVersion() external view returns (uint256);

    function getRules() external view returns (uint32[] memory);

    function start(uint256 _round) external;

    function end(uint256 _round) external;

    function processTurn(uint256 _round) external;

    function roundState(uint256 _round) external view returns (bytes memory);
}
