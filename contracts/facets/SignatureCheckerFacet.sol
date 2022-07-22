// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../abstracts/draft-EIP712Diamond.sol";
import "../interfaces/ISignatureCheckerFacet.sol";

contract SignatureCheckerFacet is EIP712, ISignatureCheckerFacet {
    function isValidSignature(
        bytes memory message,
        bytes memory signature,
        address account
    ) public view override returns (bool) {
        bytes32 typedHash = _hashTypedDataV4(keccak256(message));
        return SignatureChecker.isValidSignatureNow(account, typedHash, signature);
    }
}
