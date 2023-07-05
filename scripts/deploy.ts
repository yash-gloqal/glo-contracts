import { ethers, upgrades } from 'hardhat';

const ARTIST_ROYALTY = 10 * 100;
const PLATFORM_ROYALTY = 8 * 100;
const TOKEN_URI = "gs://gloqal-auth.appspot.com/NFTs/";

// OG address on Sepolia - 0xC7D3bd1819538aD520e07F57Fd47507B47E48C16
const contractAddress = "0x4ddc86210d423eb8936417f9c91a2d751df686e7"

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);


  if (!contractAddress) {
    const GloContract = await ethers.getContractFactory("Glo_NFT") as any;
    const gloContract = await upgrades.deployProxy(GloContract, [TOKEN_URI, ARTIST_ROYALTY, PLATFORM_ROYALTY], { initializer: 'initialize' });

    console.log("gloContract deployed to:", gloContract.address);

    await gloContract.deployed();
  } else {
    const UpgradedGloContract = await ethers.getContractFactory("Glo_NFT");
    const upgradedGloContract = await upgrades.upgradeProxy(contractAddress, UpgradedGloContract as any);

    console.log("Contract upgraded. New implementation deployed at:", upgradedGloContract.address);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
