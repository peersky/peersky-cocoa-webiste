// SPDX-License-Identifier: MIT
// Author: Tim Pechersky <@Peersky>

pragma solidity ^0.8.4;

import {MockERC20} from "../mocks/MockERC20.sol";
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
        Reentrancy guards MUST be implemented in an implementing contract.

        Usage:
            0. Configure position via configure(...)
            1. fund position with assets via fund(...)
            2. release or refund assets via release(...) or refund(...)
            3. repeat steps 1 and 2 as needed.
                Position can be recofigured at any time when it's effective balance is zero (timesFunded - timesRefuned - timesReleased )


        Test state:
            This library has not been not tested nor audited so far and is not guaranteed to work as expected.

    */

    struct Position {
        mapping(address => mapping(uint256 => TokenRequirement)) tokens;
        uint256 valueToHave;
        uint256 valueToLock;
        uint256 valueToBurn;
        uint256 valueToAccept;
        uint256 valueToAward;
        uint256 timesRefunded;
        uint256 timesReleased;
        uint256 timesFunded;
        address[] tokenAddresses;
        uint256[] tokenIds;
        bool isConfigured;
    }

    struct TokenConfiguration {
        address tokenAddress;
        uint256 tokenId;
        TokenRequirement tokenReq;
    }

    struct ConfigPosition {
        uint256 valueToHave;
        uint256 valueToLock;
        uint256 valueToBurn;
        uint256 valueToAward;
        uint256 valueToAccept;
        TokenConfiguration[] tokenConfigs;
    }

    struct LibCoinVendingStorage {
        mapping(bytes32 => Position) positions;
        address beneficiary;
    }

    struct TokenRequirement {
        TokenTypes _type;
        uint256 valueToLock;
        uint256 valueToBurn;
        uint256 valueToAward;
        uint256 valueToHave;
        uint256 own712Id;
        uint256 valueToAccept;
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

    bytes32 constant COIN_VENDING_STORAGE_POSITION = keccak256("coin.vending.storage.position");

    function coinVendingPosition(bytes32  position) internal view returns (Position storage) {
        return coinVendingStorage().positions[keccak256(abi.encode(position))];
    }

    function coinVendingStorage() internal pure returns (LibCoinVendingStorage storage es) {
        bytes32 position = COIN_VENDING_STORAGE_POSITION;
        assembly {
            es.slot := position
        }
    }

    function trasferFromAny(
        address erc20Addr,
        address from,
        address to,
        uint256 value
    ) private {
        MockERC20 token = MockERC20(erc20Addr);
        if (value != 0) {
            if (from == address(this)) {
                if (to != address(0)) {
                    token.transfer(to, value);
                } else {
                    token.burn(value);
                }
            } else {
                if (to != address(0)) {
                    token.transferFrom(from, to, value);
                } else {
                    token.transferFrom(from, address(this), value);
                    token.burn(value);
                }
            }
        }
    }

    function fulfillERC20(
        address erc20Addr,
        TokenRequirement storage tokenReq,
        address from,
        address payee,
        address beneficiary,
        address burnAddress,
        address lockAddress
    ) private {
        assert(tokenReq._type == TokenTypes.ERC20);
        trasferFromAny(erc20Addr, from, lockAddress, tokenReq.valueToLock);
        trasferFromAny(erc20Addr, from, burnAddress, tokenReq.valueToBurn);
        trasferFromAny(erc20Addr, from, payee, tokenReq.valueToAccept);
        trasferFromAny(erc20Addr, from, beneficiary, tokenReq.valueToAward);
        uint256 value = tokenReq.valueToHave;
        if (value != 0 && from != address(this)) {
            MockERC20 token = MockERC20(erc20Addr);
            require(token.balanceOf(from) >= value, "Not enough erc20 tokens");
        }
    }

    function fulfillERC721(
        address erc721addr,
        uint256 id,
        TokenRequirement storage tokenReq,
        address from,
        address payee,
        address beneficiary,
        address burnAddress,
        address lockAddress
    ) private {
        ERC721 token = ERC721(erc721addr);
        assert(tokenReq._type == TokenTypes.ERC721);

        if (tokenReq.own712Id != 0) {
            if (from == address(this)) {
                require(token.ownerOf(tokenReq.own712Id) == lockAddress, "ERC721 not owner of particular token by id");
            } else {
                require(token.ownerOf(tokenReq.own712Id) == from, "ERC721 not owner of particular token by id");
            }
        }
        if (tokenReq.valueToAccept != 0) {
            token.transferFrom(from, payee, id);
        }
        if (tokenReq.valueToAward != 0) {
            token.transferFrom(from, beneficiary, id);
        }
        if (tokenReq.valueToLock != 0) {
            token.transferFrom(from, lockAddress, id);
        }
        if (tokenReq.valueToBurn != 0) {
            token.transferFrom(from, burnAddress, id);
        }
        if (tokenReq.valueToHave != 0) {
            uint256 balance = token.balanceOf(from);
            require(balance >= tokenReq.valueToHave, "Not enough ERC721 balance");
        }
    }

    function fulfillERC1155(
        address erc1155addr,
        uint256 id,
        TokenRequirement storage tokenReq,
        address from,
        address payee,
        address beneficiary,
        address burnAddress,
        address lockAddress
    ) private {
        IERC1155 token = IERC1155(erc1155addr);
        assert(tokenReq._type == TokenTypes.ERC1155);
        uint256 value = tokenReq.valueToHave;
        if (value != 0) {
            uint256 balance = token.balanceOf(from, id);
            require(balance >= value, "ERC1155 balance is not valid");
        }
        value = tokenReq.valueToAccept;
        if (value != 0) {
            // token.transfe
            token.safeTransferFrom(from, payee, id, value, "");
        }
        value = tokenReq.valueToAward;
        if (value != 0) {
            token.safeTransferFrom(from, beneficiary, id, value, "");
        }
        value = tokenReq.valueToBurn;
        if (value != 0) {
            token.safeTransferFrom(from, burnAddress, id, value, "");
        }
        value = tokenReq.valueToLock;
        if (value != 0) {
            token.safeTransferFrom(from, lockAddress, id, value, "");
        }
    }

    function fulfill(
        Position storage position,
        address from,
        address payee,
        address beneficiary,
        address burnAddress,
        address lockAddress
    ) private {
        if (from == address(this)) {
            if (position.valueToLock != 0) {
                payable(lockAddress).transfer(position.valueToLock);
            }
            if (position.valueToAccept != 0) {
                payable(payee).transfer(position.valueToAccept);
            }
            if (position.valueToAward != 0) {
                payable(beneficiary).transfer(position.valueToAward);
            }
            if (position.valueToBurn != 0) {
                payable(burnAddress).transfer(position.valueToBurn);
            }
        } else {
            uint256 VLReq = position.valueToLock +
                position.valueToBurn +
                position.valueToAccept +
                position.valueToAward;
            require(msg.value >= VLReq, "msg.value too low");
        }
        for (uint256 i = 0; i < position.tokenAddresses.length; i++) {
            address tokenAddress = position.tokenAddresses[i];
            uint256 id = position.tokenIds[i];
            TokenRequirement storage requirement = position.tokens[tokenAddress][id];
            if (requirement._type == TokenTypes.ERC20) {
                fulfillERC20(tokenAddress, requirement, from, payee, beneficiary, burnAddress, lockAddress);
            } else if (requirement._type == TokenTypes.ERC721) {
                fulfillERC721(tokenAddress, id, requirement, from, payee, beneficiary, burnAddress, lockAddress);
            } else if (requirement._type == TokenTypes.ERC1155) {
                fulfillERC1155(tokenAddress, id, requirement, from, payee, beneficiary, burnAddress, lockAddress);
            }
        }
    }

    function _refund(Position storage reqPos, address to) private {
        require((reqPos.timesRefunded + reqPos.timesReleased) < reqPos.timesFunded, "Not enough balance to refund");
        fulfill(reqPos, address(this), to, to, to, to);
        reqPos.timesRefunded += 1;
    }

    function refund(bytes32  position, address to) internal {
        Position storage reqPos = coinVendingPosition(position);
        _refund(reqPos, to);
    }

    function batchRefund(bytes32  position, address[] memory returnAddresses) internal {
        Position storage reqPos = coinVendingPosition(position);
        for (uint256 i = 0; i < returnAddresses.length; i++) {
            _refund(reqPos, returnAddresses[i]);
        }
    }

    function _release(
        Position storage reqPos,
        address payee,
        address beneficiary,
        address returnAddress
    ) private {
        require((reqPos.timesRefunded + reqPos.timesReleased) < reqPos.timesFunded, "Not enough balance to release");
        fulfill(reqPos, address(this), payee, beneficiary, address(0), returnAddress);
        reqPos.timesReleased += 1;
    }

    function release(
        bytes32  position,
        address payee,
        address beneficiary,
        address returnAddress
    ) internal {
        Position storage reqPos = coinVendingPosition(position);
        _release(reqPos, payee, beneficiary, returnAddress);
    }

    function batchRelease(
        bytes32  position,
        address payee,
        address beneficiary,
        address[] memory returnAddresses
    ) internal {
        Position storage reqPos = coinVendingPosition(position);
        for (uint256 i = 0; i < returnAddresses.length; i++) {
            {
                _release(reqPos, payee, beneficiary, returnAddresses[i]);
            }
        }
    }

    function _fund(Position storage reqPos, address funder) private {
        require(reqPos.isConfigured, "Position does not exist");
        fulfill(reqPos, funder, address(this), address(this), address(this), address(this));
        reqPos.timesFunded += 1;
    }

    function fund(bytes32  position) internal {
        Position storage reqPos = coinVendingPosition(position);
        _fund(reqPos, msg.sender);
    }

    function configure(bytes32 position, ConfigPosition memory configuration) internal {
        Position storage reqPos = coinVendingPosition(position);
        require(
            reqPos.timesFunded == 0 || (reqPos.timesFunded == (reqPos.timesRefunded + reqPos.timesReleased)),
            "Cannot mutate position with currently positive balance"
        );
        reqPos.valueToHave = configuration.valueToHave;
        reqPos.valueToLock = configuration.valueToLock;
        reqPos.valueToBurn = configuration.valueToBurn;
        reqPos.valueToAccept = configuration.valueToAccept;
        reqPos.valueToAward = configuration.valueToAward;
        for (uint256 i = 0; i < configuration.tokenConfigs.length; i++) {
            reqPos.tokenAddresses.push(configuration.tokenConfigs[i].tokenAddress);
            reqPos.tokenIds.push(configuration.tokenConfigs[i].tokenId);
            reqPos.tokens[configuration.tokenConfigs[i].tokenAddress][
                configuration.tokenConfigs[i].tokenId
            ] = configuration.tokenConfigs[i].tokenReq;
        }
        reqPos.isConfigured = true;
    }
}
