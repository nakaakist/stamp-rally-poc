import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { CAMPAIGN_CONFIGS, CAMPAIGN_IDS } from './campaigns';
import { getSignature } from './utils/signature';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // should not be wildcard
  'Access-Control-Allow-Credentials': false,
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const campaignId = event.pathParameters?.campaignId || '';
  const account = event.pathParameters?.address || '';

  if (!(CAMPAIGN_IDS as readonly string[]).includes(campaignId)) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'campaign not found' }),
      headers: corsHeaders,
    };
  }

  const { contract, rewardCalculator } = CAMPAIGN_CONFIGS[campaignId];

  // calculate the cumulative reward amount
  const { amount: cumulativeAmount, completedStepNum } = await rewardCalculator(account);

  // generate a signature to authorize reward claim
  const signature = await getSignature({
    signerPrivateKey: contract.ownerPrivateKey,
    eip712DomainName: contract.eip712DomainName,
    eip712DomainVersion: contract.eip712DomainVersion,
    chainId: contract.eip712DomainChainId,
    distributorAddress: contract.address,
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
