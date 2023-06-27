import { ethers, upgrades } from 'hardhat';

const ARTIST_ROYALTY = 10 * 100;
const PLATFORM_ROYALTY = 8 * 100;
const TOKEN_URI = "gs://gloqal-auth.appspot.com/NFTs/";

// OG address on Sepolia - 0xC7D3bd1819538aD520e07F57Fd47507B47E48C16

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);


  const GloContract = await ethers.getContractFactory("Glo_NFT") as any;
  const gloContract = await upgrades.deployProxy(GloContract, [TOKEN_URI, ARTIST_ROYALTY, PLATFORM_ROYALTY], { initializer: 'initialize' });

  await gloContract.deployed();

  console.log("gloContract deployed to:", gloContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
