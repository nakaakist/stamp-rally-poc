//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract RewardDistributor is EIP712, Ownable {
  using SafeERC20 for IERC20;

  // Whether the reward is ERC20 token or not (if not, ETH is used)
  bool public isUsingERC20Token;
  // ERC20 token address to use as rewards
  address public token;
  // Mapping between addresses and the total reward amounts given to them so far
  mapping(address => uint256) public cumulativeClaimedAmounts;

  event Claimed(address indexed account, uint256 cumulativeAmount, uint256 amount);

  constructor(bool isUsingERC20Token_, address token_) payable EIP712('stamp-rally-poc', '0.0.1') {
    isUsingERC20Token = isUsingERC20Token_;
    token = token_;
    console.log('Deploying a distributor');
  }

  function resetClaimedAmount(address account) public onlyOwner {
    cumulativeClaimedAmounts[account] = 0;
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
    if (isUsingERC20Token) {
      IERC20(token).safeTransfer(account, amount);
    } else {
      (bool success, ) = (account).call{value: amount}('');
      require(success, 'Failed to transfer eth');
    }

    emit Claimed(account, cumulativeAmount, amount);
  }

  function _hash(address account, uint256 cumulativeAmount) internal view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            keccak256('Reward(address account,uint256 cumulativeAmount)'),
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
