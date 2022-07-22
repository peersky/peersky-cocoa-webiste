// SPDX-License-Identifier: MIT
// import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.0;

// contract IDToken is ERC1155, Ownable
// {
//     uint256 numPools;
//     //TODO constant
//      uint256 MAX_INT = 2**256 - 1;
//     constructor(string memory uri_) ERC1155(uri_)
//     {
//         require(owner() != address(0), "must specify owner of the contract");
//         transferOwnership(msg.sender);
//     }

//     function mint(address to, bytes memory data) internal onlyOwner returns(uint256) {
//         require(to != address(0), "RankToken->mint: Address not specified");
//         numPools += 1;
//         _mint(to, numPools,MAX_INT, data);
//         return numPools;
//     }

//     function burn(address from, uint256 tokenId) public
//     {
//         require(balanceOf(msg.sender, tokenId) > 0, "You must have same token id order to burn");
//         uint256 balanceOfFrom = balanceOf(from, tokenId);
//         uint256 balanceOfSender = balanceOf(msg.sender, tokenId);
//         if(balanceOfFrom >= balanceOfSender)
//         {
//             _burn(from, tokenId, balanceOfSender);
//             _burn(msg.sender, tokenId, balanceOfSender);
//         }
//         else {
//             _burn(from,tokenId, balanceOfFrom);
//             _burn(msg.sender, tokenId, balanceOfFrom);
//         }
//     }

// }