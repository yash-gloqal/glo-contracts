import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-watcher';

const config = {
  solidity: "0.8.18",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/demo",
      accounts: {
        mnemonic: "crowd panda trim jungle clinic barrel tilt room dirt apology cancel narrow",
      },
    },
  },
  watcher: {
    test: {
      tasks: ['test'],
      files: ['./test/**/*', "./contracts/**/*"],
      verbose: true,
      clearOnStart: true,
      start: 'echo Running my test task now..',
    }
  }
};

export default config;
