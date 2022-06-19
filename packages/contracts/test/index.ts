import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
// eslint-disable-next-line node/no-missing-import
import { RewardDistributor, TestERC20Token } from '../typechain';

const deployDistributor = async (token: string) => {
  const Contract = await ethers.getContractFactory('RewardDistributor');
  const contract = await Contract.deploy(token);
  await contract.deployed();
  return contract;
};

const deployToken = async (totalSupply: number) => {
  const Contract = await ethers.getContractFactory('TestERC20Token');
  const contract = await Contract.deploy(totalSupply);
  await contract.deployed();
  return contract;
};

const getSignature = async (params: {
  owner: SignerWithAddress;
  chainId: number;
  distributor: Contract;
  account: string;
  cumulativeAmount: number;
}) => {
  const signature = await params.owner._signTypedData(
    // Domain
    {
      name: 'stamp-rally-poc',
      version: '0.0.1',
      chainId,
      verifyingContract: params.distributor.address,
    },
    // Types
    {
      Reward: [
        { name: 'account', type: 'address' },
        { name: 'cumulativeAmount', type: 'uint256' },
      ],
    },
    // Value
    { account: params.account, cumulativeAmount: params.cumulativeAmount },
  );

  return signature;
};

let owner: SignerWithAddress;
let randomPerson: SignerWithAddress;
let chainId: number;
let token: TestERC20Token;
let distributor: RewardDistributor;

describe('Token distributor', function () {
  before(async () => {
    const signers = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    owner = signers[0];
    randomPerson = signers[1];
    chainId = network.chainId;
  });

  beforeEach(async () => {
    token = await deployToken(100);
    distributor = await deployDistributor(token.address);

    const depositTx = await token.transfer(distributor.address, 100);
    await depositTx.wait();
  });

  it('Should transfer token on claim with valid signature', async () => {
    const signature = await getSignature({
      owner,
      chainId,
      distributor,
      account: randomPerson.address,
      cumulativeAmount: 50,
    });

    const claimTx = await distributor.claim(randomPerson.address, 50, signature);
    await claimTx.wait();

    expect(await token.balanceOf(randomPerson.address)).to.equal(50);
  });

  it('Should transfer additional token on claim if cumulativeAmount is increased by owner', async () => {
    const signature = await getSignature({
      owner,
      distributor,
      chainId,
      account: randomPerson.address,
      cumulativeAmount: 50,
    });

    const claimTx = await distributor.claim(randomPerson.address, 50, signature);
    await claimTx.wait();

    const balance1 = await token.balanceOf(randomPerson.address);

    const signature2 = await getSignature({
      owner,
      distributor,
      chainId,
      account: randomPerson.address,
      cumulativeAmount: 70,
    });

    const claimTx2 = await distributor.claim(randomPerson.address, 70, signature2);
    await claimTx2.wait();

    const balance2 = await token.balanceOf(randomPerson.address);

    expect(balance1).to.equal(50);
    expect(balance2).to.equal(70);
  });

  it('Should fail on duplicate transfer', async () => {
    const signature = await getSignature({
      owner,
      distributor,
      chainId,
      account: randomPerson.address,
      cumulativeAmount: 50,
    });

    const claimTx = await distributor.claim(randomPerson.address, 50, signature);
    await claimTx.wait();

    await expect(distributor.claim(randomPerson.address, 50, signature)).to.be.revertedWith(
      'Nothing to claim',
    );
    expect(await token.balanceOf(randomPerson.address)).to.equal(50);
  });

  it('Should fail on claim with invalid signature (invalid cumulativeAmount)', async () => {
    const signature = await getSignature({
      owner,
      distributor,
      chainId,
      account: randomPerson.address,
      cumulativeAmount: 70,
    });

    await expect(distributor.claim(randomPerson.address, 50, signature)).to.be.revertedWith(
      'Invalid signature',
    );
  });

  it('Should fail on claim with invalid signature (invalid signer)', async () => {
    const signature = await getSignature({
      owner: randomPerson,
      distributor,
      chainId,
      account: randomPerson.address,
      cumulativeAmount: 50,
    });

    await expect(distributor.claim(randomPerson.address, 50, signature)).to.be.revertedWith(
      'Invalid signature',
    );
  });

  it('Should fail on claim if token balance of distributor is not enough', async () => {
    const signature = await getSignature({
      owner,
      distributor,
      chainId,
      account: randomPerson.address,
      cumulativeAmount: 150,
    });

    await expect(distributor.claim(randomPerson.address, 150, signature)).to.be.revertedWith(
      'ERC20: transfer amount exceeds balance',
    );
  });
});
