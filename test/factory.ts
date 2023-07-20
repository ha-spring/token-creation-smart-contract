const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC20TokenFactory", function () {
  let factory;
  let owner;
  let user1;
  let user2;
  let ERC20TokenFactory;
  let ERC20Token;

  // Deploy the contracts before each test
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy ERC20TokenFactory
    ERC20TokenFactory = await ethers.getContractFactory("ERC20TokenFactory");
    factory = await ERC20TokenFactory.deploy(ethers.parseEther("0.1")); // Pass the creation fee (0.1 Ether) during deployment

    // Deploy ERC20Token (For testing purposes, you can use the ERC20Token contract provided in your original code)
    ERC20Token = await ethers.getContractFactory("ERC20Token");
  });

  it("should deploy ERC20 token with the correct attributes", async function () {
    const name = "Test Token";
    const symbol = "TT";
    const initialSupply = ethers.parseEther("1000");

    // Create ERC20 token through the factory
    await factory
      .connect(user1)
      .createERC20Token(name, symbol, initialSupply, true, true, true, {
        value: ethers.parseEther("0.1"),
      });

    // Get the created token address from the factory event
    const [tokenAddress] = await factory.queryFilter("TokenCreated");

    // Get the ERC20 token contract instance
    const token = await ethers.getContractAt(
      "ERC20Token",
      tokenAddress.args[0],
    );

    // Check token attributes
    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await token.totalSupply()).to.equal(initialSupply);
  });

  it("should not create ERC20 token with insufficient fee", async function () {
    const name = "Test Token";
    const symbol = "TT";
    const initialSupply = ethers.parseEther("1000");

    // User1 tries to create ERC20 token with insufficient fee
    await expect(
      factory
        .connect(user1)
        .createERC20Token(name, symbol, initialSupply, true, true, true),
    ).to.be.revertedWith("Insufficient fee");
  });

  it("should allow the owner to change the creation fee", async function () {
    const newFee = ethers.parseEther("0.2");

    // Owner changes the creation fee
    await factory.connect(owner).setCreationFee(newFee);

    // Check the updated fee
    expect(await factory.getCreationFee()).to.equal(newFee);
  });
});
