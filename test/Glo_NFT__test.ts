import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Glo_NFT } from "../typechain-types";

const TOKEN_SYMBOL = "GLO";
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
        gloContract = await upgrades.deployProxy(GloContract, [TOKEN_SYMBOL], { initializer: 'initialize' }) as any;
        // @ts-ignore
        await gloContract.deployed();
    })

    describe("Deployment", function () {
        it("should set the right owner", async function () {
            const _owner = await gloContract.owner()
            expect(_owner).to.be.equal(owner.address)
        });
    });

    describe("URI", function () {
        it("should set the URI", async function () {
            await gloContract.setURI(TOKEN_URI)
            const _uri = await gloContract.uri([0])
            expect(_uri).to.be.equal(TOKEN_URI)
        });
    });
});
