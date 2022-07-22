// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ISignatureCheckerFacet {
    function isValidSignature(
        bytes memory message,
        bytes memory signature,
        address account
    ) external view returns (bool);
}
