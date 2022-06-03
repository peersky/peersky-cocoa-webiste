// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./diamond/draft-EIP712Diamond.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IMultipass.sol";
import "./libraries/LibMultipass.sol";
import "./diamond/OnlyOwnerDiamond.sol";
import "hardhat/console.sol";

contract Multipass is EIP712, IMultipass {
    using ECDSA for bytes32;
    using LibMultipass for bytes32;

    // using LibMultipass for LibMultipass.Record;
    using LibMultipass for LibMultipass.Record;
    using LibMultipass for bytes;

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
        // require(query.name._checkStringFits32b(), "_validateNameQuery-> Name must be no more than 32 bytes long");
        // require(LibMultipass._checkStringFits32b(query.id), "_validateNameQuery-> id must be no more than 32 bytes long");
        // require(
        //     LibMultipass._checkStringFits32b(query.domainName),
        //     "_validateNameQuery-> domainName must be no more than 32 bytes long"
        // );
        require(LibMultipass._checkNotEmpty(query.id), "_validateNameQuery-> id cannot be empty");
        require(
            LibMultipass._checkNotEmpty(query.domainName),
            "_validateNameQuery-> LibMultipass.Domain cannot be empty"
        );
        require(
            query.targetDomain == bytes32(0),
            "_validateNameQuery-> When regestring new Domain targetDomain cannot be set"
        );

        //Check LibMultipass.Domain is legit
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(query.domainName);
        require(_domain.properties.isActive, "Multipass->register: domain is not active");

        //check signatures and time
        require(signatureDeadline > block.number, "Multipass->register: Deadline is less than current block number");

        {
            // bytes memory registrarMessage = abi.encode(
            //     LibMultipass._TYPEHASH,
            //     keccak256(abi.encode(query.name)),
            //     keccak256(abi.encode(query.id)),
            //     keccak256(abi.encode(query.domainName)),
            //     signatureDeadline,
            //     0
            // );

            bytes memory registrarMessage = abi.encode(
                LibMultipass._TYPEHASH,
                query.name,
                query.id,
                query.domainName,
                signatureDeadline,
                0
            );

            // bytes memory testMessage = abi.encode()

            require(
                _isValidSignature(registrarMessage, registrarSignature, _domain.properties.registrar) &&
                    (signatureDeadline > block.number),
                "Multipass->register: Registrar signature is not valid"
            );
        }
        {
            (bool status, ) = resolveRecord(query);
            require(status == false, "Multipass->register: applicant is already registered, use modify instread");
        }
        {
            (bool status, ) = resolveRecord(referrer);
            if (status) {
                {
                    bytes32 _refDomain = referrer.domainName.length != 0 ? referrer.domainName : query.domainName;
                    require(
                        _isValidSignature(
                            abi.encodePacked(_refDomain, referrer.userAddress),
                            referrerSignature,
                            referrer.userAddress
                        ) && (signatureDeadline > block.number),
                        "Multipass->register: Referrer signature is not valid"
                    );
                    (bool referrerResolved, ) = resolveRecord(query);
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
        bytes32 domainName,
        uint256 referrerReward,
        uint256 referralDiscount
    ) public override onlyOwner {
        LibMultipass.MultipassStorageStruct storage ms = LibMultipass.MultipassStorage();
        // require(
        //     LibMultipass._checkStringFits32b(domainName),
        //     "Multipass->initializeDomain: Domain name must be 32 bytes or less long"
        // );
        require(registrar != address(0), "Multipass->initializeDomain: You must provide a registrar address");
        require(LibMultipass._checkNotEmpty(domainName), "Multipass->initializeDomain: Domain name cannot be empty");
        require(ms.s_domainNameToIndex[domainName] == 0, "Multipass->initializeDomain: Domain name already exists");
        (bool status, uint256 result) = SafeMath.tryAdd(referrerReward, referralDiscount);
        require(status == true, "Multipass->initializeDomain: referrerReward + referralDiscount cause overflow");
        require(result <= fee, "Multipass->initializeDomain: referral values are higher then fee itself");

        uint256 domainIndex = ms.s_numDomains + 1;
        LibMultipass.DomainNameService storage _domain = ms.s_domains[domainIndex];
        _domain.properties.registrar = registrar;
        _domain.properties.freeRegistrationsNumber = freeRegistrationsNumber;
        _domain.properties.fee = fee;
        _domain.properties.name = domainName;
        _domain.properties.referrerReward = referrerReward;
        _domain.properties.referralDiscount = referralDiscount;
        ms.s_numDomains++;
        ms.s_domainNameToIndex[domainName] = ms.s_numDomains;

        emit InitializedDomain(domainIndex, domainName);
    }

    // function resolveRecordToString(LibMultipass.NameQuery memory query) public view override returns (bool, LibMultipass.Record memory) {
    //     (bool success, LibMultipass.Record memory r) = resolveRecord(query);
    //     return ( success, r._RecordStringify());
    // }

    function _enforseDomainNameIsValid(bytes32 domainName) private pure {
        require(domainName._checkNotEmpty(), "activateDomain->Please specify LibMultipass.Domain name");
        // require(domainName._checkStringFits32b(), "activateDomain->Specified LibMultipass.Domain name is invalid");
    }

    function activateDomain(bytes32 domainName) public override onlyOwner {
        _enforseDomainNameIsValid(domainName);
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(domainName);
        _domain.properties.isActive = true;
    }

    function deactivateDomain(bytes32 domainName) public override onlyOwner {
        _enforseDomainNameIsValid(domainName);
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(domainName);
        _domain.properties.isActive = false;
    }

    function changeFee(bytes32 domainName, uint256 fee) public override onlyOwner {
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

    function changeRegistrar(bytes32 domainName, address newRegistrar) public override onlyOwner {
        _enforseDomainNameIsValid(domainName);
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(domainName);
        require(newRegistrar != address(0), "new registrar cannot be zero");
        _domain.properties.registrar = newRegistrar;
    }

    function deleteName(
        LibMultipass.NameQuery memory query // bytes32 domainName, // address userAddress, // bytes32 username, // bytes32 id
    ) public override onlyOwner {
        _enforseDomainNameIsValid(query.domainName);
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(query.domainName);
        query.targetDomain = "";
        (bool status, LibMultipass.Record memory r) = resolveRecord(query);
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
        bytes32 domainName
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
    function resolveRecord(LibMultipass.NameQuery memory query)
        public
        view
        override
        returns (bool, LibMultipass.Record memory)
    {
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
        bytes32 domainName,
        bytes32 id,
        bytes32 newName,
        uint96 nonce,
        bytes memory registrarSignature,
        uint256 signatureDeadline
    ) public payable override {
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(domainName);
        require(_domain.properties.isActive, "Multipass->modifyUserName: LibMultipass.Domain is not active");
        require(newName.length != 0, "Multipass->modifyUserName: Name cannot be empty");
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

    function getDomainState(bytes32 domainName) external view override returns (LibMultipass.Domain memory) {
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(domainName);
        return _domain.properties;
    }

    function getDomainStateTest(bytes32 domainName) external view returns (bytes32) {
        LibMultipass.DomainNameService storage _domain = LibMultipass._getDomainStorage(domainName);
        return _domain.properties.name;
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
