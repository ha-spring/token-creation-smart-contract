// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC20Token.sol";

library MintableERC20TokenLibrary {
    function createMintableToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address msgSender
    ) internal returns (MintableERC20Token) {
        return new MintableERC20Token(name, symbol, initialSupply, msgSender);
    }

    function createMintableBurnableToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address msgSender
    ) internal returns (MintableBurnableERC20Token) {
        return
            new MintableBurnableERC20Token(
                name,
                symbol,
                initialSupply,
                msgSender
            );
    }

    function createMintablePausableToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address msgSender
    ) internal returns (MintablePausableERC20Token) {
        return
            new MintablePausableERC20Token(
                name,
                symbol,
                initialSupply,
                msgSender
            );
    }

    function createMintableBurnablePausableToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address msgSender
    ) internal returns (MintableBurnablePausableERC20Token) {
        return
            new MintableBurnablePausableERC20Token(
                name,
                symbol,
                initialSupply,
                msgSender
            );
    }
}

contract MintableERC20TokenFactory is Ownable {
    using MintableERC20TokenLibrary for *;

    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol
    );

    uint256 private _creationFee;
    address private _feesReceiver;

    constructor(uint256 creationFee, address feesReceiver) {
        require(feesReceiver != address(0), "Invalid receiver address");
        _creationFee = creationFee;
        _feesReceiver = feesReceiver;
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
            token = MintableERC20TokenLibrary
                .createMintableBurnablePausableToken(
                    name,
                    symbol,
                    initialSupply,
                    msg.sender
                );
        } else if (isMintable && isBurnable) {
            token = MintableERC20TokenLibrary.createMintableBurnableToken(
                name,
                symbol,
                initialSupply,
                msg.sender
            );
        } else if (isMintable && isPausable) {
            token = MintableERC20TokenLibrary.createMintablePausableToken(
                name,
                symbol,
                initialSupply,
                msg.sender
            );
        } else if (isMintable) {
            token = MintableERC20TokenLibrary.createMintableToken(
                name,
                symbol,
                initialSupply,
                msg.sender
            );
        }

        payable(_feesReceiver).transfer(_creationFee);

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

    function setFeesReceiver(address receiver) external onlyOwner {
        require(receiver != address(0), "Invalid receiver address");
        _feesReceiver = receiver;
    }

    function getFeesReceiver() external view returns (address) {
        return _feesReceiver;
    }
}

contract MintableERC20Token is ERC20Token, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address msgSender
    ) ERC20Token(name, symbol, initialSupply, msgSender) {
        _transferOwnership(msgSender);
    }

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }
}

contract MintableBurnableERC20Token is ERC20Token, ERC20Burnable, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address msgSender
    ) ERC20Token(name, symbol, initialSupply, msgSender) {
        _transferOwnership(msgSender);
    }

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }
}

contract MintablePausableERC20Token is ERC20Token, Pausable, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address msgSender
    ) ERC20Token(name, symbol, initialSupply, msgSender) {
        _transferOwnership(msgSender);
    }

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

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
        uint256 initialSupply,
        address msgSender
    ) ERC20Token(name, symbol, initialSupply, msgSender) {
        _transferOwnership(msgSender);
    }

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

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
