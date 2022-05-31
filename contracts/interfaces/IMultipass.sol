// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../libraries/LibMultipass.sol";

interface IMultipass {


    function resolveRecord(LibMultipass.NameQuery memory query)
        external
        view
        returns (
            bool, LibMultipass.RecordBytes32 memory
        );

    /** @dev same as resolveRecord but returns username, id and LibMultipass.Domain as string */
    function resolveRecordToString(LibMultipass.NameQuery memory query)
        external
        view
        returns (
            bool,
            LibMultipass.Record memory
        );

    /**
     * @dev Initializes new LibMultipass.Domain and configures it's parameters
     *
     * Requirements:
     *  registrar is not zero
     *  domainName is not empty
     *  domainIndex is either zero(auto assign) or can be one of preoccupied LibMultipass.Domain names
     *  domainName does not exist yet
     *  onlyOwner
     *  referrerReward+referralDiscount cannot be larger than fee
     *  @param registrar address of registrar
     *  @param freeRegistrationsNumber number of registrations free of fee
     *  @param fee fee in base currency of network
     *  @param domainName name of LibMultipass.Domain
     *  @param referrerReward referral fee share in base currency of network
     *  @param referralDiscount referral discount in base currency of network
     *
     *  Emits an {InitializedDomain} event.
     */
    function initializeDomain(
        address registrar,
        uint256 freeRegistrationsNumber,
        uint256 fee,
        string memory domainName,
        uint256 referrerReward,
        uint256 referralDiscount
    ) external;

    /**
     * @dev Activates LibMultipass.Domain name
     *
     * Requirements:
     *  msg.sender is Owner
     *
     *
     *  Emits an {DomainActivated} event.
     */
    function activateDomain(string memory domainName) external;

    /**
     * @dev Deactivates LibMultipass.Domain name
     *
     * Deactivated LibMultipass.Domain cannot mutate names and will return zeros
     *
     * Requirements:
     *  msg.sender is Owner OR registrar
     *
     *
     *  Emits an {DomainDeactivated} event.
     */

    function deactivateDomain(string memory domainName) external;

    /**
     * @dev Changes registrar address
     *
     * Requirements:
     *  msg.sender is Owner
     *
     *  Emits an {DomainFeeChanged} event.
     */
    function changeFee(string memory domainName, uint256 fee) external;

    /**
     * @dev Changes registrar address
     *
     * Requirements:
     *  msg.sender is Owner
     *
     *  Emits an {RegistrarChangeRequested} event.
     */
    function changeRegistrar(string memory domainName, address newRegistrar) external;

    /**
     * @dev deletes name
     *
     * Requirements:
     *  msg.sender is Owner
     *
     *  Emits an {DomainTTLChangeRequested} event.
     */
    function deleteName(LibMultipass.NameQuery memory query) external;

    /**
     * @dev executes all pending changes to LibMultipass.Domain that fulfill TTL
     *
     * Requirements:
     *  domainName must be set
     *  referrerFeeShare+referralDiscount cannot be larger than 2^32
     *
     *
     *  Emits an {ReferralProgramChangeRequested} event.
     */
    function changeReferralProgram(
        uint256 referrerFeeShare,
        uint256 referralDiscount,
        string memory domainName
    ) external;

    /**
     * @dev registers new name under LibMultipass.Domain
     *
     * Requirements:
     *  all arguments must be set
     *  domainName must be active
     * resolveRecord for given arguments should return no LibMultipass.Record
     *
     *
     *  Emits an {registered} event.
     */
    function register(
        LibMultipass.NameQuery memory query,
        bytes memory registrarSignature,
        uint256 signatureDeadline,
        LibMultipass.NameQuery memory referrer,
        bytes memory referrerSignature
    ) external payable;

    /**
     * @dev modifies exsisting LibMultipass.Record
     *
     * Requirements:
     * resolveRecord for given arguments should return valid LibMultipass.Record
     * LibMultipass.Domain must be active
     * newAddress and newName should be set and be unique in current LibMultipass.Domain
     *
     * @param domainName LibMultipass.Domain
     * @param id user id
     * @param newName new name
     *
     *  Emits an {Modified} event.
     */
    function modifyUserName(
        string memory domainName,
        string memory id,
        string memory newName,
        uint96 nonce,
        bytes memory registrarSignature,
        uint256 signatureDeadline
    ) external payable;

    /**
     * @dev returns balance of this contract
     */
    function getBalance() external view returns (uint256);

    /**
     * @dev returns LibMultipass.Domain state variables
     * @param domainName name of the LibMultipass.Domain
     * @return (name,
      fee,
      freeRegistrationsNumber,
       referrerReward,
       referralDiscount,
       isActive,
       registrar,
       ttl,
        registerSize)
     */
    function getDomainState(string memory domainName)
        external
        view
        returns (
            // bytes32,
            // uint256,
            // uint256,
            // uint256,
            // uint256,
            // bool,
            // address,
            // uint24,
            LibMultipass.Domain memory
            // uint256
        );

    /**
     * @dev returns contract state variables

     * @return (s_numDomains)
     */
    function getContractState() external view returns (uint256);

    /**
     * @dev returns version of the contract

     * @return version string
     */
    function version() external view returns (string memory);

    /**
     * @dev Withraws funds stored in smart contract
     *
     * Requirements:
     *  onlyOwner
     *
     *  Emits an {fundsWithdawn} event.
     */
    function withrawFunds(address to) external;

    event fundsWithdawn(uint256 indexed amount, address indexed account);

    event InitializedDomain(uint256 indexed index, string indexed domainName);
    event DomainActivated(bytes32 indexed domainName);
    event DomainDeactivated(bytes32 indexed domainName);

    event DomainFeeChanged(bytes32 indexed domainName, uint224 indexed newFee);
    event FreeRegistrationsChanged(uint256 indexed domainIndex, uint256 indexed newAmount);

    event RegistrarChangeRequested(bytes32 indexed domainName, address indexed registrar);
    event DomainNameChangeRequested(uint256 indexed domainIndex, bytes32 indexed NewDomainName);
    event DomainDeleteRequested(uint256 indexed domainIndex);
    event DomainTTLChangeRequested(bytes32 indexed domainName, uint256 amount);
    event ReferralProgramChangeRequested(bytes32 indexed domainName, uint32 fee, uint32 discount);
    event DomainChangesAreLive(bytes32 indexed domainName, bytes32[] indexed changes);
    event changesQeueCanceled(bytes32 indexed domainName, bytes32[] indexed changes);

    event Registered(bytes32 indexed domainName, address indexed userAddress, bytes32 name, bytes32 id);

    event Referred(address indexed refferrer, address indexed by, bytes32 indexed domainName);

    event Modified(bytes32 indexed domainName, bytes32 newName, bytes32 indexed id, address indexed newAddress);
}
