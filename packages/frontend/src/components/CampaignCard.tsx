import { CheckCircleIcon, ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Heading,
  HStack,
  List,
  ListIcon,
  ListItem,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { GAS_LIMIT, WALLET_VERIFIER_URL } from '../constants/constants';
import { useAccount } from '../hooks/useAccount';
import { useDistributorContract } from '../hooks/useDistributorContract';
import { createToast } from '../utils/createToast';

const Step = (props: {
  stepNum: number;
  isLast?: boolean;
  achieved: boolean;
  description: string;
  reward: string;
}) => (
  <>
    <ListItem w="100%">
      <Box alignItems="center" display="flex">
        <ListIcon
          as={CheckCircleIcon}
          w="5"
          h="5"
          mr="4"
          color={props.achieved ? 'teal.300' : 'gray.300'}
        />
        <Box w="100%">
          <Heading size="xs" display="block" mb="1">
            {props.stepNum}. <Text as="span">({props.reward} reward)</Text>
          </Heading>
          <Text>{props.description}</Text>
        </Box>
      </Box>
      {!props.isLast && <ChevronDownIcon w="5" h="5" fontWeight="bold" color="gray.400" />}
    </ListItem>
  </>
);

export const CampaignCard = () => {
  const [data, setData] = useState<{
    cumulativeAmount: number;
    signature: string;
    completedStepNum: number;
  } | null>(null);
  const { account } = useAccount();
  const { contract } = useDistributorContract();

  const checkEligibility = async () => {
    if (!account) return;

    const res = await fetch(`${WALLET_VERIFIER_URL}/${account}`);
    const data = await res.json();

    if (data.eligible) {
      setData({
        cumulativeAmount: data.cumulativeAmount || 0,
        signature: data.signature || '',
        completedStepNum: data.completedStepNum || 0,
      });
      createToast({
        title: `You completed ${data.completedStepNum || 0} steps!`,
        description: 'You can claim reward',
        status: 'success',
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
  return (
    <Box w="100%" borderWidth="1px" borderRadius="8" p="8" shadow="md">
      <VStack spacing="5" align="start" w="100%">
        <Heading size="lg">Swap five times in Görli</Heading>
        <Text textAlign="justify">
          This is an example stamp rally campaign. It is just a boring stamp rally in a single
          protocol because of the limited availability of subgraphs in the test network.
          <br />
          However, it can be easily extended to cross-protocol with appropriate subgraphs.
        </Text>
        <List spacing="1" w="100%">
          {[...Array(5)].map((_, i) => (
            <Step
              stepNum={i + 1}
              achieved={(data?.completedStepNum || 0) > i}
              description="Swap any amount of ETH to UNI in Uniswap Görli"
              reward="0.001 ETH"
              isLast={i === 4}
            />
          ))}
        </List>

        <HStack>
          <Button onClick={checkEligibility}>Check reward eligibility</Button>

          <Button className="button" onClick={claimReward}>
            Claim reward
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};
