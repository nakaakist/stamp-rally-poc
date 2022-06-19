import { ethers } from 'hardhat';

async function main() {
  const Distributor = await ethers.getContractFactory('RewardDistributor');
  // token address is hard-coded (MATIC). Should be configurable in the future.
  const distributor = await Distributor.deploy('0x0000000000000000000000000000000000001010');

  await distributor.deployed();

  console.log('distributor deployed to:', distributor.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
