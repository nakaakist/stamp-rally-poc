import { Link } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { Chain, GOERLI_CHAIN, MUMBAI_CHAIN } from './chains';

export type Campaign = {
  title: string;
  description: ReactNode;
  steps: { description: ReactNode; reward: number }[];
  id: string;
  contractAddress: string;
  chain: Chain;
  rewardToken: string;
};

export const CAMPAIGNS: Campaign[] = [
  {
    title: 'Swap three times in Görli Uniswap',
    description: (
      <>
        This is an example stamp rally campaign. It is just a boring stamp rally in a single
        protocol because of the limited availability of subgraphs in the Görli network.
        <br />
        However, it can be easily extended to cross-protocol with appropriate subgraphs.
      </>
    ),
    steps: [...Array(3)].map((_, i) => ({
      description: (
        <>
          Swap any amount of ETH to UNI in{' '}
          <Link href="https://app.uniswap.org/#/swap?chain=goerli" isExternal color="blue.500">
            Görli Uniswap
          </Link>
        </>
      ),
      reward: 0.001,
    })),
    id: 'goerli-uniswap',
    contractAddress: import.meta.env.VITE_GOERLI_UNISWAP_DISTRIBUTOR_ADDRESS || '',
    chain: GOERLI_CHAIN,
    rewardToken: 'ETH',
  },
  {
    title: 'Swap three times in Mumbai Uniswap',
    description: <>This campaign is the same as above, but the chain is Mumbai.</>,
    steps: [...Array(3)].map((_, i) => ({
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
    })),
    id: 'mumbai-uniswap',
    contractAddress: import.meta.env.VITE_MUMBAI_UNISWAP_DISTRIBUTOR_ADDRESS || '',
    chain: MUMBAI_CHAIN,
    rewardToken: 'MATIC',
  },
];
