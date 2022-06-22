import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { uniswapRewardCalculator } from './campaigns/uniswap';
import { getSignature } from './utils/signature';

const EIP712_DOMAIN_NAME = 'stamp-rally-poc';
const EIP712_DOMAIN_VERSION = '0.0.1';
const EIP712_DOMAIN_CHAIN_ID = 5;
const CHAIN_NAME = 'goerli';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // should not be wildcard
  'Access-Control-Allow-Credentials': false,
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const account = event.pathParameters?.address || '';

  // calculate the cumulative reward amount
  const { amount: cumulativeAmount, completedStepNum } = await uniswapRewardCalculator(account);

  // generate a signature to authorize reward claim
  const signature = await getSignature({
    signerPrivateKey: process.env.OWNER_PRIVATE_KEY || '',
    eip712DomainName: EIP712_DOMAIN_NAME,
    eip712DomainVersion: EIP712_DOMAIN_VERSION,
    chainId: EIP712_DOMAIN_CHAIN_ID,
    chainName: CHAIN_NAME,
    distributorAddress: process.env.DISTRIBUTOR_ADDRESS || '',
    account: account,
    cumulativeAmount,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      eligible: true,
      signature,
      account,
      cumulativeAmount: cumulativeAmount.toString(),
      completedStepNum,
    }),
    headers: corsHeaders,
  };
};
