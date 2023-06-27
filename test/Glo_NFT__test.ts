import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Glo_NFT } from "../typechain-types";

const ARTIST_ROYALTY = 10 * 100;
const PLATFORM_ROYALTY = 8 * 100;
const ID_1 = 1;
const NFT_AMOUNT_1 = 1;
const TOKEN_SYMBOL = "GLO";
const TOTAL_SUPPLY = 100;
const NFT_PRICE_1 = ethers.utils.parseUnits('0.001', "ether");
const TOKEN_URI = "http://gloqal.aws.com";


describe("Glo_NFT", function () {

    let gloContract: Glo_NFT;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;
    let addr2: HardhatEthersSigner;

    this.beforeEach(async () => {
        const GloContract = await ethers.getContractFactory('Glo_NFT');
        [owner, addr1, addr2] = await ethers.getSigners();

        // @ts-ignore
        gloContract = await upgrades.deployProxy(GloContract, [TOKEN_URI, ARTIST_ROYALTY, PLATFORM_ROYALTY], { initializer: 'initialize' }) as any;
        // @ts-ignore
        await gloContract.deployed();
    })

    describe.skip("Deployment", function () {
        it("should set the right owner", async function () {
            const _owner = await gloContract.owner()
            const _artistroyalty = await gloContract.getArtistRoyalty()
            const _platformroyalty = await gloContract.getPlatformRoyalty()

            expect(_owner).to.be.equal(owner.address)
            expect(_artistroyalty).to.be.equal(ARTIST_ROYALTY)
            expect(_platformroyalty).to.be.equal(PLATFORM_ROYALTY)
        });
    });

    describe.skip("URI", function () {
        it("should set the URI", async function () {
            await gloContract.setURI(TOKEN_URI)
            const _uri = await gloContract.uri([0])
            expect(_uri).to.be.equal(TOKEN_URI)
        });
    });

    describe.skip("Init an NFT", function () {
        it("should init an NFT", async function () {
            await gloContract.initNFT(TOTAL_SUPPLY, NFT_PRICE_1);
            const _ids = await gloContract.getTotalIds();
            const _creator = await gloContract.getCreator(_ids);
            const _currSupp = await gloContract.getCurrentSupply(_ids);
            const _maxSupp = await gloContract.getMaxSupply(_ids);

            expect(_ids).to.be.equal(ID_1)
            expect(_creator).to.be.equal(owner.address)
            expect(_maxSupp).to.be.equal(TOTAL_SUPPLY)
            expect(_currSupp).to.be.equal(0)
        });
    });

    describe("Mint an NFT", function () {
        it("should mint an NFT", async function () {
            await gloContract.initNFT(TOTAL_SUPPLY, NFT_PRICE_1);
            await gloContract.mint(ID_1, NFT_AMOUNT_1, {
                value: NFT_PRICE_1
            });
            const { artistBalance } = calculatePayment(NFT_PRICE_1.toNumber())

            const _currSupp = await gloContract.getCurrentSupply(ID_1);
            const _artistBalance = await gloContract.getArtistBalance(owner.address);

            expect(_currSupp).to.be.equal(1)
            expect(artistBalance).to.be.equal(_artistBalance)
        });
    });

    describe("Transfer an NFT", function () {
        it("should transfer an NFT", async function () {
            await gloContract.initNFT(TOTAL_SUPPLY, NFT_PRICE_1);
            await gloContract.mint(ID_1, NFT_AMOUNT_1, {
                value: NFT_PRICE_1
            });
            const { artistBalance } = calculatePayment(NFT_PRICE_1.toNumber())

            const _currSupp = await gloContract.getCurrentSupply(ID_1);
            const _artistBalance = await gloContract.getArtistBalance(owner.address);

            expect(_currSupp).to.be.equal(1)
            expect(artistBalance).to.be.equal(_artistBalance)
        });
    });
});

const calculatePayment = (amount: number): { artistBalance: number, platformBalance: number } => {
    const platformBalance = ((amount * PLATFORM_ROYALTY) / 10000);
    const artistBalance = amount - platformBalance;
    return { artistBalance, platformBalance }
}
