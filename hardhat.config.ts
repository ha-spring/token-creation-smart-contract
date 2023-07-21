import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    networks: {
      mumbai: {
        url: "https://polygon-mumbai.g.alchemy.com/v2/0xz4yVzoZks5G-zvHN_fPW06x6ai7ayL",
        accounts: [""],
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Adjust the number of runs to optimize gas cost
      },
    },
  },
};

export default config;
