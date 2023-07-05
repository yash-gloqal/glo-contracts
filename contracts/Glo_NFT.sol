// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Glo_NFT is
    Initializable,
    ReentrancyGuardUpgradeable,
    ERC1155Upgradeable,
    ERC2981Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ERC1155URIStorageUpgradeable
{
    uint256 private ids;
    uint256 private artistRoyalty;
    uint256 private platformRoyalty;
    mapping(uint256 => uint256) private maxSupply;
    mapping(uint256 => uint256) private currentSupply;
    mapping(uint256 => address) private nftCreator;
    mapping(uint256 => uint256) private nftPrice;
    mapping(address => uint256) private creatorRoyalty;
    mapping(string => uint256) private idToNftId;

    using ECDSA for bytes32;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    modifier checkNFTPrice(string memory _firebaseId, uint256 _amount) {
        uint256 id = idToNftId[_firebaseId];
        uint256 price = nftPrice[id];
        require(
            (price * _amount) >= msg.value,
            "Not enough value attached to buy the NFT."
        );
        _;
    }

    modifier checkAlreadyInitialised(uint256 _id) {
        require(nftCreator[_id] != address(0), "NFT not initialised.");
        _;
    }

    modifier checkMaxSupply(uint256 _amount) {
        require(_amount != 0, "Max Supply should be more than 0.");
        _;
    }

    modifier checkInitPrice(uint256 _price) {
        require(_price != 0, "Price should be more than 0.");
        _;
    }

    modifier checkWithdrawBalance() {
        require(
            creatorRoyalty[msg.sender] > 0,
            "Not enough balance to withdraw."
        );
        _;
    }

    function initialize(
        string calldata _uri,
        uint256 _artistRoyalty,
        uint256 _platformRoyalty
    ) public initializer {
        ids = 0;
        artistRoyalty = _artistRoyalty;
        platformRoyalty = _platformRoyalty;
        __ERC1155_init(_uri);
        __Ownable_init();
        __ERC1155URIStorage_init();
        __UUPSUpgradeable_init();
    }

    function uri(
        uint256 tokenId
    )
        public
        view
        override(ERC1155Upgradeable, ERC1155URIStorageUpgradeable)
        returns (string memory)
    {
        return ERC1155URIStorageUpgradeable.uri(tokenId);
    }

    function getTotalIds() public view returns (uint256) {
        return ids;
    }

    function getMaxSupply(uint256 _id) public view returns (uint256) {
        return maxSupply[_id];
    }

    function getCurrentSupply(uint256 _id) public view returns (uint256) {
        return currentSupply[_id];
    }

    function getCreator(uint256 _id) public view returns (address) {
        return nftCreator[_id];
    }

    function getArtistRoyalty() public view returns (uint256) {
        return artistRoyalty;
    }

    function setArtistRoyalty(uint256 _artistRoyalty) public onlyOwner {
        artistRoyalty = _artistRoyalty;
    }

    function getPlatformRoyalty() public view returns (uint256) {
        return platformRoyalty;
    }

    function setPlatformRoyalty(uint256 _platformRoyalty) public onlyOwner {
        platformRoyalty = _platformRoyalty;
    }

    function getArtistBalance(address _address) public view returns (uint256) {
        return creatorRoyalty[_address];
    }

    function getContractBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function initNFT(
        uint256 _maxSupply,
        uint256 _price
    ) public checkMaxSupply(_maxSupply) checkInitPrice(_price) {
        ids++;
        nftCreator[ids] = msg.sender;
        nftPrice[ids] = _price;
        maxSupply[ids] = _maxSupply;
    }

    function mint(
        uint256 _id,
        uint256 _amount,
        string memory _uri,
        uint256 _maxSupply,
        uint256 _price,
        uint256 _timestamp,
        bytes memory _signature,
        string memory _firebaseId
    ) public payable checkNFTPrice(_firebaseId, _amount) checkAlreadyInitialised(_id) {
        uint256 id = idToNftId[_firebaseId];
        bool exists = maxSupply[id] != 0;
        uint256 platformFee = (msg.value * platformRoyalty) / 10000;
        uint256 artistPayment = msg.value - platformFee;
        if (exists) {
            _mint(msg.sender, _id, _amount, "");
            currentSupply[_id] += _amount;

            address creator = nftCreator[_id];
            creatorRoyalty[creator] = artistPayment;
        } else {
            ids++;
            idToNftId[_firebaseId] = id;
            address creator = verifySignature(_timestamp, _signature);
            nftCreator[ids] = creator;
            nftPrice[ids] = _price;
            maxSupply[ids] = _maxSupply;
            creatorRoyalty[creator] = artistPayment;
            _setURI(ids, _uri);
        }
    }

    function creatorWithdraw() public nonReentrant checkWithdrawBalance {
        (bool success, ) = msg.sender.call{value: creatorRoyalty[msg.sender]}(
            ""
        );
        require(success, "Transfer failed");
        creatorRoyalty[msg.sender] = 0;
    }

    function royaltyInfo(
        uint256 _id,
        uint256 value
    )
        public
        view
        override(ERC2981Upgradeable) 
        returns (address receiver, uint256 royaltyAmount)
    {
        receiver = nftCreator[_id];
        royaltyAmount = (value * artistRoyalty) / 10000;
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC1155Upgradeable, ERC2981Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
 
    function isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) internal pure returns (address isValid) {
        bytes32 signedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );
        return signedHash.recover(signature);
    }

    function verifySignature(
        uint256 timestamp,
        bytes memory signature
    ) public view returns (address) {
        bytes32 msgHash = keccak256(abi.encodePacked(msg.sender, timestamp));

        return isValidSignature(msgHash, signature);
    }
}
