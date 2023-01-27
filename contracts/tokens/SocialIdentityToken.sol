// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./ERC20Slot.sol";
import "../interfaces/ISocialIdentityToken.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

contract SocialIdentityToken is ERC20Slot, ISocialIdentityToken, EIP712 {
    using EnumerableMap for EnumerableMap.AddressToUintMap;

    mapping(address => uint256) totalDelegated;
    mapping(address => EnumerableMap.AddressToUintMap) individualDelegation;

    constructor(
        string memory name,
        string memory symbol,
        address[] memory to,
        uint256[] memory amount
    ) ERC20Slot(name, symbol) EIP712(name, "0.0.1") {
        for (uint256 i = 0; i < to.length; i++) {
            _mint(to[i], amount[i]);
        }
    }

    /**
     * @dev makes sure totalSupply is not over maxSupply.
     */
    function _mint(address account, uint256 amount) internal virtual override {
        super._mint(account, amount);
        require(totalSupply() <= _maxSupply(), "ERC20Slot: total supply risks overflowing votes");
    }

    function purge(address destination, uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "purge: Not enough tokens");
        uint256 targetBalance = balanceOf(destination);
        uint256 amountToPurge = targetBalance < amount ? targetBalance : amount;

        _burn(destination, amountToPurge);
        _burn(msg.sender, amountToPurge);

        emit Purged(destination, msg.sender, amountToPurge);
    }

    function getIdx(EnumerableMap.UintToAddressMap storage map, address key) private view returns (uint256) {
        return map._inner._keys._inner._indexes[bytes32(uint256(uint160(key)))];
    }

    function _delegateTo(
        address from,
        address to,
        uint256 amount
    ) internal {
        uint256 senderBalance = balanceOf(from);
        require(senderBalance >= amount, "delegateTo: Not enough tokens");
        (bool isFound, uint256 value) = individualDelegation[from].tryGet(to);
        uint256 wasDelegated = isFound ? value : 0;
        individualDelegation[from].set(to, amount);
        totalDelegated[to] = totalDelegated[to] - wasDelegated + amount;

        if (amount == 0) individualDelegation[from].remove(to);
        emit DelegateUpdated(from, to, amount);
        emit TotalDelegated(to, totalDelegated[to]);
    }

    function delegateTo(address to, uint256 amount) public {
        _delegateTo(msg.sender, to, amount);
    }

    function absoluteTrustLevel(address wallet) public view returns (uint256) {
        uint256 balance = balanceOf(wallet);
        return balance + totalDelegated[wallet];
    }

    function relativeTrustLevel(address wallet) public view returns (uint256) {
        uint256 absolute = absoluteTrustLevel(wallet);
        require(totalSupply() > 0, "total supply is zero");
        //total supply max is 2^224 - 1;
        //max absolute value is 2^224 - 1;
        //absolute * 100 max is 2^224-1 * 100 is approx 2^231 -> overflow impossible
        return (absolute * 100) / totalSupply();
    }

    function isTrustedEnough(address wallet, uint256 relativeLevelThreshold) public view returns (bool) {
        require(relativeLevelThreshold > 0, "relativeLevelThreshold is zero");
        uint256 relative = relativeTrustLevel(wallet);
        return relative >= relativeLevelThreshold ? true : false;
    }

    function amountDelegatedTo(address from, address to) public view returns (uint256) {
        (bool success, uint256 value) = individualDelegation[from].tryGet(to);
        return success ? value : 0;
    }

    function numberOfDelegatesOf(address from) public view returns (uint256) {
        return individualDelegation[from].length();
    }

    /**
     * @dev Returns the current quorum numerator. See {quorumDenominator}.
     */
    function quorumNumerator() public view virtual returns (uint256) {
        return 50;
    }

    /**
     * @dev Returns the quorum denominator. Defaults to 100, but may be overridden.
     */
    function quorumDenominator() public view virtual returns (uint256) {
        return 100;
    }

    function getDelegatesOf(
        address from,
        uint256 pageSize,
        uint256 page
    ) public view returns (address[] memory) {
        uint256 delegatesNum = individualDelegation[from].length();
        uint256 firstPageIdx = pageSize * page;
        address[] memory delegatesPage = new address[](pageSize);
        if (firstPageIdx > delegatesNum) return new address[](0);
        if (firstPageIdx + pageSize > individualDelegation[from].length()) {
            for (uint256 i = 0; i < delegatesNum - firstPageIdx; i++) {
                (address delegate, ) = individualDelegation[from].at(firstPageIdx + i);
                delegatesPage[i] = delegate;
            }
            return delegatesPage;
        } else {
            for (uint256 i = 0; i < pageSize; i++) {
                (address delegate, ) = individualDelegation[from].at(firstPageIdx + i);
                delegatesPage[i] = delegate;
            }
            return delegatesPage;
        }
    }

    function checkSignature(
        bytes memory message,
        bytes memory signature,
        address account
    ) public view returns (bool) {
        bytes32 typedHash = _hashTypedDataV4(keccak256(message));
        return SignatureChecker.isValidSignatureNow(account, typedHash, signature);
    }

    bytes32 internal constant PHEONIX_TYPEHASH = keccak256("initiatePheonixBurn(uint256 currentIncornation)");

    function isValidSignature(bytes memory signature, address signer) public view returns (bool) {
        bytes memory message = abi.encode(PHEONIX_TYPEHASH, getSlot());
        bytes32 typedHash = _hashTypedDataV4(keccak256(message));
        return SignatureChecker.isValidSignatureNow(signer, typedHash, signature);
    }

    function burnPheonix(address[] memory signers, bytes[] memory signatures) public {
        require(signers.length == signatures.length, "Signers and signatures arrays not equal size");
        uint256[] memory signerBalances = new uint256[](signers.length);
        uint256 totalSignersBalance = 0;
        uint256 oldTokenSupply = totalSupply();
        require(oldTokenSupply != 0, "Token Has no supply");
        for (uint256 i = 0; i < signers.length; i++) {
            bytes memory signature = signatures[i];
            address signer = signers[i];
            uint256 balance = balanceOf(signer);
            signerBalances[i] = balance;
            totalSignersBalance += balance;
            require(isValidSignature(signature, signer), "invalid signature detected");
        }

        require((totalSignersBalance) > oldTokenSupply / 2, "Signers have no majority");
        _increaseSlot();
        for (uint256 i = 0; i < signers.length; i++) {
            address signer = signers[i];
            uint256 weight = (signerBalances[i] * quorumDenominator()) / oldTokenSupply;
            uint256 amount = (_maxSupply() * weight) / quorumDenominator();
            _mint(signer, amount);
        }
        emit BurnedPheonix(signers, getSlot());
    }

    /**
     * @dev Maximum token supply. Defaults to `type(uint224).max` (2^224^ - 1).
     */
    function _maxSupply() internal view virtual returns (uint224) {
        return type(uint224).max;
    }

    function _afterTokenTransfer(
        address from,
        address,
        uint256
    ) internal override {
        // address[] storage delegations = delegatesOf[from];
        uint256 fromNewBalance = balanceOf(from);
        for (uint256 i = 0; i < individualDelegation[from].length(); i++) {
            (address asignee, uint256 value) = individualDelegation[from].at(i);

            // (bool isFound, uint256 value) = individualDelegation[from].tryGet(to);

            if (value > fromNewBalance) {
                //Amount delegated now is larger than balance of delegator
                //Hence we reduce delegated amount to new balance value
                _delegateTo(from, asignee, fromNewBalance);
            }
        }
    }
}
