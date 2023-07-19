// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20TokenFactory is Ownable {
    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol
    );

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

        ERC20 token;

        if (isMintable && isBurnable && isPausable) {
            token = new MintableBurnablePausableERC20Token(
                name,
                symbol,
                initialSupply
            );
        } else if (isMintable && isBurnable) {
            token = new MintableBurnableERC20Token(name, symbol, initialSupply);
        } else if (isMintable && isPausable) {
            token = new MintablePausableERC20Token(name, symbol, initialSupply);
        } else if (isBurnable && isPausable) {
            token = new BurnablePausableERC20Token(name, symbol, initialSupply);
        } else if (isMintable) {
            token = new MintableERC20Token(name, symbol, initialSupply);
        } else if (isBurnable) {
            token = new BurnableERC20Token(name, symbol, initialSupply);
        } else if (isPausable) {
            token = new PausableERC20Token(name, symbol, initialSupply);
        } else {
            token = new ERC20Token(name, symbol, initialSupply);
        }

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

contract ERC20Token is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }
}

contract MintableERC20Token is ERC20Token, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20Token(name, symbol, initialSupply) {}

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }
}

contract BurnableERC20Token is ERC20Token, ERC20Burnable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20Token(name, symbol, initialSupply) {}
}

contract PausableERC20Token is ERC20Token, Pausable, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20Token(name, symbol, initialSupply) {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}

contract MintableBurnableERC20Token is ERC20Token, ERC20Burnable, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20Token(name, symbol, initialSupply) {}

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }
}

contract MintablePausableERC20Token is ERC20Token, Pausable, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20Token(name, symbol, initialSupply) {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}

contract BurnablePausableERC20Token is
    ERC20Token,
    ERC20Burnable,
    Pausable,
    Ownable
{
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20Token(name, symbol, initialSupply) {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}

contract MintableBurnablePausableERC20Token is
    ERC20Token,
    ERC20Burnable,
    Pausable,
    Ownable
{
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20Token(name, symbol, initialSupply) {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
