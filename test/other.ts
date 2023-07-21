const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OtherERC20TokenFactory", function () {
  let OtherERC20TokenFactory;
  let factory;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let feesReceiver;
  let newFeesReceiver;
  let ERC20Token;
  let BurnableERC20Token;
  let PausableERC20Token;
  let BurnablePausableERC20Token;
  let fees = ethers.parseEther("0.01");

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, feesReceiver, newFeesReceiver] =
      await ethers.getSigners();

    OtherERC20TokenFactory = await ethers.getContractFactory(
      "OtherERC20TokenFactory",
    );
    factory = await OtherERC20TokenFactory.deploy(fees, feesReceiver);

    ERC20Token = await ethers.getContractFactory("ERC20Token");
    BurnableERC20Token = await ethers.getContractFactory("BurnableERC20Token");
    PausableERC20Token = await ethers.getContractFactory("PausableERC20Token");
    BurnablePausableERC20Token = await ethers.getContractFactory(
      "BurnablePausableERC20Token",
    );
  });

  it("Should create a ERC20 token", async function () {
    const name = "MyToken";
    const symbol = "MT";
    const initialSupply = ethers.parseEther("2000");

    const tx = await factory.createERC20Token(
      name,
      symbol,
      initialSupply,
      false,
      false,
      { value: fees },
    );
    const receipt = await tx.wait();
    const TokenCreatedLog = receipt.logs.filter(
      (log) => log?.fragment?.name === "TokenCreated",
    );
    const tokenAddress = TokenCreatedLog[0].args[0];
    const token = await ERC20Token.attach(tokenAddress);
    const ownerBalance = await token.balanceOf(owner.address);

    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await ownerBalance).to.equal(ethers.parseEther("2000"));
    expect(await ethers.provider.getBalance(feesReceiver.address)).to.equal(
      "10000010000000000000000",
    );
  });

  it("Should create a burnable ERC20 token", async function () {
    const name = "MyBurnableToken";
    const symbol = "MBT";
    const initialSupply = ethers.parseEther("5000");

    const tx = await factory.createERC20Token(
      name,
      symbol,
      initialSupply,
      true,
      false,
      { value: fees },
    );
    const receipt = await tx.wait();
    const TokenCreatedLog = receipt.logs.filter(
      (log) => log?.fragment?.name === "TokenCreated",
    );
    const tokenAddress = TokenCreatedLog[0].args[0];
    const token = await BurnableERC20Token.attach(tokenAddress);
    const ownerBalance = await token.balanceOf(owner.address);

    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await ownerBalance).to.equal(ethers.parseEther("5000"));

    await token.burn(ethers.parseEther("3000"));
    const ownerBalanceAfterBurn = await token.balanceOf(owner.address);
    expect(await ownerBalanceAfterBurn).to.equal(ethers.parseEther("2000"));
    expect(await ethers.provider.getBalance(feesReceiver.address)).to.equal(
      "10000020000000000000000",
    );
  });

  it("Should create a pausable ERC20 token", async function () {
    const name = "MyPausableToken";
    const symbol = "MPT";
    const initialSupply = ethers.parseEther("6000");

    const tx = await factory
      .connect(addr1)
      .createERC20Token(name, symbol, initialSupply, false, true, {
        value: fees,
      });
    const receipt = await tx.wait();
    const TokenCreatedLog = receipt.logs.filter(
      (log) => log?.fragment?.name === "TokenCreated",
    );
    const tokenAddress = TokenCreatedLog[0].args[0];
    const token = await PausableERC20Token.attach(tokenAddress);
    const ownerBalance = await token.balanceOf(addr1.address);

    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await ownerBalance).to.equal(ethers.parseEther("6000"));

    await token.connect(addr1).pause();
    await expect(
      token.connect(addr1).transfer(owner.address, ethers.parseEther("1000")),
    ).to.be.revertedWith("Pausable: paused");
    await token.connect(addr1).unpause();
    await token
      .connect(addr1)
      .transfer(owner.address, ethers.parseEther("1200"));
    const ownerBalanceAfterPause = await token.balanceOf(addr1.address);
    expect(await ownerBalanceAfterPause).to.equal(ethers.parseEther("4800"));
    expect(await ethers.provider.getBalance(feesReceiver.address)).to.equal(
      "10000030000000000000000",
    );
  });

  it("Should create a burnable and pausable ERC20 token", async function () {
    const name = "MyAllFeaturesToken";
    const symbol = "MAT";
    const initialSupply = ethers.parseEther("8000");

    const tx = await factory.createERC20Token(
      name,
      symbol,
      initialSupply,
      true,
      true,
      { value: fees },
    );
    const receipt = await tx.wait();
    const TokenCreatedLog = receipt.logs.filter(
      (log) => log?.fragment?.name === "TokenCreated",
    );
    const tokenAddress = TokenCreatedLog[0].args[0];
    const token = await BurnablePausableERC20Token.attach(tokenAddress);
    const ownerBalance = await token.balanceOf(owner.address);

    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await ownerBalance).to.equal(ethers.parseEther("8000"));

    await token.pause();
    await expect(token.burn(ethers.parseEther("1000"))).to.be.revertedWith(
      "Pausable: paused",
    );
    await token.unpause();

    await token.burn(ethers.parseEther("3000"));
    const ownerBalanceAfterBurn = await token.balanceOf(owner.address);
    expect(await ownerBalanceAfterBurn).to.equal(ethers.parseEther("5000"));
    expect(await ethers.provider.getBalance(feesReceiver.address)).to.equal(
      "10000040000000000000000",
    );
  });

  it("Should revert if creation fee is not sufficient", async function () {
    const name = "InsufficientFeeToken";
    const symbol = "IFT";
    const initialSupply = ethers.parseEther("100");

    // Set a higher creation fee to intentionally make it insufficient
    await factory.setCreationFee(ethers.parseEther("1"));

    await expect(
      factory.createERC20Token(name, symbol, initialSupply, false, false),
    ).to.be.revertedWith("Insufficient fee");
  });

  it("Should update the creation fee", async function () {
    const newCreationFee = ethers.parseEther("0.1");
    await factory.setCreationFee(newCreationFee);
    expect(await factory.getCreationFee()).to.equal(newCreationFee);
    await factory.createERC20Token("Test", "TEST", 0, true, true, {
      value: newCreationFee,
    });
    expect(await ethers.provider.getBalance(feesReceiver.address)).to.equal(
      "10000140000000000000000",
    );
  });

  it("Should update fees receiver", async function () {
    const newCreationFee = ethers.parseEther("0.1");
    await factory.setFeesReceiver(newFeesReceiver);
    await factory.createERC20Token("Test", "TEST", 0, true, true, {
      value: newCreationFee,
    });
    expect(await ethers.provider.getBalance(newFeesReceiver.address)).to.equal(
      "10000010000000000000000",
    );
    expect(await ethers.provider.getBalance(feesReceiver.address)).to.equal(
      "10000140000000000000000",
    );
  });
});
