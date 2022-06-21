import { Box, Container, Heading } from '@chakra-ui/react';
import { useEffect } from 'react';
import { CampaignCard } from './components/CampaignCard';
import { Header } from './components/Header';
import { useAccount } from './hooks/useAccount';
import { useDistributorContract } from './hooks/useDistributorContract';
import { HEADER_HEIGHT } from './theme';

export const App = () => {
  const { checkWallet } = useAccount();
  const { initContract } = useDistributorContract();

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
          <CampaignCard />
        </Container>
      </Box>
    </>
  );
};
