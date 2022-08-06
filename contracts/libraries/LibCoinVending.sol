// SPDX-License-Identifier: MIT
// Author: Tim Pechersky <@Peersky>

pragma solidity ^0.8.4;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

library LibCoinVending {

    /*
        This library is used to simulate the vending machine coin acceptor state machine that:
        - Supports large number of positions; Each represents requirements to acess different goods of the virtual vending machine.
        - Accepts multiple assets of following types: Native (Eth), ERC20, ERC721, and ERC1155 tokens that can be stacked together.
        - Allows for each individual asset action promise can be one of following:
            - Lock: The asset is locked in the acceptor with promise that asset will be returned to the sender at release funds time.
            - Bet: The asset is locked in the acceptor with promise that asset will be awarded to benificiary at release funds time.
            - Pay: The asset is locked in the acceptor with promise that asset will be paid to payee at release funds time.
            - Burn: The asset is locked in the acceptor with promise that asset will be destroyed at release funds time.
        - Maintains each position balance, hence allowing multiple participants to line up for the same position.
        - Allows three actions:
            - Fund position with assets
            - Refund assets to user
            - Consume assets and provide goods to user
        - Consuming asset might take a form of
            - Transferring assets to payee
            - Burning assets
            - Awarding beneficiary with assets
            - Returning locked assets back to sender

        This library DOES enforces that any position can only be refunded or processed only within amount funded boundaries.
        This library DOES NOT store the addresses of senders, nor benificiaries, nor payees.
        This is to be stored within implementation contract.


        !!!!! IMPORTANT !!!!!
        This library does NOT invocates reentrancy guards. It is implementation contract's responsibility to enforce reentrancy guards.
        Reentrancy guards MUST be implemented in an implementation contract.

        Usage:
            0. Create a new requirements and position name within implementation contract.
            1. fund position with assets via fund(...)
            2. release or consume assets via release(...) or consume(...)
            3. repeat steps 1 and 2 as needed

        Test state:
            This library has not been not tested nor audited so far and is not guaranteed to work as expected.

    */

   struct Position {
    mapping(address => TokenRequirement) tokens;
    uint256 immutable valueToLock;
    uint256 immutable valueToBurn;
    uint256 immutable valueToAccept;
    uint256 immutable valueToAward;
    address[] tokenAddresses;
    uint256 timesRefunded;
    uint256 timesReleased;
    uint256 timesFunded;
   }


    struct LibCoinVendingStorage
    {
        mapping(address => AccountVault) vaults;
        mapping(bytes32 => Position) positions;
        address beneficiary;
    }


    struct TokenRequirement {
        Token token;
        uint256 immutable amount;
        bool immutable requireParticularERC721;
        RequirementTypes immutable applicantMust;
    }

    enum TokenTypes {
        ERC20,
        ERC1155,
        ERC721
    }

    enum RequirementTypes {
        HAVE,
        LOCK,
        BURN,
        BET,
        PAY
    }

    struct Token {
        TokenTypes immutable _type;
        uint256 immutable _id;
    }

    bytes32 constant COIN_VENDING_STORAGE_POSITION = keccak256("coin.vending.storage.position");

    function coinVendingPosition(string memory position) returns (Positions storage) {
        return CoinVendingStorage().positions[keccak256(abi.encode(position))];
    }
    function coinVendingStorage() internal pure returns (LibCoinVendingStorage storage es) {
        bytes32 position = COIN_VENDING_STORAGE_POSITION;
        assembly {
            es.slot := position
        }
    }



    function fulfillTokenRequirements(
        string policy,
        address applicant,
        address to,
        uint256 gameId,
        TokenRequirement[] memory reqs
    ) internal {
        for (uint256 i = 0; i < reqs.length; i++) {
                    uint256 TxTVL = 0;
                    if(req.token._type == TokenTypes.NATIVE)
                    {
                        TxTVL += req.amount;
                    }
            fulfillTokenRequirement(policy,applicant, to, gameId, reqs[i]);
        }
        require(msg.value >= txTVL, "Not enough total payment");
    }

    function fulfillERC20(address erc20Addr, RequirementTypes must, uint256 amount, address from, address to, address beneficiary, address burnAddress) private {
        ERC20 token = ERC20(erc20Addr);
        if(must == RequirementTypes.HAVE)
        {
            require(token.balanceOf(from) >= amount, "Not enough tokens");
        }
        else if(must == RequirementTypes.LOCK)
        {
            token.transferFrom(from, address(this), amount);
        }
        else if(must == RequirementTypes.BURN)
        {
            token.transferFrom(from, burnAddress, amount);
        }
        else if(must == RequirementTypes.BET)
        {
            token.transferFrom(from, beneficiary, amount);
        }
        else if(must == RequirementTypes.PAY)
        {
            token.transferFrom(from, to, amount);
        }

    }

    function fulfillERC721(address erc721addr, uint256 tokenId, RequirementTypes must, address from, address to, address beneficiary, address burnAddress, bool reqParticular) private {
        ERC721 token = ERC721(erc721addr);
        if(must == RequirementTypes.HAVE)
        {
            if (req.requireParticularERC721) {
                    address owner = ERC721Contract.ownerOf(req.token._id);
                    require(owner == applicant, "ERC721 not owner of particular token by id");
                } else {
                    uint256 balance = ERC721Contract.balanceOf(applicant);
                    require(balance >= req.amount, "ERC721 balance is not valid");
                }
        }
        else if(must == RequirementTypes.LOCK)
        {
            token.safeTransferFrom(from, address(this), tokenId);
        }
        else if(must == RequirementTypes.BURN)
        {
            token.safeTransferFrom(from, burnAddress, tokenId);
        }
        else if(must == RequirementTypes.BET)
        {
            token.safeTransferFrom(from, beneficiary, tokenId);
        }
        else if(must == RequirementTypes.PAY)
        {
            token.safeTransferFrom(from, to, tokenId);
        }
    }

    function fulfillERC1155(address erc1155addr, uint256 tokenId, RequirementTypes must, uint256 amount, address from, address payee, address beneficiary, address burnAddress) private {
        ERC1155 token = ERC1155(erc1155addr);
        if(must == RequirementTypes.HAVE)
        {
            if (req.requireParticularERC721) {
                    address owner = ERC721Contract.ownerOf(req.token._id);
                    require(owner == applicant, "ERC721 not owner of particular token by id");
                } else {
                    uint256 balance = ERC721Contract.balanceOf(applicant);
                    require(balance >= req.amount, "ERC721 balance is not valid");
                }
        }
        else if(must == RequirementTypes.LOCK)
        {
            token.safeTransferFrom(from, address(this), tokenId, amount, "");
        }
        else if(must == RequirementTypes.BURN)
        {
            token.safeTransferFrom(from, burnAddress, tokenId, amount, "");
        }
        else if(must == RequirementTypes.BET)
        {
            token.safeTransferFrom(from, beneficiary, tokenId, amount, "");
        }
        else if(must == RequirementTypes.PAY)
        {
            token.safeTransferFrom(from, payee, tokenId, amount, "");
        }
    }

    function fulfill(Position storage position, address from, address payee, address beneficiary, address burnAddress) private
    {
        if (position.valueToBurn != 0) {
            from.transfer(position.valueToBurn);
        }
        if (position.valueToReturn != 0) {
           from.transfer(position.valueToReturn);
        }
        if (position.valueToPay != 0) {
            from.transfer(position.valueToPay);
        }
        if (position.valueToReward != 0) {
            from.transfer(position.valueToAward);
        }
        for(uint256 i = 0; i < position.tokenAddresses.length; i++)
        {
            address tokenAddress = position.tokenAddresses[i];
            TokenRequirement storage requirement  = position.tokens[tokenAddress];
            if(requirement.token._type == TokenTypes.ERC20)
            {
                fulfillERC20(tokenAddress, requirement.applicantMust, requirement.amount, from, payee, beneficiary, burnAddress);
            }
            else if(requirement.token._type == TokenTypes.ERC721)
            {
                fulfillERC721(tokenAddress, requirement.token._id, requirement.applicantMust, from, payee, beneficiary, burnAddress, requirement.requireParticularERC721);
            }
            else if(requirement.token._type == TokenTypes.ERC1155)
            {
                fulfillERC1155(tokenAddress, requirement.token._id, requirement.applicantMust, requirement.amount, from, payee, beneficiary, burnAddress);
            }
        }
    }

    function refund(string memory position, address to) internal
    {
        Position storage reqPos = coinVendingPosition(position);
        require((reqPos.timesRefunded+reqPos.timesReleased) < reqPos.timesFunded, "Not enough tokens to refund");
        fulfill(reqPos, address(this), to, to, to);
        reqPos.refunded +=1;

    }

    function release(string memory position, address payee, address beneficiary) internal
    {
        Position storage reqPos = coinVendingPosition(position);
        require((reqPos.timesRefunded+reqPos.timesReleased) < reqPos.timesFunded, "Not enough tokens to release");
        fulfill(reqPos, address(this), payee, beneficiary, to);
        reqPos.released +=1;
    }

    function fund(string memory position, address funder) internal
    {
        Position storage reqPos = coinVendingPosition(position);
        fulfill(reqPos, funder, address(this), address(this), address(this));
        reqPos.timesFunded +=1;
    }

}
