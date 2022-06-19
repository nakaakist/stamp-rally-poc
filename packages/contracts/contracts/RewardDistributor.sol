//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract RewardDistributor is EIP712, Ownable {
  using SafeERC20 for IERC20;

  // ERC20 token address to use as rewards
  address public token;
  // Mapping between addresses and the total reward amounts given to them so far
  mapping(address => uint256) public cumulativeClaimedAmounts;

  event Claimed(address indexed account, uint256 cumulativeAmount, uint256 amount);

  constructor(address token_) EIP712('stamp-rally-poc', '0.0.1') {
    token = token_;
    console.log('Deploying a distributor');
  }

  function claim(
    address account,
    uint256 cumulativeAmount,
    bytes calldata signature
  ) public {
    // Check signature
    require(_verify(_hash(account, cumulativeAmount), signature), 'Invalid signature');
    console.log(account, 'claimed', cumulativeAmount);

    // Check if there is a reward to claim
    uint256 preclaimed = cumulativeClaimedAmounts[account];
    require(preclaimed < cumulativeAmount, 'Nothing to claim');
    cumulativeClaimedAmounts[account] = cumulativeAmount;

    // Send the token
    uint256 amount = cumulativeAmount - preclaimed;
    IERC20(token).safeTransfer(account, amount);

    emit Claimed(account, cumulativeAmount, amount);
  }

  function _hash(address account, uint256 cumulativeAmount) internal view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            keccak256('Reward(uint256 account,address cumulativeAmount)'),
            account,
            cumulativeAmount
          )
        )
      );
  }

  function _verify(bytes32 digest, bytes calldata signature) internal view returns (bool) {
    return owner() == ECDSA.recover(digest, signature);
  }
}
