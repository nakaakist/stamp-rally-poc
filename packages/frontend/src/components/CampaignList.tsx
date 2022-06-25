import { VStack } from '@chakra-ui/react';
import { CAMPAIGNS } from '../constants/campaigns';
import abi from '../constants/distributorAbi.json';
import { getContract } from '../utils/getContract';
import { CampaignCard } from './CampaignCard';

export const CampaignList = () => {
  return (
    <VStack as="ul" spacing="4" mb="8">
      {CAMPAIGNS.map((c) => (
        <CampaignCard
          key={c.id}
          title={c.title}
          description={c.description}
          steps={c.steps}
          campaignId={c.id}
          contract={getContract({
            address: c.contractAddress,
            abi,
          })}
          chainId={c.chain.id}
          chainName={c.chain.name}
          rewardToken={c.rewardToken}
        />
      ))}
    </VStack>
  );
};
