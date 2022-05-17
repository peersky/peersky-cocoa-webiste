// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./IGameComponent.sol";

interface IParty is IERC165, IGameComponent {
    function invite(string memory name) external payable;

    function kick(address _address) external;

    function leave() external;

    function accept() external;

    function reject() external;

    function promote() external;

    function votekick() external;

    function partyinfo() external;

    function readycheck() external;

    function ready() external;

    function getNameService() external view returns (address);

    function getGame() external view returns (address);

    function getPartyNames() external view returns (string[] memory);

    function getPartyAddresses() external view returns (address[] memory);

    function getPartySize() external view returns (uint256);

    function getMemberNameByIndex(uint256 _index)
        external
        view
        returns (string memory);

    function getMemberAddressByIndex(uint256 _index)
        external
        view
        returns (address);

    event LogSetDNSRecord(string indexed _username, address indexed _account);
}
