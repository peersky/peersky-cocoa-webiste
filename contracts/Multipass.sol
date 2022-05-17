// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./interfaces/IMultipass.sol";

contract Multipass is Ownable, EIP712, ReentrancyGuard, IMultipass, ERC165 {
    using ECDSA for bytes32;

    /**
     * @dev The domain name of the registrar.
     * @param registrar is the address private key of which is owned by signing server (e.g. Discord bot server)
     * @param name is unique string that is used to find this domain within domains.
     * @param freeRegistrationsNumber is the number of free registrations for this domain

     * @param fee amount of payment requried to register name in the domain
     * @param ttl time to live for changes in the domain properties
     * @param isActive when is false domain name will not respond to any changes and will not return any address
    **/
    struct Domain {
        bytes32 name; //32bytes
        uint256 fee; //32bytes
        uint256 freeRegistrationsNumber; //32bytes
        uint256 referrerReward; //32bytes
        uint256 referralDiscount; //32bytes
        bool isActive; //1byte
        address registrar; //20 bytes
        uint24 ttl; //3 bytes (not being used for now)
        //Total: 128bytes
    }

    /**
     * @dev The domain name of the registrar.
     * @param properties - domain configuration
     * @param idToAddress is mapping from unique identificator to an address
     * @param registerSize is number of registered users for this domain
     * @param nonce is incremented each time record changes in addressToId map
     * @param nameToId is mapping from names to unique identificator. While each name required to be unique,
                        names might change on the domain, so we keep records to user identificators as immutable property of user
     * @param addressToId is mapping from an address to unique identificator
     * @param idToName is mapping from identificator to a name
    **/
    struct DomainNameService {
        Domain properties; //128 bytes
        uint256 registerSize; //32bytes
        mapping(bytes32 => address) idToAddress; //N*20bytes
        mapping(bytes32 => uint96) nonce; //N*12bytes
        mapping(address => bytes32) addressToId; //N*32 bytes
        mapping(bytes32 => bytes32) nameToId; //N*32 bytes
        mapping(bytes32 => bytes32) idToName; //N*32 bytes
        // mapping(bytes32 => uint95) isSignatureUsed; //N*32 bytes
        //Total: 128+N*160 Bytes
    }

    // mapping(uint256 => Domain) private s_pendingChanges;
    mapping(uint256 => DomainNameService) private s_domains;
    mapping(bytes32 => uint256) private s_domainNameToIndex; //helper to get domain index by name
    // mapping(address => mapping(uint256 => bytes32)) s_addressToDomainNames; //N*DN*32 bytes
    // mapping(address => uint256) s_numDomainsOfAddress; // N * 32 bytes

    uint256 private s_numDomains;

    constructor(address owner, string memory name_) EIP712(name_, version()) {
        transferOwnership(owner);
    }

    function _getDomainStorage(bytes32 domainName) private view returns (DomainNameService storage) {
        // uint256 _index = ;
        // require(_index != 0, "Multipass->_getDomainStorage: domain name not found");
        return s_domains[s_domainNameToIndex[domainName]];
    }

    function _setRecord(
        DomainNameService storage domain,
        address addr,
        bytes32 id,
        bytes32 username
    ) private {
        domain.addressToId[addr] = id;
        domain.idToAddress[id] = addr;
        domain.idToName[id] = username;
        domain.nameToId[username] = id;
        domain.nonce[id] += 1;
    }

    function _resolveFromAddress(address _address, DomainNameService storage _domain)
        private
        view
        returns (
            bytes32,
            bytes32,
            uint96
        )
    {
        bytes32 resolvedId = _domain.addressToId[_address];
        bytes32 resolvedUsername = _domain.idToName[resolvedId];
        uint96 resolvedNonce = _domain.nonce[resolvedId];
        return (resolvedId, resolvedUsername, resolvedNonce);
    }

    function initializeDomain(
        address registrar,
        uint256 freeRegistrationsNumber,
        uint256 fee,
        bytes32 domainName,
        uint256 referrerReward,
        uint256 referralDiscount
    ) public override onlyOwner {
        require(registrar != address(0), "Multipass->initializeDomain: You must provide a registrar address");
        require(domainName != bytes32(0), "Multipass->initializeDomain: Domain name cannot be empty");
        require(s_domainNameToIndex[domainName] == 0, "Multipass->initializeDomain: Domain name already indexed");
        (bool status, uint256 result) = SafeMath.tryAdd(referrerReward, referralDiscount);
        require(status == true, "Multipass->initializeDomain: referrerReward + referralDiscount cause overflow");
        require(result <= fee, "Multipass->initializeDomain: referral values are higher then fee itself");

        uint256 domainIndex = s_numDomains + 1;
        DomainNameService storage _domain = s_domains[domainIndex];
        _domain.properties.registrar = registrar;
        _domain.properties.freeRegistrationsNumber = freeRegistrationsNumber;
        _domain.properties.fee = fee;
        _domain.properties.name = domainName;
        _domain.properties.referrerReward = referrerReward;
        _domain.properties.referralDiscount = referralDiscount;
        s_numDomains++;
        s_domainNameToIndex[domainName] = s_numDomains;

        emit InitializedDomain(domainIndex, domainName);

    }

    function resolveRecord(
        bytes32 domainName,
        address userAddress,
        bytes32 id,
        bytes32 username,
        bytes32 targetDomain
    )
        public
        view
        override
        returns (
            bool,
            address,
            bytes32,
            bytes32,
            uint96
        )
    {
        require(
            (userAddress != address(0)) || (id != bytes32(0)) || (username != bytes32(0)),
            "Multipass->resolveRecord: must provide address or id or username"
        );

        DomainNameService storage _domain = s_domains[s_domainNameToIndex[domainName]];
        DomainNameService storage _targetDomain = s_domains[
            s_domainNameToIndex[targetDomain == bytes32(0) ? domainName : targetDomain]
        ];

        address resolvedAddress;
        bytes32 resolvedId;
        bytes32 resolvedUsername;
        uint96 resolvedNonce;

        {
            if (userAddress != address(0)) {
                //Resolve by address is first priority
                resolvedAddress = userAddress;
                (resolvedId, resolvedUsername, resolvedNonce) = _resolveFromAddress(resolvedAddress, _targetDomain);
            } else if (id != bytes32(0)) {
                //Resolve by Id is second priority
                resolvedAddress = _domain.idToAddress[id];
            } else if (username != bytes32(0)) {
                bytes32 _id = _domain.nameToId[username];
                resolvedAddress = _domain.idToAddress[_id];
            }
            (resolvedId, resolvedUsername, resolvedNonce) = _resolveFromAddress(resolvedAddress, _targetDomain);
        }

        {
            bool status;
            status = resolvedAddress != address(0) ? true : false;
            status = resolvedId != bytes32(0) ? true : false;
            status = resolvedUsername != bytes32(0) ? true : false;

            return (status, resolvedAddress, resolvedId, resolvedUsername, resolvedNonce);
        }
    }

    function activateDomain(bytes32 domainName) public override onlyOwner {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        _domain.properties.isActive = true;
    }

    function deactivateDomain(bytes32 domainName) public override onlyOwner {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        _domain.properties.isActive = false;
    }

    function changeFee(bytes32 domainName, uint256 fee) public override onlyOwner {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        uint256 _referrerReward = _domain.properties.referrerReward;
        uint256 _referralDiscount = _domain.properties.referralDiscount;
        require(
            _referralDiscount + _referrerReward <= fee,
            "Multipass->changeFee: referral rewards would become too high"
        );
        _domain.properties.fee = fee;
    }

    function changeRegistrar(bytes32 domainName, address newRegistrar) public override onlyOwner {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        require(newRegistrar != address(0), "new registrar cannot be zero");
        _domain.properties.registrar = newRegistrar;
    }

    function deleteName(
        bytes32 domainName,
        address userAddress,
        bytes32 username,
        bytes32 id
    ) public override {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        require(
            (msg.sender == Ownable.owner()) || (msg.sender == _domain.properties.registrar),
            "Multipass->deleteName: Only registrar or owner can call this"
        );
        (bool status, address resolvedAddress, bytes32 resolvedId, bytes32 resolvedUsername, ) = resolveRecord(
            domainName,
            userAddress,
            id,
            username,
            bytes32(0)
        );
        require(status == true, "Multipass->deleteName: name not resolved");
        _domain.addressToId[resolvedAddress] = bytes32(0);
        _domain.idToAddress[resolvedId] = address(0);
        _domain.idToName[resolvedId] = bytes32(0);
        _domain.nameToId[resolvedUsername] = bytes32(0);
        _domain.nonce[resolvedId] += 1;
        _domain.registerSize--;
    }

    function changeReferralProgram(
        uint256 referrerReward,
        uint256 referralDiscount,
        bytes32 domainName
    ) public override onlyOwner {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        (bool status, uint256 result) = SafeMath.tryAdd(referrerReward, referralDiscount);
        require(status == true, "Multipass->changeReferralProgram: referrerReward + referralDiscount cause overflow");
        require(
            result <= _domain.properties.fee,
            "Multipass->changeReferralProgram: referral values are higher then the fee itself"
        );
        _domain.properties.referrerReward = referrerReward;
        _domain.properties.referralDiscount = referralDiscount;
    }

    function _validateRegistration(
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
    ) private {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        require(_domain.properties.isActive, "Multipass->register: domain is not active");
        require(name != bytes32(0), "Multipass->register: Name cannot be empty");
        require(id != bytes32(0), "Multipass->register: Id cannot be empty");
        require(applicantAddress != address(0), "Multipass->register: User address cannot be empty");
        require(
            signatureDeadline > block.number,
            "Multipass->register: Signature deadline must be greater than current block number"
        );
        require(referrer != applicantAddress, "Multipass->register: Cannot refer yourself");
        {
            bytes memory registrarMessage = abi.encodePacked(domainName, id, name, signatureDeadline);
            require(
                _isValidSignature(registrarMessage, registrarSignature, _domain.properties.registrar) &&
                    (signatureDeadline > block.number),
                "Registrar signature is not valid"
            );
        }
        {
            bytes memory applicantMessage = abi.encodePacked(domainName, applicantAddress, id, name);
            require((signatureDeadline > block.number), "Multipass->register: Deadline timeout");
            require(
                _isValidSignature(applicantMessage, applicantSignature, applicantAddress) == true,
                "Multipass->register: Applicant signature is not valid"
            );
        }
        {
            (bool status, , , , ) = resolveRecord(domainName, applicantAddress, id, name, bytes32(0));
            require(!status, "Multipass->register: applicant is already registered, use modify instread");
        }
        if (referrer != address(0)) {
            {
                bytes32 _refDomain = referrerDomainName != bytes32(0) ? referrerDomainName : domainName;
                require(
                    _isValidSignature(abi.encodePacked(_refDomain, referrer), referrerSignature, referrer) &&
                        (signatureDeadline > block.number),
                    "Multipass->register: Referrer signature is not valid"
                );
                (bool referrerResolved, , , , ) = resolveRecord(_refDomain, applicantAddress, id, name, bytes32(0));
                require(referrerResolved == true, "Multipass->register: Referrer not found");
            }
        }

        require(msg.value >= _domain.properties.fee, "Multipass->register: Payment is not enough");
    }

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
    ) external payable override nonReentrant {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        _validateRegistration(
            domainName,
            name,
            id,
            applicantAddress,
            registrarSignature,
            signatureDeadline,
            referrer,
            referrerDomainName,
            applicantSignature,
            referrerSignature
        );
        address payable owner = payable(owner());
        {
            uint256 referrersShare = _domain.properties.referrerReward;
            uint256 valueToPay = SafeMath.sub(_domain.properties.fee, _domain.properties.referralDiscount);
            uint256 valueToOwner = SafeMath.sub(msg.value, referrersShare);

            require(msg.value >= valueToPay, "Multipass->register: Payment value is not enough");
            require(owner.send(valueToOwner), "Multipass->register: Failed to pay fee");
            require(payable(referrer).send(referrersShare), "Multipass->register: Failed to send referral reward");
        }
        _setRecord(_domain, applicantAddress, id, name);
    }

    function _isValidSignature(
        bytes memory message,
        bytes memory signature,
        address account
    ) internal view returns (bool) {
        bytes32 structHash = keccak256(abi.encode(message));
        bytes32 typedHash = _hashTypedDataV4(structHash);

        return SignatureChecker.isValidSignatureNow(account, typedHash, signature);
    }

    function modifyUserName(
        bytes32 domainName,
        bytes32 id,
        bytes32 newName,
        uint96 nonce,
        bytes memory registrarSignature,
        uint256 signatureDeadline
    ) public payable override {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        require(_domain.properties.isActive, "Multipass->modifyUserName: domain is not active");
        require(newName != bytes32(0), "Multipass->modifyUserName: Name cannot be empty");
        require(
            signatureDeadline >= block.number,
            "Multipass->modifyUserName: Signature deadline must be greater than current block number"
        );
        bytes memory registrarMessage = abi.encodePacked(domainName, id, newName, nonce, signatureDeadline);
        require(
            _isValidSignature(registrarMessage, registrarSignature, _domain.properties.registrar),
            "Multipass->modifyUserName: Not a valid signature"
        );
        uint256 feeCoefficient = SafeMath.div(_domain.properties.fee, 10);
        uint256 nonceCoefficient = SafeMath.mul(nonce, nonce);
        uint256 _fee = SafeMath.add(SafeMath.mul(feeCoefficient, nonceCoefficient), _domain.properties.fee);
        require(msg.value >= _fee, "Multipass->modifyUserName: Not enough payment");
        require(_domain.nonce[id] == nonce, "Multipass->modifyUserName: invalid nonce");
        require(_domain.nameToId[newName] == bytes32(0), "OveMultipass->modifyUserName: new name already exists");

        _domain.nonce[id] += 1;
        _domain.nameToId[newName] = id;
        _domain.idToName[id] = newName;
        _domain.nameToId[_domain.idToName[id]] = bytes32(0);
    }

    function getBalance() external view override returns (uint256) {
        return address(this).balance;
    }

    function getDomainState(bytes32 domain)
        external
        view
        override
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
        )
    {
        DomainNameService storage _domain = _getDomainStorage(domain);
        return (
            _domain.properties.name,
            _domain.properties.fee,
            _domain.properties.freeRegistrationsNumber,
            _domain.properties.referrerReward,
            _domain.properties.referralDiscount,
            _domain.properties.isActive,
            _domain.properties.registrar,
            _domain.properties.ttl,
            _domain.registerSize
        );
    }

    function getContractState() external view override returns (uint256) {
        return s_numDomains;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IMultipass).interfaceId || super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IGovernor-version}.
     */
    function version() public view virtual override returns (string memory) {
        return "1";
    }

    function withrawFunds() external override onlyOwner {
        address _owner = owner();
        payable(_owner).transfer(address(this).balance);
    }
}
