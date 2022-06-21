import { BigNumber } from 'ethers';

export type CampaignRewardCalculator = (
  account: string,
) => Promise<{ amount: BigNumber; completedStepNum: number }>;
