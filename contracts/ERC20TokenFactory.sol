// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20TokenFactory  is Ownable {
    event TokenCreated(address indexed tokenAddress, string name, string symbol);

    uint256 private _creationFee;

    constructor(uint256 creationFee) {
        _creationFee = creationFee;
    }

    function createERC20Token(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        bool isMintable,
        bool isBurnable,
        bool isPausable
    ) external payable returns (address) {
        require(msg.value >= _creationFee, "Insufficient fee");

        ERC20Token token;

        if (isMintable && isBurnable && isPausable) {
            token = new MintableBurnablePausableERC20Token(name, symbol);
        } else if (isMintable && isBurnable) {
            token = new MintableBurnableERC20Token(name, symbol);
        } else if (isMintable && isPausable) {
            token = new MintablePausableERC20Token(name, symbol);
        } else if (isBurnable && isPausable) {
            token = new BurnablePausableERC20Token(name, symbol);
        } else if (isMintable) {
            token = new MintableERC20Token(name, symbol);
        } else if (isBurnable) {
            token = new BurnableERC20Token(name, symbol);
        } else if (isPausable) {
            token = new PausableERC20Token(name, symbol);
        } else {
            token = new ERC20Token(name, symbol);
        }

        token._mint(msg.sender, initialSupply);

        emit TokenCreated(address(token), name, symbol);

        if (msg.value > _creationFee) {
            payable(msg.sender).transfer(msg.value - _creationFee);
        }

        return address(token);
    }

    function setCreationFee(uint256 fee) external onlyOwner {
        _creationFee = fee;
    }

    function getCreationFee() external view returns (uint256) {
        return _creationFee;
    }
}

contract ERC20Token is ERC20, ERC20Permit {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) ERC20Permit(name) {}
}

contract MintableERC20Token is ERC20Token {
    constructor(string memory name, string memory symbol) ERC20Token(name, symbol) {}

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }
}

contract BurnableERC20Token is ERC20Token {
    constructor(string memory name, string memory symbol) ERC20Token(name, symbol) {}

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}

contract PausableERC20Token is ERC20Token {
    constructor(string memory name, string memory symbol) ERC20Token(name, symbol) {}

    function pause() external {
        _pause();
    }

    function unpause() external {
        _unpause();
    }
}

contract MintableBurnableERC20Token is MintableERC20Token, BurnableERC20Token {
    constructor(string memory name, string memory symbol) MintableERC20Token(name, symbol) BurnableERC20Token(name, symbol) {}
}

contract MintablePausableERC20Token is MintableERC20Token, PausableERC20Token {
    constructor(string memory name, string memory symbol) MintableERC20Token(name, symbol) PausableERC20Token(name, symbol) {}
}

contract BurnablePausableERC20Token is BurnableERC20Token, PausableERC20Token {
    constructor(string memory name, string memory symbol) BurnableERC20Token(name, symbol) PausableERC20Token(name, symbol) {}
}

contract MintableBurnablePausableERC20Token is MintableERC20Token, BurnableERC20Token, PausableERC20Token {
    constructor(string memory name, string memory symbol) MintableERC20Token(name, symbol) BurnableERC20Token(name, symbol) PausableERC20Token(name, symbol) {}
}

