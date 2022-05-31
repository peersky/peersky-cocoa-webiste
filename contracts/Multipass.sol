// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IMultipass.sol";
import "./libraries/LibMultipass.sol";
import "./diamond/OnlyOwnerDiamond.sol";

contract Multipass is  EIP712, IMultipass, OnlyOwnerDiamond {
    using ECDSA for bytes32;
    using LibMultipass for string;

    using LibMultipass for LibMultipass.RecordBytes32;
    using LibMultipass for LibMultipass.Record;
    using LibMultipass for bytes;

    constructor(
        string memory name_,
        string memory version_
    ) EIP712(name_, version_) {
        LibMultipass.MultipassStorage().s_version = version_;
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

  function _validateRegistration(
        LibMultipass.NameQuery memory query,
        bytes memory registrarSignature,
        uint256 signatureDeadline,
        LibMultipass.NameQuery memory referrer,
        bytes memory referrerSignature
    ) private view {
        //Check name query is legit
        require(query.name._checkStringFits32b(), "_validateNameQuery-> Name must be no more than 32 bytes long");
        require(LibMultipass._checkStringFits32b(query.id), "_validateNameQuery-> id must be no more than 32 bytes long");
        require(
            LibMultipass._checkStringFits32b(query.domainName),
            "_validateNameQuery-> domainName must be no more than 32 bytes long"
        );
        require(LibMultipass._checkStringNotEmpty(query.id), "_validateNameQuery-> id cannot be empty");
        require(LibMultipass._checkStringNotEmpty(query.domainName), "_validateNameQuery-> LibMultipass.Domain cannot be empty");
        require(
            !LibMultipass._checkStringNotEmpty(query.targetDomain),
            "_validateNameQuery-> When regestring new LibMultipass.Domain target LibMultipass.Domain cannot be set"
        );

        //Check LibMultipass.Domain is legit
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(query.domainName);
        require(_domain.properties.isActive, "Multipass->register: LibMultipass.Domain is not active");

        //check signatures and time
        require(signatureDeadline > block.number, "Multipass->register: Deadline is less than current block number");

        {
            bytes memory registrarMessage = abi.encode(
                LibMultipass._TYPEHASH,
                keccak256(abi.encodePacked(query.name)),
                keccak256(abi.encodePacked(query.id)),
                keccak256(abi.encodePacked(query.domainName)),
                signatureDeadline,
                0
            );

            require(
                _isValidSignature(registrarMessage, registrarSignature, _domain.properties.registrar) &&
                    (signatureDeadline > block.number),
                "Multipass->register: Registrar signature is not valid"
            );
        }
        {
            (bool status, ) = resolveRecord(query);
            require(!status, "Multipass->register: applicant is already registered, use modify instread");
        }
        {
            (bool status, ) = resolveRecord(referrer);
            if (status) {
                {
                    string memory _refDomain = bytes(referrer.domainName).length != 0 ? referrer.domainName : query.domainName;
                    require(
                        _isValidSignature(abi.encodePacked(_refDomain, referrer.userAddress), referrerSignature, referrer.userAddress) &&
                            (signatureDeadline > block.number),
                        "Multipass->register: Referrer signature is not valid"
                    );
                    (bool referrerResolved,  ) = resolveRecord(query);
                    require(referrerResolved == true, "Multipass->register: Referrer not found");
                }
            }
        }

        // require(msg.value >= _domain.properties.fee, "Multipass->register: Payment is not enough");
    }


    function initializeDomain(
        address registrar,
        uint256 freeRegistrationsNumber,
        uint256 fee,
        string memory domainName,
        uint256 referrerReward,
        uint256 referralDiscount
    ) public override onlyOwner {
        LibMultipass.MultipassStorageStruct storage ms = LibMultipass.MultipassStorage();
        require(
            LibMultipass._checkStringFits32b(domainName),
            "Multipass->initializeDomain: LibMultipass.Domain name must be 32 bytes or less long"
        );
        require(registrar != address(0), "Multipass->initializeDomain: You must provide a registrar address");
        require(LibMultipass._checkStringNotEmpty(domainName), "Multipass->initializeDomain: LibMultipass.Domain name cannot be empty");
        require(ms.s_domainNameToIndex[LibMultipass._hash(domainName)] == 0, "Multipass->initializeDomain: LibMultipass.Domain name already exists");
        (bool status, uint256 result) = SafeMath.tryAdd(referrerReward, referralDiscount);
        require(status == true, "Multipass->initializeDomain: referrerReward + referralDiscount cause overflow");
        require(result <= fee, "Multipass->initializeDomain: referral values are higher then fee itself");

        uint256 domainIndex = ms.s_numDomains + 1;
        LibMultipass.DomainNameService storage _domain = ms.s_domains[domainIndex];
        _domain.properties.registrar = registrar;
        _domain.properties.freeRegistrationsNumber = freeRegistrationsNumber;
        _domain.properties.fee = fee;
        _domain.properties.name = LibMultipass._stringToBytes32(domainName);
        _domain.properties.referrerReward = referrerReward;
        _domain.properties.referralDiscount = referralDiscount;
        ms.s_numDomains++;
        ms.s_domainNameToIndex[LibMultipass._hash(domainName)] = ms.s_numDomains;

        emit InitializedDomain(domainIndex, domainName);
    }

    function resolveRecordToString(LibMultipass.NameQuery memory query) public view override returns (bool, LibMultipass.Record memory) {
        (bool success, LibMultipass.RecordBytes32 memory r) = resolveRecord(query);
        return ( success, r._RecordStringify());
    }

    function _enforseDomainNameIsValid(string memory domainName) private pure {
        require(domainName._checkStringNotEmpty(), "activateDomain->Please specify LibMultipass.Domain name");
        require(domainName._checkStringFits32b(), "activateDomain->Specified LibMultipass.Domain name is invalid");
    }

    function activateDomain(string memory domainName) public override onlyOwner {
        _enforseDomainNameIsValid(domainName);
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(domainName);
        _domain.properties.isActive = true;
    }

    function deactivateDomain(string memory domainName) public override onlyOwner {
        _enforseDomainNameIsValid(domainName);
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(domainName);
        _domain.properties.isActive = false;
    }

    function changeFee(string memory domainName, uint256 fee) public override onlyOwner {
        _enforseDomainNameIsValid(domainName);
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(domainName);
        uint256 _referrerReward = _domain.properties.referrerReward;
        uint256 _referralDiscount = _domain.properties.referralDiscount;
        require(
            _referralDiscount + _referrerReward <= fee,
            "Multipass->changeFee: referral rewards would become too high"
        );
        _domain.properties.fee = fee;
    }

    function changeRegistrar(string memory domainName, address newRegistrar) public override onlyOwner {
        _enforseDomainNameIsValid(domainName);
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(domainName);
        require(newRegistrar != address(0), "new registrar cannot be zero");
        _domain.properties.registrar = newRegistrar;
    }

    function deleteName(
        LibMultipass.NameQuery memory query // string memory domainName, // address userAddress, // string memory username, // string memory id
    ) public override onlyOwner {
        _enforseDomainNameIsValid(query.domainName);
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(query.domainName);
        query.targetDomain = "";
        (bool status, LibMultipass.RecordBytes32 memory r ) = resolveRecord(query);
        require(status == true, "Multipass->deleteName: name not resolved");
        _domain.addressToId[r.wallet] = bytes32(0);
        _domain.idToAddress[r.id] = address(0);
        _domain.idToName[r.id] = bytes32(0);
        _domain.nameToId[r.name] = bytes32(0);
        _domain.nonce[r.id] += 1;
        _domain.properties.registerSize--;
    }

    function changeReferralProgram(
        uint256 referrerReward,
        uint256 referralDiscount,
        string memory domainName
    ) public override onlyOwner {
        _enforseDomainNameIsValid(domainName);
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(domainName);
        (bool status, uint256 result) = SafeMath.tryAdd(referrerReward, referralDiscount);
        require(status == true, "Multipass->changeReferralProgram: referrerReward + referralDiscount cause overflow");
        require(
            result <= _domain.properties.fee,
            "Multipass->changeReferralProgram: referral values are higher then the fee itself"
        );
        _domain.properties.referrerReward = referrerReward;
        _domain.properties.referralDiscount = referralDiscount;
    }

         /**
    @dev resolves LibMultipass.Record of name query in to status and identity */
    function resolveRecord(LibMultipass.NameQuery memory query) public view override returns (bool, LibMultipass.RecordBytes32 memory) {
        return LibMultipass.resolveRecord(query);
    }

    function register(
        LibMultipass.NameQuery memory query,
        bytes memory registrarSignature,
        uint256 signatureDeadline,
        LibMultipass.NameQuery memory referrer,
        bytes memory referrerSignature
    ) public payable override {
        // bytes32 _domainName = LibMultipass._stringToBytes32(domainName);
        // LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(query.domainName);
        _validateRegistration(query, registrarSignature, signatureDeadline, referrer, referrerSignature);
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

    function modifyUserName(
        string memory domainName,
        string memory id,
        string memory newName,
        uint96 nonce,
        bytes memory registrarSignature,
        uint256 signatureDeadline
    ) public payable override {
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(domainName);
        require(_domain.properties.isActive, "Multipass->modifyUserName: LibMultipass.Domain is not active");
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
        require(_domain.nonce[LibMultipass._hash(id)] == nonce, "Multipass->modifyUserName: invalid nonce");
        require(
            _domain.nameToId[LibMultipass._hash(newName)] == bytes32(0),
            "OveMultipass->modifyUserName: new name already exists"
        );

        _domain.nonce[LibMultipass._hash(id)] += 1;
        _domain.nameToId[LibMultipass._hash(newName)] = LibMultipass._stringToBytes32(id);
        _domain.idToName[LibMultipass._hash(id)] = LibMultipass._stringToBytes32(newName);
        _domain.nameToId[_domain.idToName[LibMultipass._hash(id)]] = bytes32(0);
    }

    function getBalance() external view override returns (uint256) {
        return address(this).balance;
    }

    function getDomainState(string memory domainName) external view override returns (LibMultipass.Domain memory) {
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(domainName);
        return _domain.properties;
    }

    function getContractState() external view override returns (uint256) {
        LibMultipass.MultipassStorageStruct storage ms = LibMultipass.MultipassStorage();
        return ms.s_numDomains;
    }

    /**
     * @dev See {IGovernor-version}.
     */
    function version() public view virtual override returns (string memory) {
         LibMultipass.MultipassStorageStruct storage ms = LibMultipass.MultipassStorage();
        return ms.s_version;
    }

    function withrawFunds(address to) public override onlyOwner {
        payable(to).transfer(address(this).balance);
    }
}
