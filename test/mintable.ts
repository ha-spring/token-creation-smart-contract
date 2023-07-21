const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MintableERC20TokenFactory", function () {
  let MintableERC20TokenFactory;
  let factory;
  let owner;
  let addr1;
  let feesReceiver;
  let newFeesReceiver;
  let MintableERC20Token;
  let MintableBurnableERC20Token;
  let MintablePausableERC20Token;
  let MintableBurnablePausableERC20Token;
  let fees = ethers.parseEther("0.01");

  beforeEach(async function () {
    [owner, addr1, feesReceiver, newFeesReceiver] = await ethers.getSigners();

    MintableERC20TokenFactory = await ethers.getContractFactory(
      "MintableERC20TokenFactory",
    );
    factory = await MintableERC20TokenFactory.deploy(fees, feesReceiver);

    MintableERC20Token = await ethers.getContractFactory("MintableERC20Token");
    MintableBurnableERC20Token = await ethers.getContractFactory(
      "MintableBurnableERC20Token",
    );
    MintablePausableERC20Token = await ethers.getContractFactory(
      "MintablePausableERC20Token",
    );
    MintableBurnablePausableERC20Token = await ethers.getContractFactory(
      "MintableBurnablePausableERC20Token",
    );
  });

  it("Should create a mintable ERC20 token", async function () {
    const name = "MyMintableToken";
    const symbol = "MMT";
    const initialSupply = ethers.parseEther("2000");

    const tx = await factory.createERC20Token(
      name,
      symbol,
      initialSupply,
      true,
      false,
      false,
      { value: fees },
    );
    const receipt = await tx.wait();
    const TokenCreatedLog = receipt.logs.filter(
      (log) => log?.fragment?.name === "TokenCreated",
    );
    const tokenAddress = TokenCreatedLog[0].args[0];
    const token = await MintableERC20Token.attach(tokenAddress);

    await token.mint(owner.address, ethers.parseEther("10"));
    const ownerBalance = await token.balanceOf(owner.address);

    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await ownerBalance).to.equal(ethers.parseEther("2010"));
    expect(await ethers.provider.getBalance(feesReceiver.address)).to.equal(
      "10000010000000000000000",
    );
  });

  it("Should create a mintable and burnable ERC20 token", async function () {
    const name = "MyMintableBurnableToken";
    const symbol = "MMBT";
    const initialSupply = ethers.parseEther("5000");

    const tx = await factory.createERC20Token(
      name,
      symbol,
      initialSupply,
      true,
      true,
      false,
      { value: fees },
    );
    const receipt = await tx.wait();
    const TokenCreatedLog = receipt.logs.filter(
      (log) => log?.fragment?.name === "TokenCreated",
    );
    const tokenAddress = TokenCreatedLog[0].args[0];
    const token = await MintableBurnableERC20Token.attach(tokenAddress);
    await token.mint(owner.address, ethers.parseEther("1000"));
    const ownerBalance = await token.balanceOf(owner.address);

    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await ownerBalance).to.equal(ethers.parseEther("6000"));

    await token.burn(ethers.parseEther("3000"));
    const ownerBalanceAfterBurn = await token.balanceOf(owner.address);
    expect(await ownerBalanceAfterBurn).to.equal(ethers.parseEther("3000"));
    expect(await ethers.provider.getBalance(feesReceiver.address)).to.equal(
      "10000020000000000000000",
    );
  });

  it("Should create a mintable and pausable ERC20 token", async function () {
    const name = "MyMintablePausableToken";
    const symbol = "MMPT";
    const initialSupply = ethers.parseEther("6000");

    const tx = await factory
      .connect(addr1)
      .createERC20Token(name, symbol, initialSupply, true, false, true, {
        value: fees,
      });
    const receipt = await tx.wait();
    const TokenCreatedLog = receipt.logs.filter(
      (log) => log?.fragment?.name === "TokenCreated",
    );
    const tokenAddress = TokenCreatedLog[0].args[0];
    const token = await MintablePausableERC20Token.attach(tokenAddress);
    await token.connect(addr1).mint(addr1.address, ethers.parseEther("1000"));
    const ownerBalance = await token.balanceOf(addr1.address);

    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await ownerBalance).to.equal(ethers.parseEther("7000"));

    await token.connect(addr1).pause();
    await expect(
      token.connect(addr1).mint(owner.address, ethers.parseEther("1000")),
    ).to.be.revertedWith("Pausable: paused");
    await token.connect(addr1).unpause();
    await token.connect(addr1).mint(addr1.address, ethers.parseEther("1000"));
    const ownerBalanceAfterPause = await token.balanceOf(addr1.address);
    expect(await ownerBalanceAfterPause).to.equal(ethers.parseEther("8000"));
    expect(await ethers.provider.getBalance(feesReceiver.address)).to.equal(
      "10000030000000000000000",
    );
  });

  it("Should create a mintable, burnable, and pausable ERC20 token", async function () {
    const name = "MyAllFeaturesToken";
    const symbol = "MAT";
    const initialSupply = ethers.parseEther("8000");

    const tx = await factory.createERC20Token(
      name,
      symbol,
      initialSupply,
      true,
      true,
      true,
      { value: fees },
    );
    const receipt = await tx.wait();
    const TokenCreatedLog = receipt.logs.filter(
      (log) => log?.fragment?.name === "TokenCreated",
    );
    const tokenAddress = TokenCreatedLog[0].args[0];
    const token = await MintableBurnablePausableERC20Token.attach(tokenAddress);
    await token.mint(owner.address, ethers.parseEther("1000"));
    const ownerBalance = await token.balanceOf(owner.address);

    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await ownerBalance).to.equal(ethers.parseEther("9000"));

    await token.pause();
    await expect(
      token.mint(owner.address, ethers.parseEther("1000")),
    ).to.be.revertedWith("Pausable: paused");
    await token.unpause();
    await token.mint(owner.address, ethers.parseEther("1000"));
    const ownerBalanceAfterPause = await token.balanceOf(owner.address);
    expect(await ownerBalanceAfterPause).to.equal(ethers.parseEther("10000"));

    await token.burn(ethers.parseEther("3000"));
    const ownerBalanceAfterBurn = await token.balanceOf(owner.address);
    expect(await ownerBalanceAfterBurn).to.equal(ethers.parseEther("7000"));
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
      factory.createERC20Token(
        name,
        symbol,
        initialSupply,
        false,
        false,
        false,
      ),
    ).to.be.revertedWith("Insufficient fee");
  });

  it("Should update the creation fee", async function () {
    const newCreationFee = ethers.parseEther("0.1");
    await factory.setCreationFee(newCreationFee);
    expect(await factory.getCreationFee()).to.equal(newCreationFee);
    await factory.createERC20Token("Test", "TEST", 0, true, true, true, {
      value: newCreationFee,
    });
    expect(await ethers.provider.getBalance(feesReceiver.address)).to.equal(
      "10000140000000000000000",
    );
  });

  it("Should update fees receiver", async function () {
    const newCreationFee = ethers.parseEther("0.1");
    await factory.setFeesReceiver(newFeesReceiver);
    await factory.createERC20Token("Test", "TEST", 0, true, true, true, {
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
