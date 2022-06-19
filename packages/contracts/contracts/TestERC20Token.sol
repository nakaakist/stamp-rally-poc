// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

// Mock ERC20 token for local test.
contract TestERC20Token is ERC20 {
  constructor(uint256 initialSupply) ERC20('Gold', 'GLD') {
    _mint(msg.sender, initialSupply);
  }
}
