require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({ path: '../.env' });

module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.ALCHEMY_URL,
      accounts: process.env.METAMASK_PRIVATE_KEY ? [process.env.METAMASK_PRIVATE_KEY] : []
    }
  },
};
