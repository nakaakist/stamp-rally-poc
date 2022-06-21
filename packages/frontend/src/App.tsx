import { Box, Container } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { GAS_LIMIT, WALLET_VERIFIER_URL } from './constants/constants';
import { useAccount } from './hooks/useAccount';
import { useDistributorContract } from './hooks/useDistributorContract';
import { HEADER_HEIGHT } from './theme';

export const App = () => {
  const { account, checkWallet } = useAccount();
  const { contract, initContract } = useDistributorContract();
  const [data, setData] = useState<{ cumulativeAmount: number; signature: string } | null>(null);

  const checkEligibility = async () => {
    if (!account) return;

    const res = await fetch(`${WALLET_VERIFIER_URL}/${account}`);
    const data = await res.json();

    window.alert(JSON.stringify(data));

    if (data.eligible) {
      setData({
        cumulativeAmount: data.cumulativeAmount || 0,
        signature: data.signature || '',
      });
    }
  };

  const claimReward = async () => {
    if (!contract || !data) return;

    const tx = await contract.claim(account, data.cumulativeAmount, data.signature, {
      gasLimit: GAS_LIMIT,
    });

    await tx.wait();
  };

  useEffect(() => {
    checkWallet();
    initContract();
  }, []);

  return (
    <>
      <Header />
      <Box as="main" pt={HEADER_HEIGHT}>
        <Container>
          <button className="button" onClick={checkEligibility}>
            Check reward eligibility
          </button>

          <button className="button" onClick={claimReward}>
            Claim reward
          </button>
        </Container>
      </Box>
    </>
  );
};
