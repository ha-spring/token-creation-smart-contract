import { ethers } from "hardhat";

async function main() {
  const [owner, feesReceiver] = await ethers.getSigners();

  let fees = ethers.parseEther("0.0001");
  const mint_factory = await ethers.deployContract(
    "MintableERC20TokenFactory",
    [fees, feesReceiver],
  );
  const other_factory = await ethers.deployContract("OtherERC20TokenFactory", [
    fees,
    feesReceiver,
  ]);

  await mint_factory.waitForDeployment();
  await other_factory.waitForDeployment();

  console.log(`MintableERC20TokenFactory deployed to ${mint_factory.target}`);
  console.log(`OtherERC20TokenFactory deployed to ${other_factory.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
