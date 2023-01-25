// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

interface ISocialIdentityToken is IERC20 {
    /**
     * @dev burns amount of tokens on both desitnation and message sender
     * @param destination - address from which to burn
     * @param amount - amount to burn
     */
    function purge(address destination, uint256 amount) external;

    /**
     * @dev delegates amount of tokens to be used to prove trust level. These
     *  absoluteTrustLevel,relativeTrustLevel,isTrustedEnough
     * @param to - address to delegate to
     * @param amount - amount to delegate
     */
    function delegateTo(address to, uint256 amount) external;

    /**
     * @dev returns summ of wallet balance and amount of tokens delegated to
     * @param wallet - address to check
     * @return amount equal to sum of tokens delegated to and wallets own balance
     */
    function absoluteTrustLevel(address wallet) external view returns (uint256);

    /**
     * @dev returns amount of tokens owned and delegated to, relative to total token supply
     * @param wallet - address to check
     * @return ratio of absoluteTrustLevel to totalSupply
     */
    function relativeTrustLevel(address wallet) external view returns (uint256);

    /**
     * @dev Checks if wallet has enough relativeTrustLevel to pass a threshold
     * @param wallet - address to check
     * @param relativeLevelThreshold required relative trust level
     * @return bool - true if relativeLevelThreshold is equal or less then relativeTrustLevel()
     */
    function isTrustedEnough(address wallet, uint256 relativeLevelThreshold) external view returns (bool);

    /**
     * @dev Checks how much tokens are delegated from someone to someone
     * @param from - address who delegates
     * @param to - address delegated to
     * @return uint256 - amount of delegated tokens
     */
    function amountDelegatedTo(address from, address to) external view returns (uint256);

    /**
     * @dev Checks how many delegates address has
     * @param from - address who delegates
     * @return uint256 - amount of delegates
     */
    function numberOfDelegatesOf(address from) external view returns (uint256);

    /**
     * @dev Paginated return of all delegates of an address
     * @param from - address who delegates
     * @param pageSize - number of addresses to be returned
     * @param page - offset from zero index in delegatedTo
     * @return address[] - array of addresses delegatedTo
     */
    function getDelegatesOf(
        address from,
        uint256 pageSize,
        uint256 page
    ) external view returns (address[] memory);

    /**
     * @dev resets token by changing memory slot where data is stored and re-minting maxSupply() to signers
     * Requirements: signers must sign messages. signers total balance should be at least 50% of circulating supply.
     * Result of successfull call of this method is:
     * - Anyone who is not mentioned in signers will lose his tokens
     * - Amount of tokens burned is set to zero
     * - Signers get distributed maxSupply proportionally to their bre-burn amount
     * @param signers - array of signers who are willing to initiate this
     * @param signatures - signatures of signers to verify their intention
     */
    function burnPheonix(address[] memory signers, bytes[] memory signatures) external;

    //identity level of an address, returns identityAmount(address)/getCurrentSupply();
    // function identityLevel(address wallet) public view returns (uint256) external;
    //Changes memory slot where token amounts where mapped, and reconstructs token with issuing max cap in proportions of amounts that signers held before
    //Signers must have majority of circulating tokens to execute this.
    //This is emegrency recovery method that will make anyone who was not in the signers nor in the whitelist to lose their tokens.
    // function Restart(address signers[], uint256 signerDeadlines[], address whiteslist[]) public;

    event Purged(address indexed destination, address indexed initiator, uint256 amount);
    event DelegateUpdated(address indexed from, address to, uint256 amount);
    event TotalDelegated(address indexed to, uint256 amount);
    event BurnedPheonix(address[] indexed signers, uint256 indexed timesBurned);
}
