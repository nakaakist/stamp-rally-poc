import { BigNumber } from 'ethers';

export type CampaignRewardCalculator = (account: string) => Promise<BigNumber | null>;
