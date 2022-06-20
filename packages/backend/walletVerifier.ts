import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import axios from 'axios';
import { ethers, Wallet } from 'ethers';

// Query is hard-coded now. It should be configurable.
const endpoint = 'https://api.thegraph.com/subgraphs/name/messari/sushiswap-ethereum';

const tokensQuery = `
query account($address: String!) {
account(id: $address) {
  id
}
}
`;

// cumulative reward amount is hard-coded now. It should be configurable.
const cumulativeAmount = 10;

const toAccountForSignature = (account: string) => '0x' + account.slice(2).toUpperCase();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

const getSignature = async (params: {
  signer: Wallet;
  chainId: number;
  distributorAddress: string;
  account: string;
  cumulativeAmount: number;
}) => {
  const signature = await params.signer._signTypedData(
    // Domain
    {
      name: 'stamp-rally-poc',
      version: '0.0.1',
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
    { account: params.account, cumulativeAmount: params.cumulativeAmount },
  );

  return signature;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const address = event.pathParameters?.address || '';

  // check if wallet is eligible for reward

  const graphqlQuery = {
    query: tokensQuery,
    variables: { address: address.toLowerCase() },
  };

  const response = await axios({
    url: endpoint,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    data: graphqlQuery,
  });

  const account = response.data?.data?.account?.id;

  if (!account) {
    return {
      statusCode: 200,
      body: JSON.stringify({ eligible: false }),
      headers: corsHeaders,
    };
  }

  // generate a signature to authorize reward claim

  // Environment variable is not secure to store private key. Should use secret manager.
  const signer = new ethers.Wallet(
    process.env.OWNER_PRIVATE_KEY || '',
    ethers.getDefaultProvider('rinkeby'), // Just to prevent error. Rinkeby is not related to the actual network.
  );

  const signature = await getSignature({
    signer,
    chainId: parseInt(process.env.CHAIN_ID || '0'),
    distributorAddress: process.env.DISTRIBUTOR_ADDRESS || '',
    account: toAccountForSignature(account.toString()),
    cumulativeAmount,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ eligible: true, signature, account, cumulativeAmount }),
    headers: corsHeaders,
  };
};
