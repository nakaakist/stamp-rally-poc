import axios from 'axios';
import { BigNumber, ethers } from 'ethers';
import { CampaignRewardCalculator } from '../types';

const START_TIMESTAMP = 1655748913;
const REWARD_PER_SWAP = ethers.utils.parseEther('0.001');
const MAX_SWAP_COUNT = 5;

/**
 * Calculate the reward for uniswap swaps.
 * The reward is (REWARD_PER_SWAP) * MIN(n_swaps, MAX_SWAP_COUNT).
 */
export const uniswapRewardCalculator: CampaignRewardCalculator = async (account: string) => {
  const uniswapEndpoint = 'https://api.thegraph.com/subgraphs/name/compositelabs/uniswap-v3-goerli';

  const uniswapQuery = `
    query account($address: String!, $startTimestamp: Int!) {
      swaps(
        where: {recipient: $address, timestamp_gt: $startTimestamp}
      ) {
        id
        timestamp
        sender
        recipient
      }
    }
  `;

  const graphqlQuery = {
    query: uniswapQuery,
    variables: { address: account.toLowerCase(), startTimestamp: START_TIMESTAMP },
  };

  const response = await axios({
    url: uniswapEndpoint,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    data: graphqlQuery,
  });

  const swaps = response.data?.data?.swaps;

  if (!swaps) {
    return { amount: BigNumber.from(0), completedStepNum: 0 };
  }

  const completedStepNum = swaps.length;
  const amount = BigNumber.from(Math.min(MAX_SWAP_COUNT, completedStepNum)).mul(REWARD_PER_SWAP);

  return { amount, completedStepNum };
};
