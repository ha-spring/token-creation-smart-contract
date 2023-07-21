// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC20Token.sol";

library OtherERC20TokenLibrary {
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address msgSender
    ) internal returns (ERC20Token) {
        return new ERC20Token(name, symbol, initialSupply, msgSender);
    }

    function createBurnableToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address msgSender
    ) internal returns (BurnableERC20Token) {
        return new BurnableERC20Token(name, symbol, initialSupply, msgSender);
    }

    function createPausableToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address msgSender
    ) internal returns (PausableERC20Token) {
        return new PausableERC20Token(name, symbol, initialSupply, msgSender);
    }

    function createBurnablePausableToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address msgSender
    ) internal returns (BurnablePausableERC20Token) {
        return
            new BurnablePausableERC20Token(
                name,
                symbol,
                initialSupply,
                msgSender
            );
    }
}

contract OtherERC20TokenFactory is Ownable {
    using OtherERC20TokenLibrary for *;

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
        bool isBurnable,
        bool isPausable
    ) external payable returns (address) {
        require(msg.value >= _creationFee, "Insufficient fee");

        ERC20Token token;

        if (isBurnable && isPausable) {
            token = OtherERC20TokenLibrary.createBurnablePausableToken(
                name,
                symbol,
                initialSupply,
                msg.sender
            );
        } else if (isBurnable) {
            token = OtherERC20TokenLibrary.createBurnableToken(
                name,
                symbol,
                initialSupply,
                msg.sender
            );
        } else if (isPausable) {
            token = OtherERC20TokenLibrary.createPausableToken(
                name,
                symbol,
                initialSupply,
                msg.sender
            );
        } else {
            token = OtherERC20TokenLibrary.createToken(
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

contract BurnableERC20Token is ERC20Token, ERC20Burnable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address msgSender
    ) ERC20Token(name, symbol, initialSupply, msgSender) {}
}

contract PausableERC20Token is ERC20Token, Pausable, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address msgSender
    ) ERC20Token(name, symbol, initialSupply, msgSender) {
        _transferOwnership(msgSender);
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

contract BurnablePausableERC20Token is
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
