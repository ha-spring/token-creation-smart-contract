import { ethers } from "hardhat";

async function main() {
  let fees = ethers.parseEther("0.0001");
  const factory = await ethers.deployContract("ERC20TokenFactory", [fees]);

  await factory.waitForDeployment();

  console.log(`ERC20TokenFactory deployed to ${factory.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
