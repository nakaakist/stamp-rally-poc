import { BigNumber } from 'ethers';
import { goerliUniswapConfigs } from './goerli-uniswap';
import { mumbaiUniswapConfigs } from './mumbai-uniswap';

export type CampaignRewardCalculator = (
  account: string,
) => Promise<{ amount: BigNumber; completedStepNum: number }>;

export type CampaignConfig = {
  contract: {
    address: string;
    ownerPrivateKey: string;
    eip712DomainName: string;
    eip712DomainVersion: string;
    eip712DomainChainId: number;
  };
  rewardCalculator: CampaignRewardCalculator;
};

export const CAMPAIGN_IDS = ['goerli-uniswap', 'mumbai-uniswap'] as const;

export const CAMPAIGN_CONFIGS: Record<typeof CAMPAIGN_IDS[number], CampaignConfig> = {
  'goerli-uniswap': goerliUniswapConfigs,
  'mumbai-uniswap': mumbaiUniswapConfigs,
};
