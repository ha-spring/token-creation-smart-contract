import { ethers } from "hardhat";

async function main() {
  let fees = ethers.parseEther("0.0001");
  const factory = await ethers.deployContract("ERC20TokenFactory", [fees]);

  await factory.waitForDeployment();

  console.log(`ERC20TokenFactory deployed to ${factory.target}`);

  const name = "MyToken";
  const symbol = "MTK";
  const initialSupply = ethers.parseEther("1000");

  const tx = await factory.createERC20Token(
    name,
    symbol,
    initialSupply,
    false,
    false,
    false,
    { value: fees },
  );
  const receipt = await tx.wait();
  console.log(receipt);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
