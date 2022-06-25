import { CheckCircleIcon, ChevronDownIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Divider,
  Heading,
  List,
  ListIcon,
  ListItem,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { ReactNode, useEffect } from 'react';
import { useAccount } from '../hooks/useAccount';
import { useChain } from '../hooks/useChain';
import { useClaim } from '../hooks/useClaim';
import { useClaimedAmount } from '../hooks/useClaimedAmount';
import { useVerifyWallet } from '../hooks/useVerifyWallet';

const Step = (props: {
  stepNum: number;
  isLast?: boolean;
  achieved: boolean;
  description: ReactNode;
  reward: number;
  rewardToken: string;
}) => (
  <>
    <ListItem w="100%">
      <Box alignItems="center" display="flex">
        <ListIcon
          as={CheckCircleIcon}
          w="5"
          h="5"
          mr="4"
          color={props.achieved ? 'green.400' : 'gray.300'}
        />
        <Box w="100%">
          <Heading size="xs" display="block" mb="1">
            {props.stepNum}.{' '}
            <Text as="span">
              ({props.reward} {props.rewardToken} reward)
            </Text>
          </Heading>
          <Text>{props.description}</Text>
        </Box>
      </Box>
      {!props.isLast && <ChevronDownIcon w="5" h="5" fontWeight="bold" color="gray.400" />}
    </ListItem>
  </>
);

const CurrentReward = (props: {
  isLoading: boolean;
  cumulativeAmount: string | null;
  claimedAmount: string | null;
  rewardToken: string;
}) => {
  if (props.isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <Heading size="lg" as="span" mr="2">
        {props.cumulativeAmount} {props.rewardToken}
      </Heading>
      <Text as="span">
        {' '}
        / {props.claimedAmount} {props.rewardToken} already claimed
      </Text>
    </>
  );
};

const ClaimButton = (props: {
  onClick: () => void;
  isClaiming: boolean;
  isLoading: boolean;
  claimableAmount: number;
  rewardToken: string;
}) => {
  let textElem: ReactNode;
  if (props.isClaiming) {
    textElem = (
      <>
        <Spinner as="span" mr="2" />
        Claiming...
      </>
    );
  } else if (props.isLoading) {
    textElem = <Spinner as="span" mr="2" />;
  } else if (props.claimableAmount > 0) {
    textElem = `Claim ${props.claimableAmount} ${props.rewardToken}`;
  } else {
    textElem = 'Nothing to claim';
  }

  return (
    <Button
      mt="3"
      onClick={props.onClick}
      disabled={props.isLoading || props.isClaiming || !props.claimableAmount}
    >
      {textElem}
    </Button>
  );
};

export const CampaignCard = (props: {
  title: string;
  description: ReactNode;
  steps: { description: ReactNode; reward: number }[];
  campaignId: string;
  contract: ethers.Contract | null;
  chainId: number;
  chainName: string;
  rewardToken: string;
}) => {
  const { verify, verifiedData, isVerifying } = useVerifyWallet(props.campaignId);
  const { claim, isClaiming } = useClaim({
    contract: props.contract,
    rewardToken: props.rewardToken,
    chainId: props.chainId,
  });
  const { checkClaimedAmount, claimedAmount, isLoadingClaimedAmount } = useClaimedAmount({
    contract: props.contract,
    chainId: props.chainId,
  });
  const { account, isLoadingAccount } = useAccount();
  const { chainId } = useChain();

  const chainMatched = chainId === props.chainId;

  const claimableAmount =
    parseFloat(verifiedData?.cumulativeAmount || '0') - parseFloat(claimedAmount || '0');
  const isLoading = isVerifying || isLoadingClaimedAmount;

  const onClickClaim = async () => {
    await claim({ claimableAmount, verifiedData });
    await checkClaimedAmount();
  };

  useEffect(() => {
    verify();
  }, [account, chainId]);

  useEffect(() => {
    checkClaimedAmount();
  }, [account, chainId]);

  return (
    <Box as="li" w="100%" borderWidth="1px" borderRadius="8" p="8" shadow="md" listStyleType="none">
      <VStack spacing="5" align="start" w="100%">
        <Heading size="lg">{props.title}</Heading>
        <Text>{props.description}</Text>

        <Divider />

        <List spacing="1" w="100%">
          {props.steps.map((s, i) => (
            <Step
              key={i}
              stepNum={i + 1}
              achieved={(verifiedData?.completedStepNum || 0) > i}
              description={s.description}
              reward={s.reward}
              rewardToken={props.rewardToken}
              isLast={i === 2}
            />
          ))}
        </List>

        <Divider />

        <VStack w="100%" align="flex-start" spacing="5">
          {account && chainMatched && (
            <>
              <Box>
                <Text>Your total reward now</Text>
                <CurrentReward
                  isLoading={isLoading}
                  cumulativeAmount={verifiedData?.cumulativeAmount || null}
                  claimedAmount={claimedAmount}
                  rewardToken={props.rewardToken}
                />
              </Box>
              <ClaimButton
                onClick={onClickClaim}
                isClaiming={isClaiming}
                isLoading={isLoading}
                claimableAmount={claimableAmount}
                rewardToken={props.rewardToken}
              />
            </>
          )}
          {!isLoadingAccount && !account && (
            <Alert status="warning">
              <AlertIcon />
              Connect wallet to check your reward
            </Alert>
          )}
          {account && !chainMatched && (
            <Alert status="warning">
              <AlertIcon />
              Switch to {props.chainName} network to check claimable reward
            </Alert>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};
