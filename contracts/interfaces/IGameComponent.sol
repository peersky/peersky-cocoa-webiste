// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

interface IGameComponent is IERC165 {
    function gameAddress() external view returns (address);

}
