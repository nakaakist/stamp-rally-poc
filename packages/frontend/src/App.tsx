import { Box, Container, Heading } from '@chakra-ui/react';
import { useEffect } from 'react';
import { CampaignList } from './components/CampaignList';
import { Header } from './components/Header';
import { useAccount } from './hooks/useAccount';
import { useChain } from './hooks/useChain';
import { HEADER_HEIGHT } from './theme';

export const App = () => {
  const { checkWallet } = useAccount();
  const { listenToChainChange } = useChain();

  useEffect(() => {
    checkWallet();
    listenToChainChange();
  }, []);

  return (
    <>
      <Header />
      <Box as="main" pt={HEADER_HEIGHT}>
        <Container maxW="container.md">
          <Heading my="8">Campaigns</Heading>
          <CampaignList />
        </Container>
      </Box>
    </>
  );
};
