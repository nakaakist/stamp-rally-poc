import { Box, Container, Heading, Link } from '@chakra-ui/react';
import { useEffect } from 'react';
import { CampaignCard } from './components/CampaignCard';
import { Header } from './components/Header';
import { useAccount } from './hooks/useAccount';
import { useDistributorContract } from './hooks/useDistributorContract';
import { HEADER_HEIGHT } from './theme';

export const App = () => {
  const { checkWallet } = useAccount();
  const { contract, initContract } = useDistributorContract();

  useEffect(() => {
    checkWallet();
    initContract();
  }, []);

  return (
    <>
      <Header />
      <Box as="main" pt={HEADER_HEIGHT}>
        <Container maxW="container.md">
          <Heading my="8">Campaigns</Heading>
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
                  <Link
                    href="https://app.uniswap.org/#/swap?chain=goerli"
                    isExternal
                    color="blue.500"
                  >
                    Görli Uniswap
                  </Link>
                </>
              ),
              reward: '0.001 ETH',
            }))}
            campaignId="goerli-uniswap"
            contract={contract}
            chainId={5}
          />
        </Container>
      </Box>
    </>
  );
};
