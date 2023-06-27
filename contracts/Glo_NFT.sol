// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";

contract Glo_NFT is
    Initializable,
    ERC1155Upgradeable,
    ERC2981Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    uint256 private ids;
    uint256 private artistRoyalty;
    uint256 private platformRoyalty;
    mapping(uint256 => uint256) private maxSupply;
    mapping(uint256 => uint256) private currentSupply;
    mapping(uint256 => address) private nftCreator;
    mapping(uint256 => uint256) private nftPrice;
    mapping(address => uint256) private creatorRoyalty;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    modifier checkNFTPrice(uint256 _id, uint256 _amount) {
        uint256 price = nftPrice[_id];
        require(
            (price * _amount) >= msg.value,
            "Not enough value attached to buy the NFT."
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
        __UUPSUpgradeable_init();
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

    function initNFT(uint256 _maxSupply, uint256 _price) public {
        ids++;
        nftCreator[ids] = msg.sender;
        nftPrice[ids] = _price;
        maxSupply[ids] = _maxSupply;
    }

    function mint(
        uint256 _id,
        uint256 _amount
    ) public payable checkNFTPrice(_id, _amount) {
        _mint(msg.sender, _id, _amount, "");
        currentSupply[_id] += _amount;

        uint256 platformFee = (msg.value * platformRoyalty) / 10000;
        uint256 artistPayment = msg.value - platformFee;
        address creator = nftCreator[_id];
        creatorRoyalty[creator] = artistPayment;
    }

    function mintBatch(
        address to,
        uint256[] memory _ids,
        uint256[] memory _amounts,
        bytes memory data
    ) public onlyOwner {
        _mintBatch(to, _ids, _amounts, data);
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
}
