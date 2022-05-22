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
        mapping(bytes32 => address) idToAddress; //N*20bytes
        mapping(bytes32 => uint96) nonce; //N*12bytes
        mapping(address => bytes32) addressToId; //N*32 bytes
        mapping(bytes32 => bytes32) nameToId; //N*32 bytes
        mapping(bytes32 => bytes32) idToName; //N*32 bytes
        //Total: 128+N*160 Bytes
    }

    // mapping(uint256 => Domain) private s_pendingChanges;
    mapping(uint256 => DomainNameService) private s_domains;
    mapping(bytes32 => uint256) private s_domainNameToIndex; //helper to get domain index by name
    // mapping(address => mapping(uint256 => bytes32)) s_addressToDomainNames; //N*DN*32 bytes
    // mapping(address => uint256) s_numDomainsOfAddress; // N * 32 bytes

    string private s_version;
    uint256 private s_numDomains;

    constructor(
        address owner,
        string memory name_,
        string memory version_
    ) EIP712(name_, version_) {
        s_version = version_;
        transferOwnership(owner);
    }

    function _hash(bytes32 value) private view returns (bytes32) {
        return keccak256(abi.encodePacked(value));
    }

    function _hash(string memory value) private view returns (bytes32) {
        return keccak256(abi.encodePacked(value));
    }

    function _getDomainStorage(string memory domainName) private view returns (DomainNameService storage) {
        return s_domains[s_domainNameToIndex[_hash(domainName)]];
    }

    function _bytes32ToString(bytes32 value) private view returns (string memory) {
        return string(abi.encodePacked(value));
    }

    function _resolveRecord(NameQueryBytes32 memory query)
        private
        view
        returns (
            bool,
            address,
            bytes32,
            bytes32,
            uint96
        )
    {
        if ((query.userAddress == address(0)) && (bytes32(query.id).length == 0) && (bytes32(query.name).length == 0)) {
            return (false, address(0), 0, 0, 0);
        }

        DomainNameService storage _domain = s_domains[s_domainNameToIndex[_hash(query.domainName)]];
        DomainNameService storage _targetDomain = s_domains[
            s_domainNameToIndex[_hash(bytes(query.targetDomain).length == 0 ? query.domainName : query.targetDomain)]
        ];

        address resolvedAddress;
        bytes32 resolvedId;
        bytes32 resolvedUsername;
        uint96 resolvedNonce;

        {
            if (query.userAddress != address(0)) {
                //Resolve by address is first priority
                resolvedAddress = query.userAddress;
                (resolvedId, resolvedUsername, resolvedNonce) = _resolveFromAddress(resolvedAddress, _targetDomain);
            } else if (bytes32(query.id).length != 0) {
                //Resolve by Id is second priority
                resolvedAddress = _domain.idToAddress[_hash(query.id)];
            } else if (bytes32(query.name).length != 0) {
                bytes32 _id = _domain.nameToId[_hash(query.name)];
                resolvedAddress = _domain.idToAddress[_hash(_id)];
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
        string memory domainName,
        uint256 referrerReward,
        uint256 referralDiscount
    ) public override onlyOwner {
        require(
            bytes(domainName).length <= 32,
            "Multipass->initializeDomain: Domain name must be 32 bytes or less long"
        );
        require(registrar != address(0), "Multipass->initializeDomain: You must provide a registrar address");
        require(bytes(domainName).length != 0, "Multipass->initializeDomain: Domain name cannot be empty");
        require(
            s_domainNameToIndex[_hash(domainName)] == 0,
            "Multipass->initializeDomain: Domain name already indexed"
        );
        (bool status, uint256 result) = SafeMath.tryAdd(referrerReward, referralDiscount);
        require(status == true, "Multipass->initializeDomain: referrerReward + referralDiscount cause overflow");
        require(result <= fee, "Multipass->initializeDomain: referral values are higher then fee itself");

        uint256 domainIndex = s_numDomains + 1;
        DomainNameService storage _domain = s_domains[domainIndex];
        _domain.properties.registrar = registrar;
        _domain.properties.freeRegistrationsNumber = freeRegistrationsNumber;
        _domain.properties.fee = fee;
        _domain.properties.name = stringToBytes32(domainName);
        _domain.properties.referrerReward = referrerReward;
        _domain.properties.referralDiscount = referralDiscount;
        s_numDomains++;
        s_domainNameToIndex[_hash(domainName)] = s_numDomains;

        emit InitializedDomain(domainIndex, domainName);
    }

    function resolveRecord(
        // string memory domainName,
        // address userAddress,
        // string memory id,
        // string memory username,
        // string memory targetDomain
        NameQuery memory query
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
        NameQueryBytes32 memory query32b;
        query32b.name = stringToBytes32(query.name);
        query32b.id = stringToBytes32(query.id);
        query32b.domainName = query.domainName;
        query32b.targetDomain = query.targetDomain;
        query32b.userAddress = query.userAddress;
        {
            // NameQuery32Bytes memory query32b;
            // query32b.
            (
                bool status,
                address resolvedAddress,
                bytes32 resolvedId,
                bytes32 resolvedUsername,
                uint96 resolvedNonce
            ) = _resolveRecord(query32b);

            return (status, resolvedAddress, resolvedId, resolvedUsername, resolvedNonce);
        }
    }

    function resolveRecordToString(NameQuery memory query)
        public
        view
        override
        returns (
            bool,
            address,
            string memory,
            string memory,
            uint96
        )
    {
        (
            bool status,
            address resolvedAddress,
            bytes32 resolvedId,
            bytes32 resolvedUsername,
            uint96 resolvedNonce
        ) = resolveRecord(query);

        return (
            status,
            resolvedAddress,
            _bytes32ToString(resolvedId),
            _bytes32ToString(resolvedUsername),
            resolvedNonce
        );
    }

    function activateDomain(string memory domainName) public override onlyOwner {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        _domain.properties.isActive = true;
    }

    function deactivateDomain(string memory domainName) public override onlyOwner {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        _domain.properties.isActive = false;
    }

    function changeFee(string memory domainName, uint256 fee) public override onlyOwner {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        uint256 _referrerReward = _domain.properties.referrerReward;
        uint256 _referralDiscount = _domain.properties.referralDiscount;
        require(
            _referralDiscount + _referrerReward <= fee,
            "Multipass->changeFee: referral rewards would become too high"
        );
        _domain.properties.fee = fee;
    }

    function changeRegistrar(string memory domainName, address newRegistrar) public override onlyOwner {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        require(newRegistrar != address(0), "new registrar cannot be zero");
        _domain.properties.registrar = newRegistrar;
    }

    function deleteName(
        NameQuery memory query // string memory domainName, // address userAddress, // string memory username, // string memory id
    ) public override {
        DomainNameService storage _domain = _getDomainStorage(query.domainName);
        require(
            (msg.sender == Ownable.owner()) || (msg.sender == _domain.properties.registrar),
            "Multipass->deleteName: Only registrar or owner can call this"
        );
        query.targetDomain = "";
        (bool status, address resolvedAddress, bytes32 resolvedId, bytes32 resolvedUsername, ) = resolveRecord(query);
        require(status == true, "Multipass->deleteName: name not resolved");
        _domain.addressToId[resolvedAddress] = bytes32(0);
        _domain.idToAddress[resolvedId] = address(0);
        _domain.idToName[resolvedId] = bytes32(0);
        _domain.nameToId[resolvedUsername] = bytes32(0);
        _domain.nonce[resolvedId] += 1;
        _domain.properties.registerSize--;
    }

    function changeReferralProgram(
        uint256 referrerReward,
        uint256 referralDiscount,
        string memory domainName
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

    bytes32 private constant _TYPEHASH =
        keccak256("registerName(string name,string id,string domainName,uint256 deadline,uint96 nonce)");

    // struct registrarMessageStruct {
    //     string name,
    //     string id,
    //     string domainName,
    //     string deadline,
    // }

    // function test(registrarMessageStruct calldata message, bytes calldata signature) public view {
    //     // bytes memory registrarMessage = abi.encodePacked(_TYPEHASH, message.lol);
    //     bytes32 typedHash = _hashTypedDataV4(keccak256(abi.encode(_TYPEHASH, message.lol)));
    //     console.log("recovered %s and registrar is %s", typedHash.recover(signature), msg.sender);
    //     // require(signer == msg.sender, "Multipass->register: Registrar signature is not valid");
    //     require(
    //         SignatureChecker.isValidSignatureNow(msg.sender, typedHash, signature),
    //         "Multipass->register: Registrar signature is not valid"
    //     );
    // }

    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        require(bytes(source).length <= 32, "stringToBytes32->String longer than 32 bytes");
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    function _validateRegistration(
        string memory domainName,
        string memory name,
        string memory id,
        address applicantAddress,
        bytes memory registrarSignature,
        uint256 signatureDeadline,
        address referrer,
        bytes32 referrerDomainName,
        bytes memory applicantSignature,
        bytes memory referrerSignature
    ) private view {
        // console.log(bytes(name).length);
        require(bytes(name).length <= 32, "too long");
        // bytes32 _domainName = stringToBytes32(domainName);
        DomainNameService storage _domain = _getDomainStorage(domainName);
        require(_domain.properties.isActive, "Multipass->register: domain is not active");
        // require(name != bytes32(0), "Multipass->register: Name cannot be empty");
        // require(id != bytes32(0), "Multipass->register: Id cannot be empty");
        // require(applicantAddress != address(0), "Multipass->register: User address cannot be empty");
        require(
            signatureDeadline > block.number,
            "Multipass->register: Signature deadline must be greater than current block number"
        );
        // require(referrer != applicantAddress, "Multipass->register: Cannot refer yourself");
        {
            // bytes memory registrarMessage = abi.encodePacked(domainName, id, name, signatureDeadline);
            bytes memory registrarMessage = abi.encode(
                _TYPEHASH,
                keccak256(abi.encodePacked(name)),
                keccak256(abi.encodePacked(id)),
                keccak256(abi.encodePacked(domainName)),
                signatureDeadline,
                0
            );

            require(
                _isValidSignature(registrarMessage, registrarSignature, _domain.properties.registrar) &&
                    (signatureDeadline > block.number),
                "Multipass->register: Registrar signature is not valid"
            );
        }
        // {
        //     bytes memory applicantMessage = abi.encodePacked(domainName, applicantAddress, id, name);
        //     require((signatureDeadline > block.number), "Multipass->register: Deadline timeout");
        //     require(
        //         _isValidSignature(applicantMessage, applicantSignature, applicantAddress) == true,
        //         "Multipass->register: Applicant signature is not valid"
        //     );
        // }
        // {
        //     (bool status, , , , ) = resolveRecord(domainName, applicantAddress, id, name, bytes32(0));
        //     require(!status, "Multipass->register: applicant is already registered, use modify instread");
        // }
        // if (referrer != address(0)) {
        //     {
        //         bytes32 _refDomain = referrerDomainName != bytes32(0) ? referrerDomainName : domainName;
        //         require(
        //             _isValidSignature(abi.encodePacked(_refDomain, referrer), referrerSignature, referrer) &&
        //                 (signatureDeadline > block.number),
        //             "Multipass->register: Referrer signature is not valid"
        //         );
        //         (bool referrerResolved, , , , ) = resolveRecord(_refDomain, applicantAddress, id, name, bytes32(0));
        //         require(referrerResolved == true, "Multipass->register: Referrer not found");
        //     }
        // }

        // require(msg.value >= _domain.properties.fee, "Multipass->register: Payment is not enough");
    }

    function register(
        string memory domainName,
        string memory name,
        string memory id,
        address applicantAddress,
        bytes memory registrarSignature,
        uint256 signatureDeadline,
        address referrer,
        bytes32 referrerDomainName,
        bytes memory applicantSignature,
        bytes memory referrerSignature
    ) external payable override nonReentrant {
        // bytes32 _domainName = stringToBytes32(domainName);
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
        // address payable owner = payable(owner());
        // {
        //     uint256 referrersShare = _domain.properties.referrerReward;
        //     uint256 valueToPay = SafeMath.sub(_domain.properties.fee, _domain.properties.referralDiscount);
        //     uint256 valueToOwner = SafeMath.sub(msg.value, referrersShare);

        //     require(msg.value >= valueToPay, "Multipass->register: Payment value is not enough");
        //     require(owner.send(valueToOwner), "Multipass->register: Failed to pay fee");
        //     require(payable(referrer).send(referrersShare), "Multipass->register: Failed to send referral reward");
        // }
        // _setRecord(_domain, applicantAddress, id, name);
    }

    function _isValidSignature(
        bytes memory message,
        bytes memory signature,
        address account
    ) internal view returns (bool) {
        bytes32 typedHash = _hashTypedDataV4(keccak256(message));
        // console.log("account %s, and recovered is %s", account, typedHash);
        // return account == typedHash ? true : false;

        return SignatureChecker.isValidSignatureNow(account, typedHash, signature);
    }

    function modifyUserName(
        string memory domainName,
        string memory id,
        string memory newName,
        uint96 nonce,
        bytes memory registrarSignature,
        uint256 signatureDeadline
    ) public payable override {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        require(_domain.properties.isActive, "Multipass->modifyUserName: domain is not active");
        require(bytes(newName).length != 0, "Multipass->modifyUserName: Name cannot be empty");
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
        require(_domain.nonce[_hash(id)] == nonce, "Multipass->modifyUserName: invalid nonce");
        require(
            _domain.nameToId[_hash(newName)] == bytes32(0),
            "OveMultipass->modifyUserName: new name already exists"
        );

        _domain.nonce[_hash(id)] += 1;
        _domain.nameToId[_hash(newName)] = stringToBytes32(id);
        _domain.idToName[_hash(id)] = stringToBytes32(newName);
        _domain.nameToId[_domain.idToName[_hash(id)]] = bytes32(0);
    }

    function getBalance() external view override returns (uint256) {
        return address(this).balance;
    }

    function getDomainState(string memory domainName) external view override returns (Domain memory) {
        DomainNameService storage _domain = _getDomainStorage(domainName);
        return _domain.properties;
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
        return s_version;
    }

    function withrawFunds() external override onlyOwner {
        address _owner = owner();
        payable(_owner).transfer(address(this).balance);
    }
}
