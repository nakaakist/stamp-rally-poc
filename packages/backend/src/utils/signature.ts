import { BigNumber, ethers } from 'ethers';

const toAccountForSignature = (account: string) => '0x' + account.slice(2).toUpperCase();

export const getSignature = async (params: {
  signerPrivateKey: string;
  eip712DomainName: string;
  eip712DomainVersion: string;
  chainId: number;
  chainName: string;
  distributorAddress: string;
  account: string;
  cumulativeAmount: BigNumber;
}) => {
  const signer = new ethers.Wallet(
    params.signerPrivateKey,
    ethers.getDefaultProvider(params.chainName),
  );

  const signature = await signer._signTypedData(
    // Domain
    {
      name: params.eip712DomainName,
      version: params.eip712DomainVersion,
      chainId: params.chainId,
      verifyingContract: params.distributorAddress,
    },
    // Types
    {
      Reward: [
        { name: 'account', type: 'address' },
        { name: 'cumulativeAmount', type: 'uint256' },
      ],
    },
    // Value
    { account: toAccountForSignature(params.account), cumulativeAmount: params.cumulativeAmount },
  );

  return signature;
};
