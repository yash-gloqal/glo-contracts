import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-watcher';

const config = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    sepolia: {
      url: "https://rpc.sepolia.org/",
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
