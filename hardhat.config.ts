import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    networks: {
      mumbai: {
        url: "https://polygon-mumbai.g.alchemy.com/v2/0xz4yVzoZks5G-zvHN_fPW06x6ai7ayL",
        accounts: ["7152e1cb1ff3e14f7b41169c9d69a2f8ed6cd7bad9603dc238bdce89da0b91d4"],
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
