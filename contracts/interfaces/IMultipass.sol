// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

interface IMultipass is IERC165 {
    /**
     * @dev resolves user from any given argument
     * Requirements:
     *  domainName must be given and must be initialized
     *  id OR username OR address must be given
     * This method first tries to resolve by address, then by user id and finally by username
     * @param domainName domain name
     * @param userAddress adress of user
     * @param id user id
     * @param username username
     * @param targetDomain if this is set to valid domain name, then after sucessfull resolving account at domainName,
     *                       this method will rerun with resolving user properties in targetDomain
     * @return (status, address, id, username, nonce)
     */
    function resolveRecord(
        bytes32 domainName,
        address userAddress,
        bytes32 id,
        bytes32 username,
        bytes32 targetDomain
    )
        external
        view
        returns (
            bool,
            address,
            bytes32,
            bytes32,
            uint96
        );

    /**
     * @dev Initializes new domain and configures it's parameters
     *
     * Requirements:
     *  registrar is not zero
     *  domainName is not empty
     *  domainIndex is either zero(auto assign) or can be one of preoccupied domain names
     *  domainName does not exist yet
     *  onlyOwner
     *  referrerReward+referralDiscount cannot be larger than fee
     *  @param registrar address of registrar
     *  @param freeRegistrationsNumber number of registrations free of fee
     *  @param fee fee in base currency of network
     *  @param domainName name of domain
     *  @param referrerReward referral fee share in base currency of network
     *  @param referralDiscount referral discount in base currency of network
     *
     *  Emits an {InitializedDomain} event.
     */
    function initializeDomain(
        address registrar,
        uint256 freeRegistrationsNumber,
        uint256 fee,
        bytes32 domainName,
        uint256 referrerReward,
        uint256 referralDiscount
    ) external;

    /**
     * @dev Activates domain name
     *
     * Requirements:
     *  msg.sender is Owner
     *
     *
     *  Emits an {DomainActivated} event.
     */
    function activateDomain(bytes32 domainName) external;

    /**
     * @dev Deactivates domain name
     *
     * Deactivated domain cannot mutate names and will return zeros
     *
     * Requirements:
     *  msg.sender is Owner OR registrar
     *
     *
     *  Emits an {DomainDeactivated} event.
     */

    function deactivateDomain(bytes32 domainName) external;

    /**
     * @dev Changes registrar address
     *
     * Requirements:
     *  msg.sender is Owner
     *
     *  Emits an {DomainFeeChanged} event.
     */
    function changeFee(bytes32 domainName, uint256 fee) external;

    /**
     * @dev Changes registrar address
     *
     * Requirements:
     *  msg.sender is Owner
     *
     *  Emits an {RegistrarChangeRequested} event.
     */
    function changeRegistrar(bytes32 domainName, address newRegistrar) external;

    /**
     * @dev deletes name
     *
     * Requirements:
     *  msg.sender is Owner
     *
     *  Emits an {DomainTTLChangeRequested} event.
     */
    function deleteName(
        bytes32 domainName,
        address userAddress,
        bytes32 username,
        bytes32 id
    ) external;

    /**
     * @dev executes all pending changes to domain that fulfill TTL
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
        bytes32 domainName
    ) external;

    /**
     * @dev registers new name under domain
     *
     * Requirements:
     *  all arguments must be set
     *  domainName must be active
     * resolveRecord for given arguments should return no record
     * @param domainName domain of the scope
     * @param name name to register
     * @param id id to associate to name
     * @param applicantAddress address which will associate with id and name
     * @param referrer address for refferal program
     * @param registrarSignature signature of the registrar
     * @param signatureDeadline signature valid until this block
     *
     *
     *  Emits an {registered} event.
     */
    function register(
        bytes32 domainName,
        bytes32 name,
        bytes32 id,
        address applicantAddress,
        bytes memory registrarSignature,
        uint256 signatureDeadline,
        address referrer,
        bytes32 referrerDomainName,
        bytes memory applicantSignature,
        bytes memory referrerSignature
    ) external payable;

    /**
     * @dev modifies exsisting record
     *
     * Requirements:
     * resolveRecord for given arguments should return valid record
     * domain must be active
     * newAddress and newName should be set and be unique in current domain
     *
     * @param domainName domain
     * @param id user id
     * @param newName new name
     *
     *  Emits an {Modified} event.
     */
    function modifyUserName(
        bytes32 domainName,
        bytes32 id,
        bytes32 newName,
        uint96 nonce,
        bytes memory registrarSignature,
        uint256 signatureDeadline
    ) external payable;

    /**
     * @dev returns balance of this contract
     */
    function getBalance() external view returns (uint256);

    /**
     * @dev returns domain state variables
     * @param domain name of the domain
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
    function getDomainState(bytes32 domain)
        external
        view
        returns (
            bytes32,
            uint256,
            uint256,
            uint256,
            uint256,
            bool,
            address,
            uint24,
            uint256
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
    function withrawFunds() external;

    event fundsWithdawn(uint256 indexed amount, address indexed account);

    event InitializedDomain(uint256 index, bytes32 domainName);
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
