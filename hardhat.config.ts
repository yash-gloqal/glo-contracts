import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-watcher';

const config = {
  solidity: "0.8.18",
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
