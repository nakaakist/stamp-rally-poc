import { Link, VStack } from '@chakra-ui/react';
import abi from '../constants/distributorAbi.json';
import { getContract } from '../utils/getContract';
import { CampaignCard } from './CampaignCard';

export const CampaignList = () => {
  return (
    <VStack as="ul" spacing="4" mb="8">
      <CampaignCard
        title="Swap three times in Görli Uniswap"
        description={
          <>
            This is an example stamp rally campaign. It is just a boring stamp rally in a single
            protocol because of the limited availability of subgraphs in the Görli network.
            <br />
            However, it can be easily extended to cross-protocol with appropriate subgraphs.
          </>
        }
        steps={[...Array(3)].map((_, i) => ({
          description: (
            <>
              Swap any amount of ETH to UNI in{' '}
              <Link href="https://app.uniswap.org/#/swap?chain=goerli" isExternal color="blue.500">
                Görli Uniswap
              </Link>
            </>
          ),
          reward: 0.001,
        }))}
        campaignId="goerli-uniswap"
        contract={getContract({
          address: import.meta.env.VITE_GOERLI_UNISWAP_DISTRIBUTOR_ADDRESS || '',
          abi,
        })}
        chainId="5"
        chainName="Görli"
        rewardToken="ETH"
      />
      <CampaignCard
        title="Swap three times in Mumbai Uniswap"
        description={<>This campaign is the same as above, but the chain is Mumbai.</>}
        steps={[...Array(3)].map((_, i) => ({
          description: (
            <>
              Swap any amount of MATIC to UNI in{' '}
              <Link
                href="https://app.uniswap.org/#/swap?chain=polygon-mumbai"
                isExternal
                color="blue.500"
              >
                Mumbai Uniswap
              </Link>
            </>
          ),
          reward: 0.001,
        }))}
        campaignId="mumbai-uniswap"
        contract={getContract({
          address: import.meta.env.VITE_MUMBAI_UNISWAP_DISTRIBUTOR_ADDRESS || '',
          abi,
        })}
        chainId="80001"
        chainName="Mumbai"
        rewardToken="MATIC"
      />
    </VStack>
  );
};
